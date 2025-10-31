-- ============================================================================
-- FIX: Récursion infinie dans les politiques RLS de team_members
-- ============================================================================
-- 
-- Problème: Les politiques RLS de team_members se référencent elles-mêmes,
-- créant une récursion infinie.
-- 
-- Solution temporaire: Désactiver RLS sur teams et team_members car on ne
-- les utilise pas encore (Phase 3 = mode solo uniquement).
-- On les réactivera en Phase 5 (Collaboration).
-- 
-- ============================================================================

-- 1. Supprimer les politiques RLS problématiques de team_members
drop policy if exists "Team members can view team members" on team_members;
drop policy if exists "Team admins can manage members" on team_members;

-- 2. Supprimer les politiques RLS de teams
drop policy if exists "Team members can view their teams" on teams;
drop policy if exists "Team owners can update their teams" on teams;
drop policy if exists "Users can create teams" on teams;

-- 3. Désactiver RLS sur ces tables (temporairement)
alter table team_members disable row level security;
alter table teams disable row level security;

-- 4. Créer des politiques RLS simples pour teams (sans référence à team_members)
alter table teams enable row level security;

create policy "Users can view their own teams"
  on teams for select
  using (owner_id = auth.uid());

create policy "Users can update their own teams"
  on teams for update
  using (owner_id = auth.uid());

create policy "Users can create teams"
  on teams for insert
  with check (owner_id = auth.uid());

create policy "Users can delete their own teams"
  on teams for delete
  using (owner_id = auth.uid());

-- 5. Note: team_members reste sans RLS pour l'instant
-- On ajoutera des politiques RLS correctes en Phase 5 quand on implémentera
-- la collaboration multi-utilisateurs.

-- ============================================================================
-- Vérification: Les tables suivantes doivent avoir RLS activé et fonctionnel
-- ============================================================================
-- ✅ profiles (RLS basé sur auth.uid())
-- ✅ ambitions (RLS basé sur user_id = auth.uid())
-- ✅ key_results (RLS basé sur user_id via ambitions)
-- ✅ quarterly_objectives (RLS basé sur user_id = auth.uid())
-- ✅ quarterly_key_results (RLS basé sur user_id via quarterly_objectives)
-- ✅ actions (RLS basé sur user_id = auth.uid())
-- ✅ progress (RLS basé sur user_id = auth.uid())
-- ✅ teams (RLS basé sur owner_id = auth.uid())
-- ⚠️ team_members (RLS désactivé temporairement)
-- ============================================================================

