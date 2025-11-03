/**
 * Hook pour gérer l'abonnement de l'utilisateur
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionsService } from '@/services/db';
import type { Subscription, SubscriptionPlan, SubscriptionUsage } from '@/types';

/**
 * Hook pour récupérer l'abonnement de l'utilisateur
 */
export function useSubscription(userId: string | undefined) {
  return useQuery<Subscription | null>({
    queryKey: ['subscription', userId],
    queryFn: () => {
      if (!userId) return null;
      return SubscriptionsService.getUserSubscription(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer tous les plans disponibles
 */
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: () => SubscriptionsService.getAvailablePlans(),
    staleTime: 30 * 60 * 1000, // 30 minutes (les plans changent rarement)
  });
}

/**
 * Hook pour récupérer un plan spécifique
 */
export function useSubscriptionPlan(planType: string | undefined) {
  return useQuery<SubscriptionPlan | null>({
    queryKey: ['subscription-plan', planType],
    queryFn: () => {
      if (!planType) return null;
      return SubscriptionsService.getPlan(planType);
    },
    enabled: !!planType,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer l'usage actuel de l'utilisateur
 */
export function useSubscriptionUsage(userId: string | undefined) {
  return useQuery<SubscriptionUsage | null>({
    queryKey: ['subscription-usage', userId],
    queryFn: () => {
      if (!userId) return null;
      return SubscriptionsService.getUsage(userId);
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (l'usage change fréquemment)
  });
}

/**
 * Hook pour vérifier si l'utilisateur peut créer une ambition
 */
export function useCanCreateAmbition(userId: string | undefined) {
  const { data: usage } = useSubscriptionUsage(userId);
  
  return {
    canCreate: usage?.canCreateAmbition ?? false,
    current: usage?.currentAmbitions ?? 0,
    max: usage?.maxAmbitions ?? 0,
    isUnlimited: usage?.maxAmbitions === Infinity,
  };
}

/**
 * Hook pour vérifier si l'utilisateur peut ajouter un membre
 */
export function useCanAddTeamMember(userId: string | undefined) {
  const { data: usage } = useSubscriptionUsage(userId);
  
  return {
    canAdd: usage?.canAddUser ?? false,
    current: usage?.currentUsers ?? 0,
    max: usage?.maxUsers ?? 0,
    isUnlimited: usage?.maxUsers === Infinity,
  };
}

/**
 * Hook pour changer de plan
 */
export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      newPlanType,
      stripeSubscriptionId,
    }: {
      userId: string;
      newPlanType: string;
      stripeSubscriptionId?: string;
    }) => SubscriptionsService.changePlan(userId, newPlanType, stripeSubscriptionId),
    onSuccess: (data, variables) => {
      // Invalider les queries liées à l'abonnement
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', variables.userId] });
    },
  });
}

/**
 * Hook pour annuler un abonnement
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => SubscriptionsService.cancelSubscription(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', userId] });
    },
  });
}

/**
 * Hook pour réactiver un abonnement
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => SubscriptionsService.reactivateSubscription(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', userId] });
    },
  });
}

/**
 * Hook pour vérifier si une feature est disponible
 */
export function useHasFeature(userId: string | undefined, feature: string) {
  const { data: subscription } = useSubscription(userId);
  
  if (!subscription?.plan?.features) {
    return false;
  }

  const featureValue = (subscription.plan.features as any)[feature];
  
  // Si c'est un booléen, retourner directement
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // Si c'est un nombre, vérifier s'il est > 0 ou -1 (illimité)
  if (typeof featureValue === 'number') {
    return featureValue > 0 || featureValue === -1;
  }
  
  // Si c'est une string, vérifier qu'elle n'est pas vide
  if (typeof featureValue === 'string') {
    return featureValue.length > 0;
  }
  
  return false;
}

/**
 * Hook pour obtenir la valeur d'une feature
 */
export function useFeatureValue<T = any>(userId: string | undefined, feature: string): T | null {
  const { data: subscription } = useSubscription(userId);
  
  if (!subscription?.plan?.features) {
    return null;
  }

  return (subscription.plan.features as any)[feature] ?? null;
}

/**
 * Hook pour vérifier si l'utilisateur est sur un plan spécifique
 */
export function useIsPlan(userId: string | undefined, planType: string) {
  const { data: subscription } = useSubscription(userId);
  return subscription?.planType === planType;
}

/**
 * Hook pour vérifier si l'utilisateur peut upgrader
 */
export function useCanUpgrade(userId: string | undefined) {
  const { data: subscription } = useSubscription(userId);
  
  if (!subscription) return false;
  
  const planOrder = ['free', 'pro', 'team', 'unlimited'];
  const currentIndex = planOrder.indexOf(subscription.planType);
  
  // Peut upgrader si pas au niveau maximum (unlimited)
  return currentIndex < planOrder.length - 1 && subscription.planType !== 'unlimited';
}

/**
 * Hook pour obtenir le prochain plan suggéré
 */
export function useSuggestedUpgrade(userId: string | undefined) {
  const { data: subscription } = useSubscription(userId);
  const { data: plans } = useSubscriptionPlans();
  
  if (!subscription || !plans) return null;
  
  const planOrder = ['free', 'pro', 'team'];
  const currentIndex = planOrder.indexOf(subscription.planType);
  
  if (currentIndex === -1 || currentIndex >= planOrder.length - 1) {
    return null;
  }
  
  const nextPlanType = planOrder[currentIndex + 1];
  return plans.find(p => p.planType === nextPlanType) || null;
}

