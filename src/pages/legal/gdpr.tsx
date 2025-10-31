import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Edit,
  Ban,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
// import { storageService } from '@/services/storage'; // TODO: Migrer vers Supabase

// Stub temporaire pour éviter les erreurs de build
const storageService = {
  clear: () => {},
};

const GDPRPage: React.FC = () => {
  const { user, ambitions, keyResults, quarterlyObjectives, quarterlyKeyResults, actions, okrs } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Export de toutes les données
  const handleExportData = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      user: user,
      data: {
        ambitions,
        keyResults,
        quarterlyObjectives,
        quarterlyKeyResults,
        actions,
        okrs,
      },
      metadata: {
        totalAmbitions: ambitions.length,
        totalKeyResults: keyResults.length,
        totalQuarterlyObjectives: quarterlyObjectives.length,
        totalQuarterlyKeyResults: quarterlyKeyResults.length,
        totalActions: actions.length,
        totalOKRs: okrs.length,
      }
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `okarina-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 5000);
  };

  // Suppression de toutes les données
  const handleDeleteAllData = () => {
    if (deleteConfirmText === 'SUPPRIMER') {
      localStorage.clear();
      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      
      // Recharger la page après 2 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  };

  const dataCount = {
    ambitions: ambitions.length,
    keyResults: keyResults.length,
    quarterlyObjectives: quarterlyObjectives.length,
    quarterlyKeyResults: quarterlyKeyResults.length,
    actions: actions.length,
    okrs: okrs.length,
  };

  const totalItems = Object.values(dataCount).reduce((a, b) => a + b, 0);

  return (
    <Layout
      title="Vos Droits RGPD"
      description="Gérez vos données personnelles conformément au RGPD"
      skipOnboarding
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vos Droits RGPD
          </h1>
          <p className="text-lg text-gray-600">
            Gérez vos données personnelles en toute transparence
          </p>
        </div>

        {/* Notifications */}
        {exportSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium">
                Vos données ont été exportées avec succès !
              </p>
            </div>
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-green-800 font-medium">
                Toutes vos données ont été supprimées. Redirection en cours...
              </p>
            </div>
          </div>
        )}

        {/* Vue d'ensemble des données */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary-600" />
              Vue d'Ensemble de vos Données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ambitions</p>
                <p className="text-2xl font-bold text-blue-600">{dataCount.ambitions}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Résultats Clés</p>
                <p className="text-2xl font-bold text-green-600">{dataCount.keyResults}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Objectifs Trimestriels</p>
                <p className="text-2xl font-bold text-purple-600">{dataCount.quarterlyObjectives}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">KR Trimestriels</p>
                <p className="text-2xl font-bold text-orange-600">{dataCount.quarterlyKeyResults}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Actions</p>
                <p className="text-2xl font-bold text-pink-600">{dataCount.actions}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">OKRs</p>
                <p className="text-2xl font-bold text-indigo-600">{dataCount.okrs}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total des éléments stockés</p>
              <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
            </div>

            {user && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Profil Utilisateur</p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Nom :</strong> {user.name}</p>
                  <p><strong>Email :</strong> {user.email}</p>
                  {user.company && <p><strong>Entreprise :</strong> {user.company}</p>}
                  {user.companyProfile && (
                    <>
                      <p><strong>Secteur :</strong> {user.companyProfile.industry}</p>
                      <p><strong>Taille :</strong> {user.companyProfile.size}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Droits RGPD */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Droit d'accès */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                Droit d'Accès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Vous avez le droit d'accéder à toutes vos données personnelles stockées dans l'application.
              </p>
              <Badge variant="success" size="sm">
                ✓ Disponible immédiatement
              </Badge>
            </CardContent>
          </Card>

          {/* Droit de rectification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Edit className="h-4 w-4 mr-2 text-green-600" />
                Droit de Rectification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Vous pouvez modifier vos données à tout moment via l'interface de l'application.
              </p>
              <Badge variant="success" size="sm">
                ✓ Disponible immédiatement
              </Badge>
            </CardContent>
          </Card>

          {/* Droit à la portabilité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Download className="h-4 w-4 mr-2 text-purple-600" />
                Droit à la Portabilité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Exportez toutes vos données dans un format structuré et réutilisable (JSON).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exporter mes données
              </Button>
            </CardContent>
          </Card>

          {/* Droit à l'effacement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Droit à l'Effacement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Supprimez définitivement toutes vos données personnelles de l'application.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Supprimer mes données
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Confirmer la Suppression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800 font-semibold mb-2">⚠️ Action Irréversible</p>
                    <p className="text-red-700 text-sm">
                      Cette action supprimera définitivement :
                    </p>
                    <ul className="text-red-700 text-sm mt-2 space-y-1">
                      <li>• {dataCount.ambitions} ambition(s)</li>
                      <li>• {dataCount.keyResults} résultat(s) clé(s)</li>
                      <li>• {dataCount.quarterlyObjectives} objectif(s) trimestriel(s)</li>
                      <li>• {dataCount.quarterlyKeyResults} KR trimestriel(s)</li>
                      <li>• {dataCount.actions} action(s)</li>
                      <li>• {dataCount.okrs} OKR(s)</li>
                      <li>• Votre profil utilisateur</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pour confirmer, tapez <strong>SUPPRIMER</strong> en majuscules :
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="SUPPRIMER"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleDeleteAllData}
                      disabled={deleteConfirmText !== 'SUPPRIMER'}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Supprimer Définitivement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Autres droits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Autres Droits RGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h3>Droit d'Opposition</h3>
            <p>
              Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct.
              Actuellement, OKaRina n'envoie pas d'emails marketing.
            </p>

            <h3>Droit de Limitation</h3>
            <p>
              Vous pouvez demander la limitation du traitement de vos données dans certaines circonstances.
              Contactez-nous à privacy@okarina.com pour exercer ce droit.
            </p>

            <h3>Droit de ne pas faire l'objet d'une décision automatisée</h3>
            <p>
              Les conseils de l'IA Coach sont fournis à titre informatif uniquement. Aucune décision
              automatisée ayant des effets juridiques n'est prise sur la base de ces conseils.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Besoin d'Aide ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant vos données personnelles ou pour exercer vos droits RGPD :
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Email :</strong>{' '}
                <a href="mailto:privacy@okarina.com" className="text-primary-600 hover:underline">
                  privacy@okarina.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Délai de réponse :</strong> Maximum 30 jours
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Réclamation auprès de la CNIL
              </p>
              <p className="text-sm text-blue-800">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une
                réclamation auprès de la CNIL :{' '}
                <a
                  href="https://www.cnil.fr/fr/plaintes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  www.cnil.fr/fr/plaintes
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GDPRPage;

