-- Create external_contacts table (shared at company level)
CREATE TABLE IF NOT EXISTS external_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  -- Un email unique par entreprise
  UNIQUE(company_id, email)
);

-- Index pour recherche rapide
CREATE INDEX idx_external_contacts_company ON external_contacts(company_id);
CREATE INDEX idx_external_contacts_email ON external_contacts(company_id, email);

-- RLS Policies pour external_contacts
ALTER TABLE external_contacts ENABLE ROW LEVEL SECURITY;

-- Lecture: tous les membres de la même entreprise peuvent voir les contacts
CREATE POLICY "Users can view contacts from their company"
  ON external_contacts FOR SELECT
  USING (
    company_id = (
      SELECT company FROM profiles WHERE id = auth.uid()
    )
  );

-- Création: tous les membres peuvent créer des contacts pour leur entreprise
CREATE POLICY "Users can create contacts for their company"
  ON external_contacts FOR INSERT
  WITH CHECK (
    company_id = (
      SELECT company FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Mise à jour: seul le créateur peut modifier
CREATE POLICY "Users can update their own contacts"
  ON external_contacts FOR UPDATE
  USING (created_by = auth.uid());

-- Suppression: seul le créateur peut supprimer
CREATE POLICY "Users can delete their own contacts"
  ON external_contacts FOR DELETE
  USING (created_by = auth.uid());

-- Fonction pour mettre à jour last_used_at
CREATE OR REPLACE FUNCTION update_external_contact_last_used()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE external_contacts 
  SET last_used_at = NOW() 
  WHERE id = NEW.external_contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
