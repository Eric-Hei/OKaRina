-- Migration: Corriger les politiques RLS pour les commentaires
-- Date: 2025-11-03
-- Description: Remplace la politique trop permissive par une version sécurisée

-- Supprimer l'ancienne politique trop permissive
drop policy if exists "Users can view comments on accessible entities" on comments;

-- Créer la nouvelle politique sécurisée
create policy "Users can view comments on accessible entities"
  on comments for select
  using (
    -- Commentaires sur les ambitions de l'utilisateur
    (entity_type = 'AMBITION' and exists (
      select 1 from ambitions
      where ambitions.id = comments.entity_id
      and ambitions.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les objectifs de l'utilisateur
    (entity_type = 'OBJECTIVE' and exists (
      select 1 from quarterly_objectives
      where quarterly_objectives.id = comments.entity_id
      and quarterly_objectives.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les key results de l'utilisateur
    (entity_type = 'KEY_RESULT' and exists (
      select 1 from quarterly_key_results qkr
      join quarterly_objectives qo on qo.id = qkr.objective_id
      where qkr.id = comments.entity_id
      and qo.user_id = auth.uid()
    ))
    or
    -- Commentaires sur les actions de l'utilisateur
    (entity_type = 'ACTION' and exists (
      select 1 from actions
      where actions.id = comments.entity_id
      and actions.user_id = auth.uid()
    ))
  );

