/**
 * Service hybride qui utilise Supabase si disponible, sinon localStorage
 *
 * Ce service fait le pont entre le store Zustand et les services de base de données
 */

import { isSupabaseConfigured } from '@/lib/supabaseClient';
// import { storageService } from '@/services/storage'; // TODO: Migrer vers Supabase
import {
  AmbitionsService,
  KeyResultsService,
  QuarterlyObjectivesService,
  QuarterlyKeyResultsService,
  ActionsService,
  ProgressService,
} from './index';
import type {
  Ambition,
  KeyResult,
  QuarterlyObjective,
  QuarterlyKeyResult,
  Action,
  Progress,
  EntityType,
  ActionStatus,
  Quarter,
} from '@/types';

// Stub temporaire pour éviter les erreurs de build
const storageService = {
  getAmbitions: () => [] as Ambition[],
  getKeyResults: () => [] as KeyResult[],
  getQuarterlyObjectives: () => [] as QuarterlyObjective[],
  getQuarterlyKeyResults: () => [] as QuarterlyKeyResult[],
  getActions: () => [] as Action[],
  getProgress: () => [] as Progress[],
  addAmbition: (_ambition: Ambition) => {},
  updateAmbition: (_id: string, _updates: Partial<Ambition>) => {},
  deleteAmbition: (_id: string) => {},
  addKeyResult: (_keyResult: KeyResult) => {},
  updateKeyResult: (_id: string, _updates: Partial<KeyResult>) => {},
  deleteKeyResult: (_id: string) => {},
  addQuarterlyObjective: (_objective: QuarterlyObjective) => {},
  updateQuarterlyObjective: (_id: string, _updates: Partial<QuarterlyObjective>) => {},
  deleteQuarterlyObjective: (_id: string) => {},
  addQuarterlyKeyResult: (_keyResult: QuarterlyKeyResult) => {},
  updateQuarterlyKeyResult: (_id: string, _updates: Partial<QuarterlyKeyResult>) => {},
  deleteQuarterlyKeyResult: (_id: string) => {},
  addAction: (_action: Action) => {},
  updateAction: (_id: string, _updates: Partial<Action>) => {},
  deleteAction: (_id: string) => {},
  addProgress: (_progress: Progress) => {},
};

/**
 * Service de données hybride (Supabase + localStorage fallback)
 */
export class DataService {
  // ============================================================================
  // AMBITIONS
  // ============================================================================

  static async getAmbitions(userId: string, year?: number): Promise<Ambition[]> {
    if (isSupabaseConfigured()) {
      try {
        return await AmbitionsService.getAll(userId, year);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getAmbitions();
      }
    }
    return storageService.getAmbitions();
  }

  static async createAmbition(ambition: Partial<Ambition>, userId: string): Promise<Ambition> {
    console.log('🔧 DataService.createAmbition - Début');
    console.log('🔧 isSupabaseConfigured:', isSupabaseConfigured());

    if (isSupabaseConfigured()) {
      console.log('🔧 Utilisation de Supabase');
      const created = await AmbitionsService.create(ambition, userId);
      console.log('🔧 Ambition créée dans Supabase:', created);
      // Sauvegarder aussi en localStorage pour le cache
      storageService.addAmbition(created);
      return created;
    }
    console.log('🔧 Utilisation de localStorage (fallback)');
    const newAmbition = { ...ambition, id: ambition.id || crypto.randomUUID() } as Ambition;
    storageService.addAmbition(newAmbition);
    return newAmbition;
  }

  static async updateAmbition(id: string, updates: Partial<Ambition>, userId: string): Promise<Ambition> {
    if (isSupabaseConfigured()) {
      const updated = await AmbitionsService.update(id, updates, userId);
      storageService.updateAmbition(id, updates);
      return updated;
    }
    storageService.updateAmbition(id, updates);
    const ambitions = storageService.getAmbitions();
    return ambitions.find(a => a.id === id)!;
  }

