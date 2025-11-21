-- Create action_assignees table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS action_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  assignee_type TEXT NOT NULL CHECK (assignee_type IN ('internal', 'external')),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  external_contact_id UUID REFERENCES external_contacts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Une personne ne peut être assignée qu'une fois par action
  UNIQUE(action_id, user_id),
  UNIQUE(action_id, external_contact_id),
  
  -- Contrainte: soit user_id soit external_contact_id
  CHECK (
    (assignee_type = 'internal' AND user_id IS NOT NULL AND external_contact_id IS NULL) OR
    (assignee_type = 'external' AND external_contact_id IS NOT NULL AND user_id IS NULL)
  )
);

-- Index pour recherche rapide
CREATE INDEX idx_action_assignees_action ON action_assignees(action_id);
CREATE INDEX idx_action_assignees_user ON action_assignees(user_id);
CREATE INDEX idx_action_assignees_external ON action_assignees(external_contact_id);

-- RLS Policies pour action_assignees
ALTER TABLE action_assignees ENABLE ROW LEVEL SECURITY;

-- Lecture: peut voir les assignations des actions auxquelles on a accès
CREATE POLICY "Users can view assignees of accessible actions"
  ON action_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM actions a
      INNER JOIN quarterly_key_results qkr ON a.key_result_id = qkr.id
      INNER JOIN quarterly_objectives qo ON qkr.objective_id = qo.id
      INNER JOIN ambitions amb ON qo.ambition_id = amb.id
      WHERE a.id = action_assignees.action_id
      AND amb.user_id = auth.uid()
    )
  );

-- Création: peut créer des assignations pour ses propres actions
CREATE POLICY "Users can create assignees for their actions"
  ON action_assignees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions a
      INNER JOIN quarterly_key_results qkr ON a.key_result_id = qkr.id
      INNER JOIN quarterly_objectives qo ON qkr.objective_id = qo.id
      INNER JOIN ambitions amb ON qo.ambition_id = amb.id
      WHERE a.id = action_assignees.action_id
      AND amb.user_id = auth.uid()
    )
    AND assigned_by = auth.uid()
  );

-- Suppression: peut supprimer les assignations de ses propres actions
CREATE POLICY "Users can delete assignees from their actions"
  ON action_assignees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM actions a
      INNER JOIN quarterly_key_results qkr ON a.key_result_id = qkr.id
      INNER JOIN quarterly_objectives qo ON qkr.objective_id = qo.id
      INNER JOIN ambitions amb ON qo.ambition_id = amb.id
      WHERE a.id = action_assignees.action_id
      AND amb.user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour last_used_at des contacts externes
CREATE TRIGGER update_contact_last_used
  AFTER INSERT ON action_assignees
  FOR EACH ROW
  WHEN (NEW.assignee_type = 'external')
  EXECUTE FUNCTION update_external_contact_last_used();
