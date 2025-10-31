import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { User } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  company?: string;
  role?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

/**
 * Service d'authentification avec Supabase
 */
export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async signUp(data: SignUpData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré. Veuillez ajouter les variables d\'environnement.');
    }

    const { email, password, name, company, role } = data;

    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          company,
          role,
        },
      },
    });

    if (authError) {
      console.error('Erreur lors de l\'inscription:', authError);
      throw authError;
    }

    // 2. Le profil est créé automatiquement via le trigger handle_new_user()
    // Attendre un peu pour que le trigger s'exécute
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Récupérer le profil créé
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
      }

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    }

    return authData;
  }

  /**
   * Connexion d'un utilisateur existant
   */
  static async signIn(data: SignInData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré. Veuillez ajouter les variables d\'environnement.');
    }

    const { email, password } = data;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.warn('⚠️ Erreur lors de la connexion (retournée sans throw):', authError);
      return { error: authError } as any;
    }

    // Récupérer le profil complet
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
      }

      return {
        user: authData.user,
        profile,
        session: authData.session,
      };
    }

    return authData;
  }

  /**
   * Déconnexion
   */
  static async signOut() {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase non configuré, déconnexion ignorée');
      return;
    }

    try {
      console.log('🔴 AuthService.signOut() - Début');

      // Ajouter un timeout de 3 secondes (réduit pour être plus rapide)
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de déconnexion')), 3000)
      );

      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('⚠️ Erreur lors de la déconnexion Supabase (ignorée):', error.message);
        // Ne pas throw, on continue avec la déconnexion locale
        return;
      }

      console.log('✅ AuthService.signOut() - Succès');
    } catch (error: any) {
      // Gérer le timeout silencieusement
      if (error.message?.includes('Timeout')) {
        console.warn('⚠️ Timeout de déconnexion Supabase (ignoré) - déconnexion locale uniquement');
      } else {
        console.warn('⚠️ Erreur lors de la déconnexion Supabase (ignorée):', error.message);
      }
      // Ne pas throw l'erreur pour permettre la déconnexion locale
      // throw error;
    }
  }

  /**
   * Récupérer la session courante
   */
  static async getSession() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
    return session;
  }

  /**
   * Récupérer l'utilisateur courant
   */
  static async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      // Vérifier d'abord s'il y a une session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      // Récupérer l'utilisateur
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
      }

      if (!user) return null;

      // Récupérer le profil complet
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        return null;
      }

      return {
        user,
        profile,
      };
    } catch (error: any) {
      // Gérer l'erreur "Auth session missing" silencieusement
      if (error.message?.includes('Auth session missing')) {
        return null;
      }
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Demander un reset de mot de passe
   */
  static async resetPassword(data: ResetPasswordData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { email } = data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      console.error('Erreur lors de la demande de reset:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le mot de passe
   */
  static async updatePassword(data: UpdatePasswordData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { password } = data;

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }

  /**
   * Connexion avec Google OAuth
   */
  static async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Erreur lors de la connexion Google:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements d'état d'authentification
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Mettre à jour le profil d'entreprise
   */
  static async updateCompanyProfile(userId: string, companyProfile: any) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ company_profile: companyProfile })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du profil d\'entreprise:', error);
      throw error;
    }

    return data;
  }

  /**
   * Mettre à jour le profil utilisateur (nom, entreprise, rôle, etc.)
   */
  static async updateProfile(userId: string, updates: {
    name?: string;
    company?: string;
    role?: string;
    avatar_url?: string;
    settings?: any;
  }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }

    return data;
  }

  /**
   * Convertir un profil Supabase en User de l'app
   */
  static profileToUser(profile: any): User {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      company: profile.company,
      role: profile.role,
      createdAt: new Date(profile.created_at),
      lastLoginAt: new Date(),
      companyProfile: profile.company_profile,
    };
  }
}

