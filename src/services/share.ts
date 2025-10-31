// import { storageService } from '@/services/storage'; // TODO: Migrer vers Supabase
import type { QuarterlyObjective, QuarterlyKeyResult, Action } from '@/types';

// Stub temporaire pour éviter les erreurs de build
const storageService = {
  getQuarterlyObjectives: () => [] as QuarterlyObjective[],
  getQuarterlyKeyResults: () => [] as QuarterlyKeyResult[],
  getActions: () => [] as Action[],
};

export type ShareSnapshot =
  | {
      type: 'quarterly_objective';
      generatedAt: string;
      objective: Pick<QuarterlyObjective, 'id' | 'title' | 'description' | 'quarter' | 'year'>;
      keyResults: Array<Pick<QuarterlyKeyResult, 'id' | 'title' | 'description' | 'target' | 'current' | 'unit' | 'deadline'>>;
      actions: Array<Pick<Action, 'id' | 'title' | 'status' | 'priority' | 'labels' | 'deadline'>>;
    }
  | {
      type: 'quarterly_key_result';
      generatedAt: string;
      keyResult: Pick<QuarterlyKeyResult, 'id' | 'title' | 'description' | 'target' | 'current' | 'unit' | 'deadline' | 'quarterlyObjectiveId'>;
      actions: Array<Pick<Action, 'id' | 'title' | 'status' | 'priority' | 'labels' | 'deadline'>>;
    };

function encodeSnapshot(snapshot: ShareSnapshot): string {
  const json = JSON.stringify(snapshot);
  // Base64 URL-safe
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSnapshot(data: string): ShareSnapshot | null {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json) as ShareSnapshot;
  } catch (e) {
    console.error('Invalid shared data', e);
    return null;
  }
}

function buildObjectiveSnapshot(objectiveId: string): ShareSnapshot | null {
  const objective = storageService.getQuarterlyObjectives().find(o => o.id === objectiveId);
  if (!objective) return null;
  const keyResults = storageService
    .getQuarterlyKeyResults()
    .filter(kr => kr.quarterlyObjectiveId === objectiveId);
  const actions = storageService
    .getActions()
    .filter(a => keyResults.some(kr => kr.id === a.quarterlyKeyResultId));

  return {
    type: 'quarterly_objective',
    generatedAt: new Date().toISOString(),
    objective: {
      id: objective.id,
      title: objective.title,
      description: objective.description,
      quarter: objective.quarter,
      year: objective.year,
    },
    keyResults: keyResults.map(kr => ({
      id: kr.id,
      title: kr.title,
      description: kr.description,
      target: kr.target,
      current: kr.current,
      unit: kr.unit,
      deadline: kr.deadline,
    })),
    actions: actions.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      priority: a.priority,
      labels: a.labels,
      deadline: a.deadline,
    })),
  };
}

function buildKRSnapshot(krId: string): ShareSnapshot | null {
  const kr = storageService.getQuarterlyKeyResults().find(k => k.id === krId);
  if (!kr) return null;
  const actions = storageService.getActions().filter(a => a.quarterlyKeyResultId === krId);
  return {
    type: 'quarterly_key_result',
    generatedAt: new Date().toISOString(),
    keyResult: {
      id: kr.id,
      title: kr.title,
      description: kr.description,
      target: kr.target,
      current: kr.current,
      unit: kr.unit,
      deadline: kr.deadline,
      quarterlyObjectiveId: kr.quarterlyObjectiveId,
    },
    actions: actions.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      priority: a.priority,
      labels: a.labels,
      deadline: a.deadline,
    })),
  };
}

export const shareService = {
  buildShareLinkForObjective(objectiveId: string): string | null {
    if (typeof window === 'undefined') return null;
    const snapshot = buildObjectiveSnapshot(objectiveId);
    if (!snapshot) return null;
    const data = encodeSnapshot(snapshot);
    return `${window.location.origin}/share?data=${data}`;
  },
  buildShareLinkForKR(krId: string): string | null {
    if (typeof window === 'undefined') return null;
    const snapshot = buildKRSnapshot(krId);
    if (!snapshot) return null;
    const data = encodeSnapshot(snapshot);
    return `${window.location.origin}/share?data=${data}`;
  },
  decode(data: string) {
    return decodeSnapshot(data);
  }
};

