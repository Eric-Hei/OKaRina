/**
 * Configuration Stripe (côté client)
 * 
 * Ce fichier sera utilisé une fois que vous aurez créé votre compte Stripe
 * et ajouté les clés API dans .env.local
 */

// import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: any = null;

/**
 * Obtenir l'instance Stripe (singleton)
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('⚠️ Stripe publishable key non configurée');
      return null;
    }

    // Décommenter quand @stripe/stripe-js sera installé
    // stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Vérifier si Stripe est configuré
 */
export const isStripeConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Prix IDs Stripe (à remplir après création des produits dans Stripe)
 */
export const STRIPE_PRICES = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
  team_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY || '',
  team_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY || '',
};

/**
 * URLs de redirection après paiement
 */
export const getStripeUrls = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    success: `${baseUrl}/settings?tab=subscription&success=true`,
    cancel: `${baseUrl}/pricing?canceled=true`,
  };
};

