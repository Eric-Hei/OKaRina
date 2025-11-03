-- Migration: Permettre aux membres d'une équipe de voir les profils des autres membres
-- Date: 2025-11-03
-- Description: Ajoute une politique RLS pour que les utilisateurs puissent voir
--              les profils des autres membres de leurs équipes

-- Créer la politique pour voir les profils des membres de la même équipe
create policy "Users can view team members profiles"
  on profiles for select
  using (
    exists (
      select 1 from team_members tm1
      join team_members tm2 on tm1.team_id = tm2.team_id
      where tm1.user_id = auth.uid()
      and tm2.user_id = profiles.id
    )
  );

