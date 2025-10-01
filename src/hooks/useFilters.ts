import { useMemo } from 'react';
import { 
  Action, 
  Ambition, 
  QuarterlyObjective, 
  QuarterlyKeyResult,
  Quarter,
  Priority,
  ActionStatus 
} from '@/types';
import { FilterState } from '@/components/ui/FilterPanel';

interface UseFiltersProps {
  actions: Action[];
  ambitions: Ambition[];
  quarterlyObjectives: QuarterlyObjective[];
  quarterlyKeyResults: QuarterlyKeyResult[];
  filters: FilterState;
}

interface UseFiltersReturn {
  filteredActions: Action[];
  filteredAmbitions: Ambition[];
  filteredQuarterlyObjectives: QuarterlyObjective[];
  availableLabels: string[];
  availableYears: number[];
  filterStats: {
    totalActions: number;
    filteredActions: number;
    ambitionsCount: number;
    objectivesCount: number;
  };
}

export const useFilters = ({
  actions,
  ambitions,
  quarterlyObjectives,
  quarterlyKeyResults,
  filters,
}: UseFiltersProps): UseFiltersReturn => {
  // Calculer les labels disponibles
  const availableLabels = useMemo(() => {
    const allLabels = actions.flatMap(action => action.labels);
    return Array.from(new Set(allLabels)).sort();
  }, [actions]);

  // Calculer les années disponibles
  const availableYears = useMemo(() => {
    const years = quarterlyObjectives.map(obj => obj.year);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [quarterlyObjectives]);

  // Filtrer les actions
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      // Filtre par objectif trimestriel
      if (filters.objectiveIds.length > 0) {
        if (!filters.objectiveIds.includes(action.quarterlyObjectiveId)) {
          return false;
        }
      }

      // Filtre par ambition (via l'objectif trimestriel)
      if (filters.ambitionIds.length > 0) {
        const relatedObjective = quarterlyObjectives.find(
          obj => obj.id === action.quarterlyObjectiveId
        );
        if (!relatedObjective || !filters.ambitionIds.includes(relatedObjective.ambitionId)) {
          return false;
        }
      }

      // Filtre par trimestre (via l'objectif trimestriel)
      if (filters.quarters.length > 0) {
        const relatedObjective = quarterlyObjectives.find(
          obj => obj.id === action.quarterlyObjectiveId
        );
        if (!relatedObjective || !filters.quarters.includes(relatedObjective.quarter)) {
          return false;
        }
      }

      // Filtre par année (via l'objectif trimestriel)
      if (filters.years.length > 0) {
        const relatedObjective = quarterlyObjectives.find(
          obj => obj.id === action.quarterlyObjectiveId
        );
        if (!relatedObjective || !filters.years.includes(relatedObjective.year)) {
          return false;
        }
      }

      // Filtre par priorité
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(action.priority)) {
          return false;
        }
      }

      // Filtre par statut
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(action.status)) {
          return false;
        }
      }

      // Filtre par labels
      if (filters.labels.length > 0) {
        const hasMatchingLabel = filters.labels.some(label => 
          action.labels.includes(label)
        );
        if (!hasMatchingLabel) {
          return false;
        }
      }

      return true;
    });
  }, [actions, quarterlyObjectives, filters]);

  // Filtrer les ambitions
  const filteredAmbitions = useMemo(() => {
    return ambitions.filter(ambition => {
      // Si des filtres d'ambition sont actifs, les appliquer
      if (filters.ambitionIds.length > 0) {
        return filters.ambitionIds.includes(ambition.id);
      }

      // Sinon, afficher toutes les ambitions qui ont des objectifs correspondants
      const hasRelevantObjectives = quarterlyObjectives.some(obj => {
        if (obj.ambitionId !== ambition.id) return false;

        // Vérifier les filtres de trimestre et année
        if (filters.quarters.length > 0 && !filters.quarters.includes(obj.quarter)) {
          return false;
        }
        if (filters.years.length > 0 && !filters.years.includes(obj.year)) {
          return false;
        }
        if (filters.objectiveIds.length > 0 && !filters.objectiveIds.includes(obj.id)) {
          return false;
        }

        return true;
      });

      return hasRelevantObjectives;
    });
  }, [ambitions, quarterlyObjectives, filters]);

  // Filtrer les objectifs trimestriels
  const filteredQuarterlyObjectives = useMemo(() => {
    return quarterlyObjectives.filter(obj => {
      // Filtre par ambition
      if (filters.ambitionIds.length > 0) {
        if (!filters.ambitionIds.includes(obj.ambitionId)) {
          return false;
        }
      }

      // Filtre par trimestre
      if (filters.quarters.length > 0) {
        if (!filters.quarters.includes(obj.quarter)) {
          return false;
        }
      }

      // Filtre par année
      if (filters.years.length > 0) {
        if (!filters.years.includes(obj.year)) {
          return false;
        }
      }

      // Filtre par objectif spécifique
      if (filters.objectiveIds.length > 0) {
        if (!filters.objectiveIds.includes(obj.id)) {
          return false;
        }
      }

      return true;
    });
  }, [quarterlyObjectives, filters]);

  // Statistiques de filtrage
  const filterStats = useMemo(() => {
    return {
      totalActions: actions.length,
      filteredActions: filteredActions.length,
      ambitionsCount: filteredAmbitions.length,
      objectivesCount: filteredQuarterlyObjectives.length,
    };
  }, [actions.length, filteredActions.length, filteredAmbitions.length, filteredQuarterlyObjectives.length]);

  return {
    filteredActions,
    filteredAmbitions,
    filteredQuarterlyObjectives,
    availableLabels,
    availableYears,
    filterStats,
  };
};

