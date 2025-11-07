import type { QuarterlyObjective, QuarterlyKeyResult, Action } from '@/types';

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

function buildObjectiveSnapshot(
  objective: QuarterlyObjective,
  keyResults: QuarterlyKeyResult[],
  actions: Action[]
): ShareSnapshot {

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

function buildKRSnapshot(
  kr: QuarterlyKeyResult,
  actions: Action[]
): ShareSnapshot {
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
  buildShareLinkForObjective(
    objective: QuarterlyObjective,
    keyResults: QuarterlyKeyResult[],
    actions: Action[]
  ): string | null {
    if (typeof window === 'undefined') return null;
    const snapshot = buildObjectiveSnapshot(objective, keyResults, actions);
    const data = encodeSnapshot(snapshot);
    return `${window.location.origin}/share?data=${data}`;
  },
  buildShareLinkForKR(
    kr: QuarterlyKeyResult,
    actions: Action[]
  ): string | null {
    if (typeof window === 'undefined') return null;
    const snapshot = buildKRSnapshot(kr, actions);
    const data = encodeSnapshot(snapshot);
    return `${window.location.origin}/share?data=${data}`;
  },
  decode(data: string) {
    return decodeSnapshot(data);
  }
};

