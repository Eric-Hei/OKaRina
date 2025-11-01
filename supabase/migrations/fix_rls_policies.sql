-- ============================================================================
-- Migration: Corriger les politiques RLS pour invitations et notifications
-- ============================================================================

-- ============================================================================
-- 1. INVITATIONS - Ajouter politique INSERT
-- ============================================================================

DROP POLICY IF EXISTS "Users can create invitations for their teams" ON invitations;
CREATE POLICY "Users can create invitations for their teams"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invitations.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('OWNER', 'ADMIN')
    )
  );

-- ============================================================================
-- 2. NOTIFICATIONS - Ajouter politique INSERT
-- ============================================================================

DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
CREATE POLICY "Users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Tout le monde peut créer des notifications

-- Alternative plus restrictive (si besoin) :
-- WITH CHECK (user_id = auth.uid()); -- Seulement pour soi-même

-- ============================================================================
-- 3. NOTIFICATIONS - Ajouter politique DELETE
-- ============================================================================

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

