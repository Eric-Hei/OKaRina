import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { shareService, ShareSnapshot } from '@/services/share';
import { Button } from '@/components/ui/Button';
import { Link2, Eye } from 'lucide-react';

const SharePage: React.FC = () => {
  const router = useRouter();
  const dataParam = typeof router.query.data === 'string' ? router.query.data : '';

  const snapshot = useMemo<ShareSnapshot | null>(() => {
    if (!dataParam) return null;
    return shareService.decode(dataParam);
  }, [dataParam]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier');
    } catch {}
  };

  return (
    <Layout title="Partage public (lecture seule)">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Vous consultez une vue publique en lecture seule.</span>
          </div>
          <Button size="sm" variant="outline" onClick={copyUrl} leftIcon={<Link2 className="h-4 w-4" />}>Copier le lien</Button>
        </div>

        {!snapshot ? (
          <Card>
            <CardHeader>
              <CardTitle>Données de partage manquantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Le lien ne contient pas de données ou est invalide.</p>
            </CardContent>
          </Card>
        ) : snapshot.type === 'quarterly_objective' ? (
          <Card>
            <CardHeader>
              <CardTitle>Objectif Trimestriel — {snapshot.objective.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">{snapshot.objective.description}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{snapshot.objective.quarter} {snapshot.objective.year}</Badge>
                  <Badge variant="info">{snapshot.keyResults.length} KR</Badge>
                  <Badge variant="success">{snapshot.actions.length} actions</Badge>
                </div>
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Résultats clés</h3>
                  <div className="space-y-2">
                    {snapshot.keyResults.map(kr => (
                      <div key={kr.id} className="p-3 rounded-md border bg-white">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{kr.title}</div>
                          <div className="text-xs text-gray-600">{kr.current}/{kr.target} {kr.unit}</div>
                        </div>
                        {kr.description && (
                          <div className="text-xs text-gray-600 mt-1">{kr.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {snapshot.actions.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
                    <div className="space-y-2">
                      {snapshot.actions.map(a => (
                        <div key={a.id} className="p-2 rounded-md border bg-white text-xs text-gray-700 flex items-center justify-between">
                          <div className="truncate pr-2">{a.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{a.status}</Badge>
                            {a.deadline && (
                              <Badge variant="secondary">{new Date(a.deadline).toLocaleDateString('fr-FR')}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-4">Généré le {new Date(snapshot.generatedAt).toLocaleString('fr-FR')}</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Résultat Clé — {snapshot.keyResult.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snapshot.keyResult.description && (
                  <div className="text-sm text-gray-600">{snapshot.keyResult.description}</div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="info">{snapshot.keyResult.current}/{snapshot.keyResult.target} {snapshot.keyResult.unit}</Badge>
                  {snapshot.keyResult.deadline && (
                    <Badge variant="secondary">Échéance: {new Date(snapshot.keyResult.deadline).toLocaleDateString('fr-FR')}</Badge>
                  )}
                  <Badge variant="secondary">KR</Badge>
                </div>
                {snapshot.actions.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
                    <div className="space-y-2">
                      {snapshot.actions.map(a => (
                        <div key={a.id} className="p-2 rounded-md border bg-white text-xs text-gray-700 flex items-center justify-between">
                          <div className="truncate pr-2">{a.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{a.status}</Badge>
                            {a.deadline && (
                              <Badge variant="secondary">{new Date(a.deadline).toLocaleDateString('fr-FR')}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-4">Généré le {new Date(snapshot.generatedAt).toLocaleString('fr-FR')}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SharePage;

