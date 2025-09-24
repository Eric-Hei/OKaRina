import { storageService } from './storage';
import type {
  Ambition,
  KeyResult,
  OKR,
  Action,
  QuarterlyObjective,
  QuarterlyKeyResult,
  Progress,
  DashboardMetrics,
  ChartData,
} from '@/types';
import { Status, Quarter } from '@/types';

// Service d'analytics et de calcul des métriques
export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Calcul des métriques du dashboard
  public getDashboardMetrics(): DashboardMetrics {
    const ambitions = storageService.getAmbitions();
    const okrs = storageService.getOKRs();
    const actions = storageService.getActions();
    const quarterlyObjectives = storageService.getQuarterlyObjectives();
    const quarterlyKeyResults = storageService.getQuarterlyKeyResults();

    const totalAmbitions = ambitions.length;
    const activeOKRs = okrs.filter(okr => okr.status === Status.ACTIVE).length;
    const completedActions = actions.filter(action => action.status === 'done').length;
    
    const overallProgress = this.calculateOverallProgress();
    const monthlyProgress = this.calculateMonthlyProgress();
    const upcomingDeadlines = this.getUpcomingDeadlinesCount();

    return {
      totalAmbitions,
      activeOKRs,
      completedActions,
      overallProgress,
      monthlyProgress,
      upcomingDeadlines,
    };
  }

  // Calcul du progrès global
  public calculateOverallProgress(): number {
    const ambitions = storageService.getAmbitions();
    if (ambitions.length === 0) return 0;

    let totalProgress = 0;
    let totalWeight = 0;

    ambitions.forEach(ambition => {
      const ambitionProgress = this.calculateAmbitionProgress(ambition.id);
      totalProgress += ambitionProgress;
      totalWeight += 1;
    });

    return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
  }

  // Calcul du progrès d'une ambition
  public calculateAmbitionProgress(ambitionId: string): number {
    const keyResults = storageService.getKeyResults().filter(kr => kr.ambitionId === ambitionId);
    if (keyResults.length === 0) return 0;

    let totalProgress = 0;
    keyResults.forEach(kr => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      totalProgress += Math.min(progress, 100);
    });

    return Math.round(totalProgress / keyResults.length);
  }

  // Calcul du progrès d'un OKR
  public calculateOKRProgress(okrId: string): number {
    const okr = storageService.getOKRs().find(o => o.id === okrId);
    if (!okr || !okr.keyResults.length) return 0;

    let totalProgress = 0;
    let totalWeight = 0;

    okr.keyResults.forEach(kr => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      const weight = kr.weight / 100;
      totalProgress += Math.min(progress, 100) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
  }

  // Calcul du progrès mensuel
  public calculateMonthlyProgress(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const progressRecords = storageService.getProgress().filter(p => {
      const recordDate = new Date(p.recordedAt);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    if (progressRecords.length === 0) return 0;

    const totalProgress = progressRecords.reduce((sum, p) => sum + p.value, 0);
    return Math.round(totalProgress / progressRecords.length);
  }

  // Nombre d'échéances à venir (7 prochains jours)
  public getUpcomingDeadlinesCount(): number {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const keyResults = storageService.getKeyResults();
    const actions = storageService.getActions();
    const quarterlyKeyResults = storageService.getQuarterlyKeyResults();

    let count = 0;

    keyResults.forEach(kr => {
      const deadline = new Date(kr.deadline);
      if (deadline >= now && deadline <= nextWeek) count++;
    });

    actions.forEach(action => {
      if (action.deadline) {
        const deadline = new Date(action.deadline);
        if (deadline >= now && deadline <= nextWeek) count++;
      }
    });

    quarterlyKeyResults.forEach(qkr => {
      const deadline = new Date(qkr.deadline);
      if (deadline >= now && deadline <= nextWeek) count++;
    });

    return count;
  }

  // Données pour graphique de progression par catégorie
  public getProgressByCategory(): ChartData[] {
    const ambitions = storageService.getAmbitions();
    const categoryProgress: { [key: string]: { total: number; count: number } } = {};

    ambitions.forEach(ambition => {
      const progress = this.calculateAmbitionProgress(ambition.id);
      const category = ambition.category;

      if (!categoryProgress[category]) {
        categoryProgress[category] = { total: 0, count: 0 };
      }

      categoryProgress[category].total += progress;
      categoryProgress[category].count += 1;
    });

    return Object.entries(categoryProgress).map(([category, data]) => ({
      name: this.getCategoryLabel(category),
      value: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));
  }

  // Données pour graphique de progression trimestrielle
  public getQuarterlyProgress(): ChartData[] {
    const okrs = storageService.getOKRs();
    const currentYear = new Date().getFullYear();
    
    const quarterProgress: { [key: string]: { total: number; count: number } } = {};

    okrs.filter(okr => okr.year === currentYear).forEach(okr => {
      const progress = this.calculateOKRProgress(okr.id);
      const quarter = okr.quarter;

      if (!quarterProgress[quarter]) {
        quarterProgress[quarter] = { total: 0, count: 0 };
      }

      quarterProgress[quarter].total += progress;
      quarterProgress[quarter].count += 1;
    });

    return Object.values(Quarter).map(quarter => ({
      name: quarter,
      value: quarterProgress[quarter] 
        ? Math.round(quarterProgress[quarter].total / quarterProgress[quarter].count)
        : 0,
    }));
  }

  // Évolution du progrès dans le temps
  public getProgressEvolution(days: number = 30): ChartData[] {
    const progressRecords = storageService.getProgress();
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyProgress: { [key: string]: number[] } = {};

    progressRecords
      .filter(p => new Date(p.recordedAt) >= startDate)
      .forEach(p => {
        const date = new Date(p.recordedAt).toISOString().split('T')[0];
        if (!dailyProgress[date]) {
          dailyProgress[date] = [];
        }
        dailyProgress[date].push(p.value);
      });

    const result: ChartData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = dailyProgress[dateStr] || [];
      const avgProgress = dayProgress.length > 0 
        ? dayProgress.reduce((sum, val) => sum + val, 0) / dayProgress.length
        : 0;

      result.push({
        name: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        value: Math.round(avgProgress),
      });
    }

    return result;
  }

  // Analyse des tendances
  public getTrendAnalysis(): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    message: string;
  } {
    const last7Days = this.getProgressEvolution(7);
    const last14Days = this.getProgressEvolution(14);

    if (last7Days.length < 2 || last14Days.length < 2) {
      return {
        trend: 'stable',
        percentage: 0,
        message: 'Pas assez de données pour analyser la tendance',
      };
    }

    const recentAvg = last7Days.slice(-3).reduce((sum, d) => sum + d.value, 0) / 3;
    const previousAvg = last14Days.slice(-7, -4).reduce((sum, d) => sum + d.value, 0) / 3;

    const difference = recentAvg - previousAvg;
    const percentage = previousAvg > 0 ? Math.abs(difference / previousAvg) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let message = '';

    if (Math.abs(difference) < 2) {
      trend = 'stable';
      message = 'Votre progression est stable';
    } else if (difference > 0) {
      trend = 'up';
      message = `Excellente progression ! +${percentage.toFixed(1)}% cette semaine`;
    } else {
      trend = 'down';
      message = `Attention, ralentissement de ${percentage.toFixed(1)}% cette semaine`;
    }

    return { trend, percentage: Math.round(percentage), message };
  }

  // Statistiques détaillées
  public getDetailedStats() {
    const ambitions = storageService.getAmbitions();
    const keyResults = storageService.getKeyResults();
    const okrs = storageService.getOKRs();
    const actions = storageService.getActions();
    const quarterlyObjectives = storageService.getQuarterlyObjectives();
    const quarterlyKeyResults = storageService.getQuarterlyKeyResults();

    return {
      ambitions: {
        total: ambitions.length,
        byStatus: this.groupByStatus(ambitions),
        byCategory: this.groupByCategory(ambitions),
      },
      keyResults: {
        total: keyResults.length,
        completed: keyResults.filter(kr => kr.current >= kr.target).length,
        averageProgress: this.calculateAverageKRProgress(),
      },
      okrs: {
        total: okrs.length,
        byQuarter: this.groupOKRsByQuarter(okrs),
        averageProgress: this.calculateAverageOKRProgress(),
      },
      actions: {
        total: actions.length,
        completed: actions.filter(a => a.status === 'done').length,
        overdue: this.getOverdueActions().length,
      },
      quarterlyObjectives: {
        total: quarterlyObjectives.length,
        byStatus: this.groupByStatus(quarterlyObjectives),
      },
      quarterlyKeyResults: {
        total: quarterlyKeyResults.length,
        completed: quarterlyKeyResults.filter(qkr => qkr.current >= qkr.target).length,
        averageProgress: this.calculateAverageKRProgress(),
      },
    };
  }

  // Méthodes utilitaires privées
  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      revenue: 'Chiffre d\'affaires',
      growth: 'Croissance',
      product: 'Produit',
      team: 'Équipe',
      market: 'Marché',
      operational: 'Opérationnel',
      personal: 'Personnel',
    };
    return labels[category] || category;
  }

  private groupByStatus(items: any[]): { [key: string]: number } {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByCategory(ambitions: Ambition[]): { [key: string]: number } {
    return ambitions.reduce((acc, ambition) => {
      acc[ambition.category] = (acc[ambition.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private groupOKRsByQuarter(okrs: OKR[]): { [key: string]: number } {
    return okrs.reduce((acc, okr) => {
      acc[okr.quarter] = (acc[okr.quarter] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private calculateAverageKRProgress(): number {
    const keyResults = storageService.getKeyResults();
    if (keyResults.length === 0) return 0;

    const totalProgress = keyResults.reduce((sum, kr) => {
      const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0);

    return Math.round(totalProgress / keyResults.length);
  }

  private calculateAverageOKRProgress(): number {
    const okrs = storageService.getOKRs();
    if (okrs.length === 0) return 0;

    const totalProgress = okrs.reduce((sum, okr) => {
      return sum + this.calculateOKRProgress(okr.id);
    }, 0);

    return Math.round(totalProgress / okrs.length);
  }

  private getOverdueActions(): Action[] {
    const now = new Date();
    return storageService.getActions().filter(action => {
      return action.deadline && new Date(action.deadline) < now && action.status !== 'done';
    });
  }
}

// Instance singleton
export const analyticsService = AnalyticsService.getInstance();
