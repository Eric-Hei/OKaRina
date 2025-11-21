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
      console.error('❌ Erreur lors de l\'inscription:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur créé');
    }

    // 2. Le profil est normalement créé automatiquement via le trigger handle_new_user()
    // Attendre un peu pour que le trigger s'exécute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Vérifier si le profil a été créé
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // 4. Si le profil n'existe pas (trigger a échoué), le créer manuellement
    if (profileError || !profile) {
      console.warn('⚠️ Le trigger n\'a pas créé le profil, création manuelle...');

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: name || email.split('@')[0],
          company,
          role,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création manuelle du profil:', createError);
        // Ne pas bloquer l'inscription, le profil pourra être créé plus tard
      } else {
        profile = newProfile;
        console.log('✅ Profil créé manuellement');
      }
    }

    // 5. Vérifier si l'abonnement a été créé
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    // 6. Si l'abonnement n'existe pas, le créer manuellement
    if (subError || !subscription) {
      console.warn('⚠️ Le trigger n\'a pas créé l\'abonnement, création manuelle...');

      const { error: createSubError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          plan_type: 'free',
          status: 'active',
        });

      if (createSubError && createSubError.code !== '23505') {
        console.error('❌ Erreur lors de la création manuelle de l\'abonnement:', createSubError);
      } else {
        console.log('✅ Abonnement créé manuellement');
      }
    }

    return {
      user: authData.user,
      profile,
      session: authData.session,
    };
  }

  /**
   * Connexion d'un utilisateur existant
   */
  static async signIn(data: SignInData) {
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
    // Ne pas appeler Supabase Auth côté serveur (pendant le build statique)
    if (typeof window === 'undefined') {
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
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Mettre à jour le profil d'entreprise
   */
  static async updateCompanyProfile(userId: string, companyProfile: any) {
    console.log('🔄 Début de la mise à jour du profil d\'entreprise...');
    console.log('📝 User ID:', userId);
    console.log('📝 Company Profile:', companyProfile);

    // Vérifier la session avant l'UPDATE
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Session actuelle:', sessionData?.session ? 'Valide' : 'Invalide');

    if (sessionError) {
      console.error('❌ Erreur de session:', sessionError);
    }

    if (!sessionData?.session) {
      console.warn('⚠️ Aucune session active, tentative de rafraîchissement...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('❌ Erreur de rafraîchissement:', refreshError);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      console.log('✅ Session rafraîchie avec succès');
    }

    const result = await (supabase as any)
      .from('profiles')
      .update({ company_profile: companyProfile })
      .eq('id', userId)
      .select()
      .single();

    const { data, error } = result;

    console.log('📊 Résultat de l\'UPDATE:', { data, error });

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du profil d\'entreprise:', error);
      console.error('❌ Code d\'erreur:', error.code);
      console.error('❌ Message:', error.message);
      console.error('❌ Détails:', error.details);
      throw error;
    }

    if (!data) {
      console.warn('⚠️ Aucune donnée retournée par l\'UPDATE');
      throw new Error('Aucune donnée retournée lors de la mise à jour du profil');
    }

    console.log('✅ Profil d\'entreprise mis à jour avec succès:', data);
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
    const result = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    const { data, error } = result;

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

