/**
 * Utilitaires pour vérifier les limites d'abonnement
 */

import { SubscriptionsService } from '@/services/db';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  max?: number;
  planType?: string;
}

/**
 * Vérifier si un utilisateur peut créer une ambition
 */
export async function checkCanCreateAmbition(userId: string): Promise<LimitCheckResult> {
  const canCreate = await SubscriptionsService.canCreateAmbition(userId);
  
  if (canCreate) {
    return { allowed: true };
  }

  const usage = await SubscriptionsService.getUsage(userId);
  
  return {
    allowed: false,
    reason: 'Limite d\'ambitions atteinte',
    current: usage?.currentAmbitions,
    max: usage?.maxAmbitions === Infinity ? -1 : usage?.maxAmbitions,
  };
}

/**
 * Vérifier si un utilisateur peut ajouter un membre à son équipe
 */
export async function checkCanAddTeamMember(userId: string, teamId: string): Promise<LimitCheckResult> {
  const canAdd = await SubscriptionsService.canAddTeamMember(userId, teamId);
  
  if (canAdd) {
    return { allowed: true };
  }

  const usage = await SubscriptionsService.getUsage(userId);
  
  return {
    allowed: false,
    reason: 'Limite d\'utilisateurs atteinte',
    current: usage?.currentUsers,
    max: usage?.maxUsers === Infinity ? -1 : usage?.maxUsers,
  };
}

/**
 * Vérifier si un utilisateur a accès à une feature
 */
export async function checkHasFeature(userId: string, feature: string): Promise<LimitCheckResult> {
  const subscription = await SubscriptionsService.getUserSubscription(userId);
  
  if (!subscription?.plan?.features) {
    return {
      allowed: false,
      reason: 'Abonnement non trouvé',
    };
  }

  const featureValue = (subscription.plan.features as any)[feature];
  
  // Si c'est un booléen
  if (typeof featureValue === 'boolean') {
    return {
      allowed: featureValue,
      reason: featureValue ? undefined : `Feature "${feature}" non disponible dans votre plan`,
      planType: subscription.planType,
    };
  }
  
  // Si c'est un nombre
  if (typeof featureValue === 'number') {
    const allowed = featureValue > 0 || featureValue === -1;
    return {
      allowed,
      reason: allowed ? undefined : `Feature "${feature}" non disponible dans votre plan`,
      planType: subscription.planType,
    };
  }
  
  // Si c'est une string
  if (typeof featureValue === 'string') {
    const allowed = featureValue.length > 0;
    return {
      allowed,
      reason: allowed ? undefined : `Feature "${feature}" non disponible dans votre plan`,
      planType: subscription.planType,
    };
  }
  
  return {
    allowed: false,
    reason: `Feature "${feature}" non trouvée`,
    planType: subscription.planType,
  };
}

/**
 * Obtenir un message d'erreur formaté pour l'utilisateur
 */
export function getLimitErrorMessage(result: LimitCheckResult): string {
  if (result.allowed) {
    return '';
  }

  if (result.reason && result.current !== undefined && result.max !== undefined) {
    if (result.max === -1) {
      return `${result.reason}. Vous avez ${result.current} éléments (illimité dans votre plan).`;
    }
    return `${result.reason}. Vous avez ${result.current}/${result.max} éléments. Passez à un plan supérieur pour en créer plus.`;
  }

  return result.reason || 'Action non autorisée avec votre plan actuel.';
}

/**
 * Obtenir le nom du plan suggéré pour upgrader
 */
export function getSuggestedPlanForFeature(currentPlan: string, feature: string): string | null {
  // Mapping des features vers les plans minimums requis
  const featureMinPlan: Record<string, string> = {
    'analytics': 'pro',
    'integrations': 'pro',
    'priority_support': 'team',
    'roles_permissions': 'team',
    'advanced_analytics': 'team',
  };

  const requiredPlan = featureMinPlan[feature];
  if (!requiredPlan) return null;

  const planOrder = ['free', 'pro', 'team', 'unlimited'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const requiredIndex = planOrder.indexOf(requiredPlan);

  if (currentIndex < requiredIndex) {
    return requiredPlan;
  }

  return null;
}

