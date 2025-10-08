import React, { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { geminiService } from '@/services/gemini';
import { formatDate, getCurrentQuarter } from '@/utils';
import { Download, Brain, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { ActionStatus } from '@/types';

const RetrospectivePage: React.FC = () => {
  const { quarterlyKeyResults, actions, user } = useAppStore();
  const [aiText, setAiText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentQuarter = useMemo(() => getCurrentQuarter(), []);
  const currentYear = new Date().getFullYear();

  const scopedKRs = useMemo(() => {
    // Dans ce MVP on prend tous les KR existants; on pourrait filtrer par quarter si stocké
    return quarterlyKeyResults;
  }, [quarterlyKeyResults]);

  const actionsDone = actions.filter(a => a.status === ActionStatus.DONE).length;
  const actionsTotal = actions.length;

  const analyzeWithAI = async () => {
    setIsLoading(true);
    try {
      const text = await geminiService.generateQuarterRetrospective({
        quarterName: currentQuarter,
        year: currentYear,
        keyResults: scopedKRs,
        actionsDone,
        actionsTotal,
        companyProfile: user?.companyProfile,
      });
      setAiText(text);
    } catch (e: any) {
      setAiText(
        `Rétrospective (fallback):\n\n` +
        `Résumé exécutif: Bonne dynamique globale, mais des blocages subsistent sur quelques KR proches de l'échéance.\n\n` +
        `Réussites majeures:\n• Exécution régulière des actions clés\n• Amélioration continue sur les KR prioritaires\n• Respect des jalons critiques\n\n` +
        `Blocages/risques:\n• Dépendances externes\n• Priorisation surchargée\n• Manque de focus hebdo\n\n` +
        `Priorités T+1:\n• Verrouiller 3 actions à fort levier\n• Lever 1 blocage majeur\n• Organiser un check-in (hebdo) rigoureux`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Rétrospective ${currentQuarter} ${currentYear} — OKaRina`, margin, y);
    y += 24;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    const meta = `Actions terminées: ${actionsDone}/${actionsTotal}`;
    doc.text(meta, margin, y);
    y += 14;

    const text = aiText || 'Générez d’abord une analyse IA pour enrichir le rapport.';
    const lines = doc.splitTextToSize(text, 515);
    doc.text(lines, margin, y);
    doc.save(`retrospective_${currentQuarter}_${currentYear}.pdf`);
  };

  return (
    <Layout title="Rétrospective IA" requireAuth>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rétrospective trimestrielle (IA)</h1>
            <p className="text-gray-600">Synthèse du trimestre et préparation du prochain.</p>
          </div>
          <Badge variant="secondary" size="sm" className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {currentQuarter} {currentYear}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                Rapport (brouillon IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-md min-h-[240px]">
                {aiText || 'Cliquez sur “Analyser avec l\'IA” pour générer une rétrospective structurée.'}
              </pre>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={analyzeWithAI}
                    isLoading={isLoading}
                    leftIcon={<Brain className="h-4 w-4" />}
                  >
                    Analyser avec l'IA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportPDF}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Exporter en PDF
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  Conseil: peaufinez votre rapport, puis exportez-le et partagez-le à votre équipe.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chiffres clés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Actions terminées: {actionsDone}/{actionsTotal}</li>
                  <li>• KR suivis: {scopedKRs.length}</li>
                  <li>• Dernière mise à jour: {formatDate(new Date())}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RetrospectivePage;

