import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { storageService } from './storage';
import { analyticsService } from './analytics';
import type { ReportType, ReportFormat } from '@/types';

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
  public async exportToPDF(reportType: ReportType = 'monthly'): Promise<void> {
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
          const krProgress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
          doc.text(`  • ${kr.title}: ${kr.currentValue}/${kr.targetValue} ${kr.unit} (${Math.round(krProgress)}%)`, margin + 5, yPosition);
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
  public async exportToExcel(reportType: ReportType = 'monthly'): Promise<void> {
    const workbook = XLSX.utils.book_new();

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
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métriques');

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
        progress,
        new Date(ambition.createdAt).toLocaleDateString('fr-FR')
      ]);
    });
    
    const ambitionsSheet = XLSX.utils.aoa_to_sheet(ambitionsData);
    XLSX.utils.book_append_sheet(workbook, ambitionsSheet, 'Ambitions');

    // Feuille 3: Résultats Clés
    const keyResults = storageService.getKeyResults();
    const keyResultsData = [
      ['Titre', 'Valeur Actuelle', 'Valeur Cible', 'Unité', 'Progrès (%)', 'Échéance', 'SMART']
    ];
    
    keyResults.forEach(kr => {
      const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
      keyResultsData.push([
        kr.title,
        kr.currentValue,
        kr.targetValue,
        kr.unit,
        Math.round(progress),
        new Date(kr.deadline).toLocaleDateString('fr-FR'),
        kr.isSmartCompliant ? 'Oui' : 'Non'
      ]);
    });
    
    const keyResultsSheet = XLSX.utils.aoa_to_sheet(keyResultsData);
    XLSX.utils.book_append_sheet(workbook, keyResultsSheet, 'Résultats Clés');

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
        okr.year,
        progress,
        okr.status,
        okr.keyResults.length
      ]);
    });
    
    const okrsSheet = XLSX.utils.aoa_to_sheet(okrsData);
    XLSX.utils.book_append_sheet(workbook, okrsSheet, 'OKRs');

    // Feuille 5: Actions
    const actions = storageService.getActions();
    const actionsData = [
      ['Titre', 'Description', 'Échéance', 'Statut', 'Priorité', 'Heures Estimées', 'Heures Réelles']
    ];
    
    actions.forEach(action => {
      actionsData.push([
        action.title,
        action.description,
        new Date(action.deadline).toLocaleDateString('fr-FR'),
        action.status,
        action.priority,
        action.estimatedHours || 0,
        action.actualHours || 0
      ]);
    });
    
    const actionsSheet = XLSX.utils.aoa_to_sheet(actionsData);
    XLSX.utils.book_append_sheet(workbook, actionsSheet, 'Actions');

    // Téléchargement
    const fileName = `okarina-donnees-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      annual: 'Annuel',
      custom: 'Personnalisé'
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
    this.exportToPDF('custom');
  }

  private generateCustomExcel(options: any): void {
    // Implémentation simplifiée pour l'Excel personnalisé
    this.exportToExcel('custom');
  }

  private generateCustomJSON(options: any): void {
    // Implémentation simplifiée pour le JSON personnalisé
    this.exportToJSON();
  }
}

// Instance singleton
export const exportService = ExportService.getInstance();
