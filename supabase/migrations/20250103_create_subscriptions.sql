-- ============================================================================
-- Migration: Système d'abonnement pour OsKaR
-- Date: 2025-01-03
-- Description: Création des tables pour gérer les plans Free, Pro, Team, Unlimited
-- ============================================================================

-- ============================================================================
-- 1. ENUM pour les types de plans
-- ============================================================================

create type subscription_plan_type as enum ('free', 'pro', 'team', 'unlimited');
create type subscription_status as enum ('active', 'cancelled', 'expired', 'trialing');

-- ============================================================================
-- 2. TABLE subscription_plans (Référence des plans disponibles)
-- ============================================================================

create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  plan_type subscription_plan_type unique not null,
  display_name text not null,
  description text,
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2),
  max_users integer not null default 1, -- -1 = illimité
  max_ambitions integer not null default 3, -- -1 = illimité
  features jsonb default '{}'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour recherche rapide
create index subscription_plans_plan_type_idx on subscription_plans(plan_type);
create index subscription_plans_is_active_idx on subscription_plans(is_active);

-- ============================================================================
-- 3. TABLE subscriptions (Abonnements des utilisateurs)
-- ============================================================================

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  plan_type subscription_plan_type not null default 'free',
  status subscription_status not null default 'active',
  started_at timestamptz default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  billing_cycle text, -- 'monthly' ou 'yearly'
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Contraintes
  constraint unique_user_subscription unique (user_id)
);

-- Index pour recherche rapide
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_plan_type_idx on subscriptions(plan_type);
create index subscriptions_status_idx on subscriptions(status);
create index subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);
create index subscriptions_stripe_subscription_id_idx on subscriptions(stripe_subscription_id);

-- ============================================================================
-- 4. TRIGGER pour updated_at
-- ============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_subscription_plans_updated_at
  before update on subscription_plans
  for each row
  execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 5. FONCTION pour créer un abonnement Free par défaut
-- ============================================================================

create or replace function create_default_subscription()
returns trigger as $$
begin
  insert into subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour créer automatiquement un abonnement Free à l'inscription
create trigger on_profile_created
  after insert on profiles
  for each row
  execute function create_default_subscription();

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- subscription_plans : Lecture publique (pour afficher les prix)
alter table subscription_plans enable row level security;

create policy "Anyone can view active subscription plans"
  on subscription_plans for select
  using (is_active = true);

-- subscriptions : Chaque utilisateur voit uniquement son abonnement
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

-- ============================================================================
-- 7. DONNÉES INITIALES (Plans de base)
-- ============================================================================

insert into subscription_plans (plan_type, display_name, description, price_monthly, price_yearly, max_users, max_ambitions, features) values
  (
    'free',
    'Free',
    'Parfait pour tester la méthodologie OKR',
    0,
    0,
    1,
    3,
    '{
      "export_pdf": "basic",
      "support": "community",
      "ai_coach_suggestions": 10,
      "analytics": false,
      "integrations": false,
      "priority_support": false
    }'::jsonb
  ),
  (
    'pro',
    'Pro',
    'Sweet spot pour les PME',
    19,
    190,
    5,
    -1,
    '{
      "export_pdf": "advanced",
      "support": "email",
      "ai_coach_suggestions": -1,
      "analytics": "basic",
      "integrations": "basic",
      "priority_support": false,
      "quarterly_objectives_per_ambition": 1
    }'::jsonb
  ),
  (
    'team',
    'Team',
    'Pour les équipes en croissance',
    49,
    490,
    20,
    -1,
    '{
      "export_pdf": "advanced",
      "support": "priority",
      "ai_coach_suggestions": -1,
      "analytics": "advanced",
      "integrations": "advanced",
      "priority_support": true,
      "quarterly_objectives_per_ambition": -1,
      "roles_permissions": true
    }'::jsonb
  ),
  (
    'unlimited',
    'Unlimited',
    'Plan spécial sans limites (attribution manuelle)',
    0,
    0,
    -1,
    -1,
    '{
      "export_pdf": "advanced",
      "support": "priority",
      "ai_coach_suggestions": -1,
      "analytics": "advanced",
      "integrations": "advanced",
      "priority_support": true,
      "quarterly_objectives_per_ambition": -1,
      "roles_permissions": true,
      "custom_features": true
    }'::jsonb
  );

-- ============================================================================
-- 8. FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour vérifier si un utilisateur peut créer une ambition
create or replace function can_create_ambition(p_user_id uuid)
returns boolean as $$
declare
  v_max_ambitions integer;
  v_current_count integer;
begin
  -- Récupérer la limite d'ambitions du plan
  select sp.max_ambitions into v_max_ambitions
  from subscriptions s
  join subscription_plans sp on s.plan_type = sp.plan_type
  where s.user_id = p_user_id and s.status = 'active';
  
  -- Si pas d'abonnement trouvé, retourner false
  if v_max_ambitions is null then
    return false;
  end if;
  
  -- Si illimité (-1), retourner true
  if v_max_ambitions = -1 then
    return true;
  end if;
  
  -- Compter les ambitions actuelles
  select count(*) into v_current_count
  from ambitions
  where user_id = p_user_id;
  
  -- Vérifier si on peut en créer une de plus
  return v_current_count < v_max_ambitions;
end;
$$ language plpgsql security definer;

-- Fonction pour vérifier si un utilisateur peut ajouter un membre à son équipe
create or replace function can_add_team_member(p_user_id uuid, p_team_id uuid)
returns boolean as $$
declare
  v_max_users integer;
  v_current_count integer;
begin
  -- Récupérer la limite d'utilisateurs du plan
  select sp.max_users into v_max_users
  from subscriptions s
  join subscription_plans sp on s.plan_type = sp.plan_type
  where s.user_id = p_user_id and s.status = 'active';
  
  -- Si pas d'abonnement trouvé, retourner false
  if v_max_users is null then
    return false;
  end if;
  
  -- Si illimité (-1), retourner true
  if v_max_users = -1 then
    return true;
  end if;
  
  -- Compter les membres actuels de l'équipe
  select count(*) into v_current_count
  from team_members
  where team_id = p_team_id;
  
  -- Vérifier si on peut en ajouter un de plus
  return v_current_count < v_max_users;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

