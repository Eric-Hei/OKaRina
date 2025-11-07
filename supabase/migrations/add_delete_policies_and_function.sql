-- Migration: Ajouter les politiques DELETE manquantes et la fonction delete_user
-- Date: 2025-11-07
-- Description: Permet aux utilisateurs de supprimer leurs propres données et leur compte

-- ============================================================================
-- 1. POLITIQUES DELETE MANQUANTES
-- ============================================================================

-- Actions
create policy if not exists "Users can delete own actions"
  on actions for delete
  using (user_id = auth.uid());

-- Quarterly Key Results (via l'objectif parent)
create policy if not exists "Users can delete own quarterly key results"
  on quarterly_key_results for delete
  using (
    exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = quarterly_key_results.objective_id
      and quarterly_objectives.user_id = auth.uid()
    )
  );

-- Quarterly Objectives
create policy if not exists "Users can delete own quarterly objectives"
  on quarterly_objectives for delete
  using (user_id = auth.uid());

-- Key Results (annuels) (via l'ambition parente)
create policy if not exists "Users can delete own key results"
  on key_results for delete
  using (
    exists (
      select 1 from ambitions
      where ambitions.id = key_results.ambition_id
      and ambitions.user_id = auth.uid()
    )
  );

-- Ambitions
create policy if not exists "Users can delete own ambitions"
  on ambitions for delete
  using (user_id = auth.uid());

-- Shared Objectives (partages reçus)
create policy if not exists "Users can delete shares received"
  on shared_objectives for delete
  using (shared_with_user_id = auth.uid());

-- Notifications
create policy if not exists "Users can delete own notifications"
  on notifications for delete
  using (user_id = auth.uid());

-- Invitations (envoyées)
create policy if not exists "Users can delete invitations sent"
  on invitations for delete
  using (invited_by = auth.uid());

-- Invitations (reçues par email)
create policy if not exists "Users can delete invitations received"
  on invitations for delete
  using (email = (select email from auth.users where id = auth.uid()));

-- Team Members
create policy if not exists "Users can delete own team memberships"
  on team_members for delete
  using (user_id = auth.uid());

-- Teams (propriétaire)
create policy if not exists "Team owners can delete their teams"
  on teams for delete
  using (owner_id = auth.uid());

-- Progress
create policy if not exists "Users can delete own progress"
  on progress for delete
  using (user_id = auth.uid());

-- Subscriptions
create policy if not exists "Users can delete own subscription"
  on subscriptions for delete
  using (user_id = auth.uid());

-- Profiles
create policy if not exists "Users can delete own profile"
  on profiles for delete
  using (id = auth.uid());

-- ============================================================================
-- 2. FONCTION DELETE_USER
-- ============================================================================

-- Fonction pour supprimer un utilisateur de auth.users
-- Cette fonction doit être appelée APRÈS avoir supprimé toutes les données liées
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  -- Récupérer l'ID de l'utilisateur actuel
  user_id := auth.uid();
  
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Supprimer l'utilisateur de auth.users
  -- Cela déclenchera la cascade de suppression sur les tables liées
  delete from auth.users where id = user_id;
  
  -- Log de la suppression
  raise notice 'User % deleted successfully', user_id;
end;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
grant execute on function delete_user() to authenticated;

-- ============================================================================
-- 3. COMMENTAIRES
-- ============================================================================

comment on function delete_user() is 'Supprime le compte utilisateur actuel de auth.users. Doit être appelé après avoir supprimé toutes les données liées.';