// Hook pour vérifier si des filtres sont actifs
export const useHasActiveFilters = (filters: FilterState): boolean => {
  return useMemo(() => {
    return Object.values(filters).some(filterArray => 
      Array.isArray(filterArray) && filterArray.length > 0
    );
  }, [filters]);
};

// Hook pour obtenir un résumé des filtres actifs
export const useActiveFiltersDescription = (
  filters: FilterState,
  ambitions: Ambition[],
  quarterlyObjectives: QuarterlyObjective[]
): string => {
  return useMemo(() => {
    const descriptions: string[] = [];

    if (filters.ambitionIds.length > 0) {
      const ambitionNames = filters.ambitionIds
        .map(id => ambitions.find(a => a.id === id)?.title)
        .filter(Boolean);
      descriptions.push(`Ambitions: ${ambitionNames.join(', ')}`);
    }

    if (filters.quarters.length > 0) {
      const quarterLabels = {
        [Quarter.Q1]: 'T1',
        [Quarter.Q2]: 'T2',
        [Quarter.Q3]: 'T3',
        [Quarter.Q4]: 'T4',
      };
      const quarterNames = filters.quarters.map(q => quarterLabels[q]);
      descriptions.push(`Trimestres: ${quarterNames.join(', ')}`);
    }

    if (filters.years.length > 0) {
      descriptions.push(`Années: ${filters.years.join(', ')}`);
    }

    if (filters.objectiveIds.length > 0) {
      const objectiveNames = filters.objectiveIds
        .map(id => quarterlyObjectives.find(o => o.id === id)?.title)
        .filter(Boolean);
      descriptions.push(`Objectifs: ${objectiveNames.join(', ')}`);
    }

    if (filters.priorities.length > 0) {
      const priorityLabels = {
        [Priority.LOW]: 'Faible',
        [Priority.MEDIUM]: 'Moyenne',
        [Priority.HIGH]: 'Haute',
        [Priority.CRITICAL]: 'Critique',
      };
      const priorityNames = filters.priorities.map(p => priorityLabels[p]);
      descriptions.push(`Priorités: ${priorityNames.join(', ')}`);
    }

    if (filters.statuses.length > 0) {
      const statusLabels = {
        [ActionStatus.TODO]: 'À faire',
        [ActionStatus.IN_PROGRESS]: 'En cours',
        [ActionStatus.DONE]: 'Terminé',
      };
      const statusNames = filters.statuses.map(s => statusLabels[s]);
      descriptions.push(`Statuts: ${statusNames.join(', ')}`);
    }

    if (filters.labels.length > 0) {
      descriptions.push(`Labels: ${filters.labels.join(', ')}`);
    }

    return descriptions.length > 0 
      ? descriptions.join(' • ') 
      : 'Aucun filtre actif';
  }, [filters, ambitions, quarterlyObjectives]);
};
