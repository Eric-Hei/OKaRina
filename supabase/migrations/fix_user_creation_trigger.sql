-- Migration: Fix user creation trigger to handle errors better
-- Date: 2025-11-07
-- Description: Améliore le trigger handle_new_user pour mieux gérer les erreurs

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer la fonction avec une meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_name text;
  v_company text;
  v_role text;
BEGIN
  -- Extraire les métadonnées avec des valeurs par défaut
  v_name := COALESCE(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  v_company := new.raw_user_meta_data->>'company';
  v_role := new.raw_user_meta_data->>'role';

  -- Insérer le profil
  INSERT INTO public.profiles (id, email, name, company, role)
  VALUES (
    new.id,
    new.email,
    v_name,
    v_company,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    company = COALESCE(EXCLUDED.company, profiles.company),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création du profil pour %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Améliorer aussi le trigger de création d'abonnement
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger AS $$
BEGIN
  -- Insérer l'abonnement Free par défaut
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (new.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas la création du profil
    RAISE WARNING 'Erreur lors de la création de l''abonnement pour %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier que le trigger existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_profile_created'
    AND event_object_table = 'profiles'
  ) THEN
    CREATE TRIGGER on_profile_created
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION create_default_subscription();
  END IF;
END $$;

