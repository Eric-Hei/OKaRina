/**
 * Page de pricing - Affichage des plans d'abonnement
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/store/useAppStore';
import { useSubscription, useSubscriptionPlans } from '@/hooks/useSubscription';
import { PricingCard } from '@/components/pricing/PricingCard';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription(user?.id);
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planType: string) => {
    if (!user) {
      // Rediriger vers la page de connexion
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setSelectedPlan(planType);

    // Si c'est le plan Free, on peut le faire directement
    if (planType === 'free') {
      // TODO: Implémenter le downgrade vers Free
      console.log('Downgrade to Free');
      setSelectedPlan(null);
      return;
    }

    // Pour les plans payants, rediriger vers Stripe Checkout
    // TODO: Implémenter la création de session Stripe
    console.log('Redirect to Stripe for plan:', planType);
    
    // Simuler un délai
    setTimeout(() => {
      setSelectedPlan(null);
      alert('Intégration Stripe à venir ! Pour l\'instant, contactez-nous pour upgrader.');
    }, 1000);
  };

  const isLoading = subscriptionLoading || plansLoading;

  // Filtrer les plans (ne pas afficher Unlimited dans la liste publique)
  const publicPlans = plans?.filter(p => p.planType !== 'unlimited') || [];

  return (
    <Layout>
      <Head>
        <title>Tarifs - OsKaR</title>
        <meta name="description" content="Choisissez le plan OsKaR qui correspond à vos besoins" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement et évoluez au rythme de votre croissance
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Plans grid */}
          {!isLoading && publicPlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {publicPlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={subscription?.planType}
                  onSelect={handleSelectPlan}
                  isLoading={selectedPlan === plan.planType}
                  highlighted={plan.planType === 'pro'}
                />
              ))}
            </div>
          )}

          {/* No plans found */}
          {!isLoading && publicPlans.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                Aucun plan disponible pour le moment.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Veuillez réessayer plus tard ou contacter le support.
              </p>
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Questions fréquentes
            </h2>
            
            <div className="space-y-6">
              <FAQItem
                question="Puis-je changer de plan à tout moment ?"
                answer="Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement."
              />
              
              <FAQItem
                question="Que se passe-t-il si j'atteins ma limite d'ambitions ?"
                answer="Vous recevrez une notification vous invitant à upgrader votre plan. Vos ambitions existantes restent accessibles, mais vous ne pourrez pas en créer de nouvelles."
              />
              
              <FAQItem
                question="Comment fonctionne l'IA coach ?"
                answer="L'IA coach analyse vos objectifs et vous propose des suggestions personnalisées pour les améliorer. En plan Free, vous avez 10 suggestions par mois. En Pro et Team, c'est illimité."
              />
              
              <FAQItem
                question="Puis-je essayer un plan payant gratuitement ?"
                answer="Oui ! Nous offrons 14 jours d'essai gratuit sur tous les plans payants. Aucune carte bancaire requise pour commencer."
              />
              
              <FAQItem
                question="Comment obtenir le plan Unlimited ?"
                answer="Le plan Unlimited est réservé à des cas spéciaux (partenaires, early adopters, etc.). Contactez-nous pour en savoir plus."
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer vos ambitions en réalité ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des centaines d'entrepreneurs qui utilisent OsKaR pour atteindre leurs objectifs
            </p>
            <button
              onClick={() => router.push(user ? '/dashboard' : '/auth/signup')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              {user ? 'Accéder au tableau de bord' : 'Commencer gratuitement'}
            </button>
          </div>

          {/* Back button */}
          {user && (
            <div className="mt-12 text-center">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Retour
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Composant FAQ Item
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

