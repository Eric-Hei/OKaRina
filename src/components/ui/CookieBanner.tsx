import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface CookiePreferences {
  necessary: boolean; // Toujours true
  analytics: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'okarina_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'okarina_cookie_preferences';

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Attendre 1 seconde avant d'afficher la bannière
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Charger les préférences sauvegardées
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    localStorage.setItem('okarina_consent_date', new Date().toISOString());
    
    // Appliquer les préférences
    applyPreferences(prefs);
    
    setShowBanner(false);
    setShowSettings(false);
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // Ici, vous pouvez activer/désactiver les cookies selon les préférences
    // Par exemple, charger Google Analytics seulement si analytics est true
    
    if (prefs.analytics) {
      // Activer Google Analytics
      console.log('📊 Analytics activés');
      // window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      console.log('📊 Analytics désactivés');
      // window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    if (prefs.functional) {
      console.log('⚙️ Cookies fonctionnels activés');
    } else {
      console.log('⚙️ Cookies fonctionnels désactivés');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
    };
    savePreferences(onlyNecessary);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        {/* Overlay */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto"
            onClick={() => setShowSettings(false)}
          />
        )}

        {/* Bannière simple */}
        {!showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-6xl mx-4 mb-4 pointer-events-auto"
          >
            <Card className="shadow-2xl border-2 border-primary-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Cookie className="h-8 w-8 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🍪 Nous utilisons des cookies
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et
                      personnaliser le contenu. En cliquant sur "Tout accepter", vous consentez à
                      l'utilisation de tous les cookies.{' '}
                      <a
                        href="/legal/cookies-policy"
                        className="text-primary-600 hover:underline font-medium"
                        target="_blank"
                      >
                        En savoir plus
                      </a>
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAcceptAll}
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                      >
                        Tout accepter
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRejectAll}
                      >
                        Refuser tout
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        leftIcon={<Settings className="h-4 w-4" />}
                      >
                        Personnaliser
                      </Button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Panneau de paramètres détaillés */}
        {showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-2xl mx-4 mb-4 pointer-events-auto"
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary-600" />
                    Paramètres des Cookies
                  </CardTitle>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Cookies nécessaires */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Cookies Strictement Nécessaires
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ces cookies sont indispensables au fonctionnement du site. Ils permettent de
                      sauvegarder vos données et préférences.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Toujours actifs
                    </div>
                  </div>
                </div>

                {/* Cookies analytiques */}
                <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Cookies Analytiques
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ces cookies nous aident à comprendre comment vous utilisez le site pour
                      l'améliorer (Google Analytics).
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                {/* Cookies fonctionnels */}
                <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Cookies Fonctionnels
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ces cookies permettent de mémoriser vos préférences (thème, langue, etc.)
                      pour améliorer votre expérience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                  >
                    Refuser tout
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveCustom}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Enregistrer mes choix
                  </Button>
                </div>

                {/* Liens */}
                <div className="text-center text-sm text-gray-500 pt-2">
                  <a
                    href="/legal/cookies-policy"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Politique de cookies
                  </a>
                  {' • '}
                  <a
                    href="/legal/privacy-policy"
                    className="text-primary-600 hover:underline"
                    target="_blank"
                  >
                    Politique de confidentialité
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

// Hook pour vérifier si l'utilisateur a consenti
export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setHasConsent(!!consent);

    if (consent) {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  return { hasConsent, preferences };
};

