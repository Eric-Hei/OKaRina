import jsPDF from 'jspdf';
import * as ExcelJS from 'exceljs';
import { storageService } from './storage';
import { analyticsService } from './analytics';
import { ReportType } from '@/types';
import type { ReportFormat } from '@/types';

// Service d'export et de génération de rapports
export class ExportService {
  private static instance: ExportService;

  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Export PDF
  public async exportToPDF(reportType: ReportType = ReportType.MONTHLY): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Configuration
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport OKaRina', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${this.getReportTypeLabel(reportType)}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Métriques principales
    const metrics = analyticsService.getDashboardMetrics();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Métriques principales', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Ambitions totales: ${metrics.totalAmbitions}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`• OKRs actifs: ${metrics.activeOKRs}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`• Actions complétées: ${metrics.completedActions}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`• Progrès global: ${metrics.overallProgress}%`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`• Échéances à venir: ${metrics.upcomingDeadlines}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Ambitions
    const ambitions = storageService.getAmbitions();
    if (ambitions.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Ambitions', margin, yPosition);
      yPosition += lineHeight * 1.5;

      ambitions.forEach((ambition, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        const progress = analyticsService.calculateAmbitionProgress(ambition.id);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${ambition.title}`, margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Catégorie: ${ambition.category}`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Progrès: ${progress}%`, margin + 5, yPosition);
        yPosition += lineHeight;
        doc.text(`Statut: ${ambition.status}`, margin + 5, yPosition);
        yPosition += lineHeight;

        if (ambition.description) {
          const lines = doc.splitTextToSize(ambition.description, pageWidth - 2 * margin - 5);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * lineHeight;
        }
        yPosition += lineHeight;
      });
    }

    // OKRs du trimestre actuel
    const currentQuarter = this.getCurrentQuarter();
    const currentYear = new Date().getFullYear();
    const currentOKRs = storageService.getOKRs().filter(
      okr => okr.quarter === currentQuarter && okr.year === currentYear
    );

    if (currentOKRs.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`OKRs ${currentQuarter} ${currentYear}`, margin, yPosition);
      yPosition += lineHeight * 1.5;

      currentOKRs.forEach((okr, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }

        const progress = analyticsService.calculateOKRProgress(okr.id);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${okr.objective}`, margin, yPosition);
        yPosition += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Progrès: ${progress}%`, margin + 5, yPosition);
        yPosition += lineHeight * 1.5;

        okr.keyResults.forEach((kr, krIndex) => {
          const krProgress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
          doc.text(`  • ${kr.title}: ${kr.current}/${kr.target} ${kr.unit} (${Math.round(krProgress)}%)`, margin + 5, yPosition);
          yPosition += lineHeight;
        });
        yPosition += lineHeight;
      });
    }

    // Pied de page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('Généré par OKaRina', margin, pageHeight - 10);
    }

    // Téléchargement
    const fileName = `okarina-rapport-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  // Export Excel
  public async exportToExcel(reportType: ReportType = ReportType.MONTHLY): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Configuration du workbook
    workbook.creator = 'OKaRina';
    workbook.lastModifiedBy = 'OKaRina';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Feuille 1: Métriques
    const metrics = analyticsService.getDashboardMetrics();
    const metricsData = [
      ['Métrique', 'Valeur'],
      ['Ambitions totales', metrics.totalAmbitions],
      ['OKRs actifs', metrics.activeOKRs],
      ['Actions complétées', metrics.completedActions],
      ['Progrès global (%)', metrics.overallProgress],
      ['Progrès mensuel (%)', metrics.monthlyProgress],
      ['Échéances à venir', metrics.upcomingDeadlines],
    ];
    const metricsSheet = workbook.addWorksheet('Métriques');
    metricsSheet.addRows(metricsData);

    // Formatage de l'en-tête
    metricsSheet.getRow(1).font = { bold: true };
    metricsSheet.columns = [
      { width: 25 },
      { width: 15 }
    ];

    // Feuille 2: Ambitions
    const ambitions = storageService.getAmbitions();
    const ambitionsData = [
      ['Titre', 'Description', 'Catégorie', 'Priorité', 'Statut', 'Progrès (%)', 'Créé le']
    ];

    ambitions.forEach(ambition => {
      const progress = analyticsService.calculateAmbitionProgress(ambition.id);
      ambitionsData.push([
        ambition.title,
        ambition.description,
        ambition.category,
        ambition.priority,
        ambition.status,
        progress.toString(),
        new Date(ambition.createdAt).toLocaleDateString('fr-FR')
      ]);
    });

    const ambitionsSheet = workbook.addWorksheet('Ambitions');
    ambitionsSheet.addRows(ambitionsData);

    // Formatage de l'en-tête
    ambitionsSheet.getRow(1).font = { bold: true };
    ambitionsSheet.columns = [
      { width: 20 }, // Titre
      { width: 30 }, // Description
      { width: 15 }, // Catégorie
      { width: 12 }, // Priorité
      { width: 12 }, // Statut
      { width: 12 }, // Progrès
      { width: 12 }  // Créé le
    ];

    // Feuille 3: Résultats Clés
    const keyResults = storageService.getKeyResults();
    const keyResultsData = [
      ['Titre', 'Valeur Actuelle', 'Valeur Cible', 'Unité', 'Progrès (%)', 'Échéance', 'SMART']
    ];

    keyResults.forEach(kr => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      keyResultsData.push([
        kr.title,
        kr.current.toString(),
        kr.target.toString(),
        kr.unit,
        Math.round(progress).toString(),
        new Date(kr.deadline).toLocaleDateString('fr-FR'),
        'N/A' // isSmartCompliant removed
      ]);
    });

    const keyResultsSheet = workbook.addWorksheet('Résultats Clés');
    keyResultsSheet.addRows(keyResultsData);

    // Formatage de l'en-tête
    keyResultsSheet.getRow(1).font = { bold: true };
    keyResultsSheet.columns = [
      { width: 25 }, // Titre
      { width: 15 }, // Valeur Actuelle
      { width: 15 }, // Valeur Cible
      { width: 10 }, // Unité
      { width: 12 }, // Progrès
      { width: 12 }, // Échéance
      { width: 8 }   // SMART
    ];

    // Feuille 4: OKRs
    const okrs = storageService.getOKRs();
    const okrsData = [
      ['Objectif', 'Trimestre', 'Année', 'Progrès (%)', 'Statut', 'Nb KRs']
    ];

    okrs.forEach(okr => {
      const progress = analyticsService.calculateOKRProgress(okr.id);
      okrsData.push([
        okr.objective,
        okr.quarter,
        okr.year.toString(),
        progress.toString(),
        okr.status,
        okr.keyResults.length.toString()
      ]);
    });

    const okrsSheet = workbook.addWorksheet('OKRs');
    okrsSheet.addRows(okrsData);

    // Formatage de l'en-tête
    okrsSheet.getRow(1).font = { bold: true };
    okrsSheet.columns = [
      { width: 30 }, // Objectif
      { width: 12 }, // Trimestre
      { width: 8 },  // Année
      { width: 12 }, // Progrès
      { width: 12 }, // Statut
      { width: 8 }   // Nb KRs
    ];

    // Feuille 5: Actions
    const actions = storageService.getActions();
    const actionsData = [
      ['Titre', 'Description', 'Échéance', 'Statut', 'Priorité', 'Labels', 'Date de Création']
    ];

    actions.forEach(action => {
      actionsData.push([
        action.title,
        action.description || '',
        action.deadline ? new Date(action.deadline).toLocaleDateString('fr-FR') : '',
        action.status,
        action.priority,
        action.labels.join(', '),
        action.createdAt.toLocaleDateString('fr-FR')
      ]);
    });

    const actionsSheet = workbook.addWorksheet('Actions');
    actionsSheet.addRows(actionsData);

    // Formatage de l'en-tête
    actionsSheet.getRow(1).font = { bold: true };
    actionsSheet.columns = [
      { width: 25 }, // Titre
      { width: 30 }, // Description
      { width: 12 }, // Échéance
      { width: 12 }, // Statut
      { width: 12 }, // Priorité
      { width: 15 }, // Heures Estimées
      { width: 15 }  // Heures Réelles
    ];

    // Génération et téléchargement du fichier
    const fileName = `okarina-donnees-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    // Création du blob et téléchargement
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Export JSON (données complètes)
  public exportToJSON(): void {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `okarina-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Import JSON
  public async importFromJSON(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          storageService.importData(jsonData);
          resolve();
        } catch (error) {
          reject(new Error('Format de fichier invalide'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
    });
  }

  // Génération de rapport personnalisé
  public generateCustomReport(options: {
    includeAmbitions: boolean;
    includeOKRs: boolean;
    includeActions: boolean;
    includeTasks: boolean;
    includeProgress: boolean;
    format: ReportFormat;
    dateRange?: { start: Date; end: Date };
  }): void {
    switch (options.format) {
      case 'pdf':
        this.generateCustomPDF(options);
        break;
      case 'excel':
        this.generateCustomExcel(options);
        break;
      case 'json':
        this.generateCustomJSON(options);
        break;
    }
  }

  // Méthodes utilitaires privées
  private getReportTypeLabel(type: ReportType): string {
    const labels = {
      [ReportType.MONTHLY]: 'Mensuel',
      [ReportType.QUARTERLY]: 'Trimestriel',
      [ReportType.ANNUAL]: 'Annuel',
      [ReportType.CUSTOM]: 'Personnalisé'
    };
    return labels[type] || type;
  }

  private getCurrentQuarter(): string {
    const month = new Date().getMonth();
    if (month < 3) return 'Q1';
    if (month < 6) return 'Q2';
    if (month < 9) return 'Q3';
    return 'Q4';
  }

  private generateCustomPDF(options: any): void {
    // Implémentation simplifiée pour le PDF personnalisé
    this.exportToPDF(ReportType.CUSTOM);
  }

  private generateCustomExcel(options: any): void {
    // Implémentation simplifiée pour l'Excel personnalisé
    this.exportToExcel(ReportType.CUSTOM);
  }

  private generateCustomJSON(options: any): void {
    // Implémentation simplifiée pour le JSON personnalisé
    this.exportToJSON();
  }
}

// Instance singleton
export const exportService = ExportService.getInstance();
