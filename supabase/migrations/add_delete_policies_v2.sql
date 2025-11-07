-- Migration v2: Ajouter les politiques DELETE manquantes (sans if not exists)
-- Date: 2025-11-07

-- Supprimer les anciennes politiques si elles existent (pour éviter les conflits)
drop policy if exists "Users can delete own actions" on actions;
drop policy if exists "Users can delete own quarterly key results" on quarterly_key_results;
drop policy if exists "Users can delete own quarterly objectives" on quarterly_objectives;
drop policy if exists "Users can delete own key results" on key_results;
drop policy if exists "Users can delete own ambitions" on ambitions;
drop policy if exists "Users can delete shares received" on shared_objectives;
drop policy if exists "Users can delete invitations sent" on invitations;
drop policy if exists "Users can delete invitations received" on invitations;
drop policy if exists "Users can delete own team memberships" on team_members;
drop policy if exists "Team owners can delete their teams" on teams;
drop policy if exists "Users can delete own progress" on progress;
drop policy if exists "Users can delete own subscription" on subscriptions;
drop policy if exists "Users can delete own profile" on profiles;

-- Actions
create policy "Users can delete own actions"
  on actions for delete
  using (user_id = auth.uid());

-- Quarterly Key Results (via l'objectif parent)
create policy "Users can delete own quarterly key results"
  on quarterly_key_results for delete
  using (
    exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = quarterly_key_results.objective_id
      and quarterly_objectives.user_id = auth.uid()
    )
  );

-- Quarterly Objectives
create policy "Users can delete own quarterly objectives"
  on quarterly_objectives for delete
  using (user_id = auth.uid());

-- Key Results (annuels) (via l'ambition parente)
create policy "Users can delete own key results"
  on key_results for delete
  using (
    exists (
      select 1 from ambitions
      where ambitions.id = key_results.ambition_id
      and ambitions.user_id = auth.uid()
    )
  );

-- Ambitions
create policy "Users can delete own ambitions"
  on ambitions for delete
  using (user_id = auth.uid());

-- Shared Objectives (partages reçus)
create policy "Users can delete shares received"
  on shared_objectives for delete
  using (shared_with_user_id = auth.uid());

-- Notifications (déjà existante, on la garde)

-- Invitations (envoyées)
create policy "Users can delete invitations sent"
  on invitations for delete
  using (invited_by = auth.uid());

-- Invitations (reçues par email)
create policy "Users can delete invitations received"
  on invitations for delete
  using (email = (select email from auth.users where id = auth.uid()));

-- Team Members
create policy "Users can delete own team memberships"
  on team_members for delete
  using (user_id = auth.uid());

-- Teams (propriétaire) (déjà existante, on la garde)

-- Progress
create policy "Users can delete own progress"
  on progress for delete
  using (user_id = auth.uid());

-- Subscriptions
create policy "Users can delete own subscription"
  on subscriptions for delete
  using (user_id = auth.uid());

-- Profiles
create policy "Users can delete own profile"
  on profiles for delete
  using (id = auth.uid());

-- Fonction delete_user (déjà créée normalement)
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  user_id := auth.uid();
  
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = user_id;
  
  raise notice 'User % deleted successfully', user_id;
end;
$$;

grant execute on function delete_user() to authenticated;

comment on function delete_user() is 'Supprime le compte utilisateur actuel de auth.users. Doit être appelé après avoir supprimé toutes les données liées.';