  static async deleteAmbition(id: string, userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await AmbitionsService.delete(id, userId);
    }
    storageService.deleteAmbition(id);
  }

  // ============================================================================
  // KEY RESULTS
  // ============================================================================

  static async getKeyResults(ambitionId: string): Promise<KeyResult[]> {
    if (isSupabaseConfigured()) {
      try {
        return await KeyResultsService.getByAmbitionId(ambitionId);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getKeyResults().filter(kr => kr.ambitionId === ambitionId);
      }
    }
    return storageService.getKeyResults().filter(kr => kr.ambitionId === ambitionId);
  }

  static async createKeyResult(keyResult: Partial<KeyResult>): Promise<KeyResult> {
    if (isSupabaseConfigured()) {
      const created = await KeyResultsService.create(keyResult);
      storageService.addKeyResult(created);
      return created;
    }
    const newKR = { ...keyResult, id: keyResult.id || crypto.randomUUID() } as KeyResult;
    storageService.addKeyResult(newKR);
    return newKR;
  }

  static async updateKeyResult(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    if (isSupabaseConfigured()) {
      const updated = await KeyResultsService.update(id, updates);
      storageService.updateKeyResult(id, updates);
      return updated;
    }
    storageService.updateKeyResult(id, updates);
    const keyResults = storageService.getKeyResults();
    return keyResults.find(kr => kr.id === id)!;
  }

  static async deleteKeyResult(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await KeyResultsService.delete(id);
    }
    storageService.deleteKeyResult(id);
  }

  // ============================================================================
  // QUARTERLY OBJECTIVES
  // ============================================================================

  static async getQuarterlyObjectives(userId: string, quarter?: Quarter, year?: number): Promise<QuarterlyObjective[]> {
    if (isSupabaseConfigured()) {
      try {
        return await QuarterlyObjectivesService.getAll(userId, quarter, year);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getQuarterlyObjectives();
      }
    }
    return storageService.getQuarterlyObjectives();
  }

  static async createQuarterlyObjective(objective: Partial<QuarterlyObjective>, userId: string): Promise<QuarterlyObjective> {
    if (isSupabaseConfigured()) {
      const created = await QuarterlyObjectivesService.create(objective, userId);
      storageService.addQuarterlyObjective(created);
      return created;
    }
    const newObj = { ...objective, id: objective.id || crypto.randomUUID() } as QuarterlyObjective;
    storageService.addQuarterlyObjective(newObj);
    return newObj;
  }

  static async updateQuarterlyObjective(id: string, updates: Partial<QuarterlyObjective>, userId: string): Promise<QuarterlyObjective> {
    if (isSupabaseConfigured()) {
      const updated = await QuarterlyObjectivesService.update(id, updates, userId);
      storageService.updateQuarterlyObjective(id, updates);
      return updated;
    }
    storageService.updateQuarterlyObjective(id, updates);
    const objectives = storageService.getQuarterlyObjectives();
    return objectives.find(o => o.id === id)!;
  }

  static async deleteQuarterlyObjective(id: string, userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await QuarterlyObjectivesService.delete(id, userId);
    }
    storageService.deleteQuarterlyObjective(id);
  }

  // ============================================================================
  // QUARTERLY KEY RESULTS
  // ============================================================================

  static async getQuarterlyKeyResults(objectiveId: string): Promise<QuarterlyKeyResult[]> {
    if (isSupabaseConfigured()) {
      try {
        return await QuarterlyKeyResultsService.getByObjectiveId(objectiveId);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getQuarterlyKeyResults().filter(qkr => qkr.quarterlyObjectiveId === objectiveId);
      }
    }
    return storageService.getQuarterlyKeyResults().filter(qkr => qkr.quarterlyObjectiveId === objectiveId);
  }

  static async createQuarterlyKeyResult(qkr: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    if (isSupabaseConfigured()) {
      const created = await QuarterlyKeyResultsService.create(qkr);
      storageService.addQuarterlyKeyResult(created);
      return created;
    }
    const newQKR = { ...qkr, id: qkr.id || crypto.randomUUID() } as QuarterlyKeyResult;
    storageService.addQuarterlyKeyResult(newQKR);
    return newQKR;
  }

  static async updateQuarterlyKeyResult(id: string, updates: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    if (isSupabaseConfigured()) {
      const updated = await QuarterlyKeyResultsService.update(id, updates);
      storageService.updateQuarterlyKeyResult(id, updates);
      return updated;
    }
    storageService.updateQuarterlyKeyResult(id, updates);
    const qkrs = storageService.getQuarterlyKeyResults();
    return qkrs.find(qkr => qkr.id === id)!;
  }

  static async deleteQuarterlyKeyResult(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await QuarterlyKeyResultsService.delete(id);
    }
    storageService.deleteQuarterlyKeyResult(id);
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  static async getActions(userId: string, status?: ActionStatus): Promise<Action[]> {
    if (isSupabaseConfigured()) {
      try {
        return await ActionsService.getAll(userId, status);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getActions();
      }
    }
    return storageService.getActions();
  }

  static async createAction(action: Partial<Action>, userId: string): Promise<Action> {
    if (isSupabaseConfigured()) {
      const created = await ActionsService.create(action, userId);
      storageService.addAction(created);
      return created;
    }
    const newAction = { ...action, id: action.id || crypto.randomUUID() } as Action;
    storageService.addAction(newAction);
    return newAction;
  }

  static async updateAction(id: string, updates: Partial<Action>, userId: string): Promise<Action> {
    if (isSupabaseConfigured()) {
      const updated = await ActionsService.update(id, updates, userId);
      storageService.updateAction(id, updates);
      return updated;
    }
    storageService.updateAction(id, updates);
    const actions = storageService.getActions();
    return actions.find(a => a.id === id)!;
  }

  static async deleteAction(id: string, userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await ActionsService.delete(id, userId);
    }
    storageService.deleteAction(id);
  }

  // ============================================================================
  // PROGRESS
  // ============================================================================

  static async recordProgress(
    entityId: string,
    entityType: EntityType,
    value: number,
    userId: string,
    note?: string
  ): Promise<Progress> {
    if (isSupabaseConfigured()) {
      const progress = await ProgressService.record(entityId, entityType, value, userId, note);
      storageService.addProgress(progress);
      return progress;
    }
    const newProgress: Progress = {
      id: crypto.randomUUID(),
      entityId,
      entityType,
      value,
      note,
      recordedAt: new Date(),
      recordedBy: userId,
    };
    storageService.addProgress(newProgress);
    return newProgress;
  }

  static async getProgressHistory(
    entityId: string,
    entityType: EntityType,
    userId: string,
    limit?: number
  ): Promise<Progress[]> {
    if (isSupabaseConfigured()) {
      try {
        return await ProgressService.getHistory(entityId, entityType, userId, limit);
      } catch (error) {
        console.warn('⚠️ Erreur Supabase, fallback localStorage:', error);
        return storageService.getProgress().filter(p => p.entityId === entityId && p.entityType === entityType);
      }
    }
    return storageService.getProgress().filter(p => p.entityId === entityId && p.entityType === entityType);
  }
}

