import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cookie, Settings, Eye, Ban } from 'lucide-react';

const CookiesPolicyPage: React.FC = () => {
  return (
    <Layout
      title="Politique de Cookies"
      description="Politique d'utilisation des cookies - OKaRina"
      skipOnboarding
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <Cookie className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Cookies
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Qu'est-ce qu'un cookie ?</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette)
              lors de la visite d'un site web. Les cookies permettent au site de mémoriser vos actions et
              préférences pendant une certaine période.
            </p>
          </CardContent>
        </Card>

        {/* Cookies utilisés */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary-600" />
              Cookies Utilisés par OKaRina
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>1. Cookies Strictement Nécessaires (Exemptés de consentement)</h3>
            <p>
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie</th>
                    <th className="text-left py-2">Finalité</th>
                    <th className="text-left py-2">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code>okarina-app-store</code></td>
                    <td className="py-2">Sauvegarde de vos données (objectifs, ambitions)</td>
                    <td className="py-2">Persistant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code>okarina_consent</code></td>
                    <td className="py-2">Mémorisation de vos choix de cookies</td>
                    <td className="py-2">13 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>2. Cookies de Performance et Analytiques (Nécessitent votre consentement)</h3>
            <p>
              Ces cookies nous aident à comprendre comment les visiteurs utilisent le site afin de l'améliorer.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie</th>
                    <th className="text-left py-2">Finalité</th>
                    <th className="text-left py-2">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code>_ga</code></td>
                    <td className="py-2">Google Analytics - Statistiques d'utilisation</td>
                    <td className="py-2">2 ans</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code>_gid</code></td>
                    <td className="py-2">Google Analytics - Identification des sessions</td>
                    <td className="py-2">24 heures</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>3. Cookies Fonctionnels (Nécessitent votre consentement)</h3>
            <p>
              Ces cookies permettent d'améliorer votre expérience en mémorisant vos préférences.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie</th>
                    <th className="text-left py-2">Finalité</th>
                    <th className="text-left py-2">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code>okarina_theme</code></td>
                    <td className="py-2">Mémorisation du thème (clair/sombre)</td>
                    <td className="py-2">1 an</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code>okarina_lang</code></td>
                    <td className="py-2">Mémorisation de la langue</td>
                    <td className="py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>4. Cookies Publicitaires (Non utilisés actuellement)</h3>
            <p>
              OKaRina n'utilise actuellement aucun cookie publicitaire ou de ciblage.
            </p>
          </CardContent>
        </Card>

        {/* LocalStorage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>LocalStorage et Technologies Similaires</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              En plus des cookies, OKaRina utilise le <strong>localStorage</strong> de votre navigateur
              pour stocker vos données d'application (objectifs, ambitions, résultats clés, etc.).
            </p>
            
            <h3>Données stockées dans le localStorage :</h3>
            <ul>
              <li>Vos ambitions et objectifs</li>
              <li>Vos résultats clés et actions</li>
              <li>Votre profil d'entreprise</li>
              <li>Vos préférences d'affichage</li>
            </ul>

            <p>
              Ces données restent sur votre appareil et ne sont pas transmises à nos serveurs
              (sauf pour les interactions avec l'IA coach Google Gemini).
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-blue-900 font-semibold mb-2">💡 Important</p>
              <p className="text-blue-800 text-sm">
                Si vous videz le cache de votre navigateur ou supprimez le localStorage, toutes vos
                données seront perdues. Pensez à exporter régulièrement vos données (Export JSON).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gestion des cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary-600" />
              Gérer vos Préférences de Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>1. Via le bandeau de consentement</h3>
            <p>
              Lors de votre première visite, un bandeau vous permet de choisir les cookies que vous
              acceptez. Vous pouvez modifier vos choix à tout moment en cliquant sur le lien
              "Paramètres des cookies" en bas de page.
            </p>

            <h3>2. Via votre navigateur</h3>
            <p>
              Vous pouvez configurer votre navigateur pour refuser tous les cookies ou être alerté
              lorsqu'un cookie est déposé :
            </p>

            <ul>
              <li>
                <strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies
              </li>
              <li>
                <strong>Firefox</strong> : Paramètres → Vie privée et sécurité → Cookies
              </li>
              <li>
                <strong>Safari</strong> : Préférences → Confidentialité → Cookies
              </li>
              <li>
                <strong>Edge</strong> : Paramètres → Cookies et autorisations de site
              </li>
            </ul>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4">
              <p className="text-orange-900 font-semibold mb-2">⚠️ Attention</p>
              <p className="text-orange-800 text-sm">
                Le blocage de tous les cookies peut empêcher le bon fonctionnement de l'application,
                notamment la sauvegarde de vos données.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies tiers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cookies Tiers</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>Google Gemini AI</h3>
            <p>
              Lorsque vous utilisez l'IA Coach, vos données (profil d'entreprise, objectifs) sont
              envoyées à l'API Google Gemini. Google peut déposer ses propres cookies conformément
              à sa politique de confidentialité :
              <br />
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Politique de confidentialité de Google
              </a>
            </p>

            <h3>Netlify (Hébergement)</h3>
            <p>
              Notre site est hébergé sur Netlify, qui peut déposer des cookies techniques pour
              assurer le bon fonctionnement du service :
              <br />
              <a
                href="https://www.netlify.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Politique de confidentialité de Netlify
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Durée de conservation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Durée de Conservation</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>Les cookies ont des durées de vie variables :</p>
            <ul>
              <li><strong>Cookies de session</strong> : Supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies persistants</strong> : Conservés jusqu'à leur date d'expiration ou suppression manuelle</li>
            </ul>
            <p>
              Conformément à la réglementation, les cookies (hors cookies strictement nécessaires)
              ont une durée de vie maximale de 13 mois.
            </p>
          </CardContent>
        </Card>

        {/* Vos droits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ban className="h-5 w-5 mr-2 text-red-600" />
              Vos Droits
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>Vous disposez des droits suivants concernant les cookies :</p>
            <ul>
              <li><strong>Droit d'opposition</strong> : Refuser les cookies non essentiels</li>
              <li><strong>Droit de retrait</strong> : Retirer votre consentement à tout moment</li>
              <li><strong>Droit d'accès</strong> : Savoir quels cookies sont déposés</li>
              <li><strong>Droit de suppression</strong> : Supprimer les cookies via votre navigateur</li>
            </ul>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifications de cette Politique</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              Nous pouvons modifier cette politique de cookies à tout moment pour refléter les
              changements dans nos pratiques ou pour des raisons légales. La date de dernière mise
              à jour est indiquée en haut de cette page.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>Pour toute question concernant notre utilisation des cookies :</p>
            <ul>
              <li>Email : <strong>privacy@okarina.com</strong></li>
              <li>Email général : <strong>contact@okarina.com</strong></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CookiesPolicyPage;

