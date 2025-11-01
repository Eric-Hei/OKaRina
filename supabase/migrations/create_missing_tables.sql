-- ============================================================================
-- Migration: Créer les tables manquantes (invitations, notifications, shared_objectives)
-- ============================================================================

-- ============================================================================
-- 1. INVITATIONS
-- ============================================================================

-- Type enum pour le statut d'invitation
DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table invitations
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'MEMBER',
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  status invitation_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS invitations_team_id_idx ON invitations(team_id);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations(email);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations(token);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team admins can manage invitations" ON invitations;
CREATE POLICY "Team admins can manage invitations"
  ON invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invitations.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('OWNER', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON invitations;
CREATE POLICY "Users can view invitations sent to their email"
  ON invitations FOR SELECT
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- ============================================================================
-- 2. NOTIFICATIONS
-- ============================================================================

-- Type enum pour le type de notification
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'TEAM_INVITATION',
    'MEMBER_JOINED',
    'OBJECTIVE_SHARED',
    'COMMENT_MENTION',
    'DEADLINE_APPROACHING',
    'PROGRESS_UPDATE',
    'ACHIEVEMENT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text,
  entity_type text,
  entity_id uuid,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. SHARED_OBJECTIVES
-- ============================================================================

-- Type enum pour les permissions de partage
DO $$ BEGIN
  CREATE TYPE share_permission AS ENUM ('VIEW', 'EDIT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table shared_objectives
CREATE TABLE IF NOT EXISTS shared_objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id uuid REFERENCES quarterly_objectives(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  permission share_permission DEFAULT 'VIEW',
  shared_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_team_id IS NOT NULL)
  )
);

-- Index
CREATE INDEX IF NOT EXISTS shared_objectives_objective_id_idx ON shared_objectives(objective_id);
CREATE INDEX IF NOT EXISTS shared_objectives_user_id_idx ON shared_objectives(shared_with_user_id);
CREATE INDEX IF NOT EXISTS shared_objectives_team_id_idx ON shared_objectives(shared_with_team_id);

-- RLS
ALTER TABLE shared_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view shares of their objectives" ON shared_objectives;
CREATE POLICY "Users can view shares of their objectives"
  ON shared_objectives FOR SELECT
  USING (
    shared_by = auth.uid() OR
    shared_with_user_id = auth.uid() OR
    shared_with_team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create shares for their objectives" ON shared_objectives;
CREATE POLICY "Users can create shares for their objectives"
  ON shared_objectives FOR INSERT
  WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM quarterly_objectives
      WHERE id = shared_objectives.objective_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own shares" ON shared_objectives;
CREATE POLICY "Users can delete their own shares"
  ON shared_objectives FOR DELETE
  USING (shared_by = auth.uid());

DROP POLICY IF EXISTS "Users can update permission on their shares" ON shared_objectives;
CREATE POLICY "Users can update permission on their shares"
  ON shared_objectives FOR UPDATE
  USING (shared_by = auth.uid());

