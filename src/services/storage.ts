import { STORAGE_KEYS } from '@/constants';
import type {
  User,
  Ambition,
  KeyResult,
  OKR,
  Action,
  QuarterlyObjective,
  QuarterlyKeyResult,
  Progress,
} from '@/types';

// Service de gestion du localStorage avec backup JSON
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Méthodes génériques
  private setItem<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);

      // Backup automatique
      this.createBackup();
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
      throw new Error(`Impossible de sauvegarder les données: ${error}`);
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      this.createBackup();
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  // Gestion des utilisateurs
  public saveUser(user: User): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  public getUser(): User | null {
    return this.getItem<User>(STORAGE_KEYS.USER);
  }

  public removeUser(): void {
    this.removeItem(STORAGE_KEYS.USER);
  }

  // Gestion des ambitions
  public saveAmbitions(ambitions: Ambition[]): void {
    this.setItem(STORAGE_KEYS.AMBITIONS, ambitions);
  }

  public getAmbitions(): Ambition[] {
    return this.getItem<Ambition[]>(STORAGE_KEYS.AMBITIONS) || [];
  }

  public addAmbition(ambition: Ambition): void {
    const ambitions = this.getAmbitions();
    ambitions.push(ambition);
    this.saveAmbitions(ambitions);
  }

  public updateAmbition(ambitionId: string, updates: Partial<Ambition>): void {
    const ambitions = this.getAmbitions();
    const index = ambitions.findIndex(a => a.id === ambitionId);

    if (index !== -1) {
      ambitions[index] = { ...ambitions[index], ...updates, updatedAt: new Date() };
      this.saveAmbitions(ambitions);
    }
  }

  public deleteAmbition(ambitionId: string): void {
    const ambitions = this.getAmbitions().filter(a => a.id !== ambitionId);
    this.saveAmbitions(ambitions);
  }

  // Gestion des résultats clés
  public saveKeyResults(keyResults: KeyResult[]): void {
    this.setItem(STORAGE_KEYS.KEY_RESULTS, keyResults);
  }

  public getKeyResults(): KeyResult[] {
    return this.getItem<KeyResult[]>(STORAGE_KEYS.KEY_RESULTS) || [];
  }

  public addKeyResult(keyResult: KeyResult): void {
    const keyResults = this.getKeyResults();
    keyResults.push(keyResult);
    this.saveKeyResults(keyResults);
  }

  public updateKeyResult(keyResultId: string, updates: Partial<KeyResult>): void {
    const keyResults = this.getKeyResults();
    const index = keyResults.findIndex(kr => kr.id === keyResultId);

    if (index !== -1) {
      keyResults[index] = { ...keyResults[index], ...updates, updatedAt: new Date() };
      this.saveKeyResults(keyResults);
    }
  }

  public deleteKeyResult(keyResultId: string): void {
    const keyResults = this.getKeyResults().filter(kr => kr.id !== keyResultId);
    this.saveKeyResults(keyResults);
  }

  // Gestion des OKRs
  public saveOKRs(okrs: OKR[]): void {
    this.setItem(STORAGE_KEYS.OKRS, okrs);
  }

  public getOKRs(): OKR[] {
    return this.getItem<OKR[]>(STORAGE_KEYS.OKRS) || [];
  }

  public addOKR(okr: OKR): void {
    const okrs = this.getOKRs();
    okrs.push(okr);
    this.saveOKRs(okrs);
  }

  public updateOKR(okrId: string, updates: Partial<OKR>): void {
    const okrs = this.getOKRs();
    const index = okrs.findIndex(o => o.id === okrId);

    if (index !== -1) {
      okrs[index] = { ...okrs[index], ...updates, updatedAt: new Date() };
      this.saveOKRs(okrs);
    }
  }

  public deleteOKR(okrId: string): void {
    const okrs = this.getOKRs().filter(o => o.id !== okrId);
    this.saveOKRs(okrs);
  }

  // Gestion des actions
  public saveActions(actions: Action[]): void {
    this.setItem(STORAGE_KEYS.ACTIONS, actions);
  }

  public getActions(): Action[] {
    return this.getItem<Action[]>(STORAGE_KEYS.ACTIONS) || [];
  }

  public addAction(action: Action): void {
    const actions = this.getActions();
    actions.push(action);
    this.saveActions(actions);
  }

  public updateAction(actionId: string, updates: Partial<Action>): void {
    const actions = this.getActions();
    const index = actions.findIndex(a => a.id === actionId);

    if (index !== -1) {
      actions[index] = { ...actions[index], ...updates, updatedAt: new Date() };
      this.saveActions(actions);
    }
  }

  public deleteAction(actionId: string): void {
    const actions = this.getActions().filter(a => a.id !== actionId);
    this.saveActions(actions);
  }

  // Gestion des objectifs trimestriels
  public saveQuarterlyObjectives(objectives: QuarterlyObjective[]): void {
    this.setItem(STORAGE_KEYS.QUARTERLY_OBJECTIVES, objectives);
  }

  public getQuarterlyObjectives(): QuarterlyObjective[] {
    return this.getItem<QuarterlyObjective[]>(STORAGE_KEYS.QUARTERLY_OBJECTIVES) || [];
  }

  public addQuarterlyObjective(objective: QuarterlyObjective): void {
    const objectives = this.getQuarterlyObjectives();
    objectives.push(objective);
    this.saveQuarterlyObjectives(objectives);
  }

  public updateQuarterlyObjective(objectiveId: string, updates: Partial<QuarterlyObjective>): void {
    const objectives = this.getQuarterlyObjectives();
    const index = objectives.findIndex(obj => obj.id === objectiveId);

    if (index !== -1) {
      objectives[index] = { ...objectives[index], ...updates, updatedAt: new Date() };
      this.saveQuarterlyObjectives(objectives);
    }
  }

  public deleteQuarterlyObjective(objectiveId: string): void {
    const objectives = this.getQuarterlyObjectives().filter(obj => obj.id !== objectiveId);
    this.saveQuarterlyObjectives(objectives);
  }

  // Gestion des KR trimestriels
  public saveQuarterlyKeyResults(keyResults: QuarterlyKeyResult[]): void {
    this.setItem(STORAGE_KEYS.QUARTERLY_KEY_RESULTS, keyResults);
  }

  public getQuarterlyKeyResults(): QuarterlyKeyResult[] {
    return this.getItem<QuarterlyKeyResult[]>(STORAGE_KEYS.QUARTERLY_KEY_RESULTS) || [];
  }

  public addQuarterlyKeyResult(keyResult: QuarterlyKeyResult): void {
    const keyResults = this.getQuarterlyKeyResults();
    keyResults.push(keyResult);
    this.saveQuarterlyKeyResults(keyResults);
  }

  public updateQuarterlyKeyResult(keyResultId: string, updates: Partial<QuarterlyKeyResult>): void {
    const keyResults = this.getQuarterlyKeyResults();
    const index = keyResults.findIndex(kr => kr.id === keyResultId);

    if (index !== -1) {
      keyResults[index] = { ...keyResults[index], ...updates, updatedAt: new Date() };
      this.saveQuarterlyKeyResults(keyResults);
    }
  }

  public deleteQuarterlyKeyResult(keyResultId: string): void {
    const keyResults = this.getQuarterlyKeyResults().filter(kr => kr.id !== keyResultId);
    this.saveQuarterlyKeyResults(keyResults);
  }

  // Gestion du progrès
  public saveProgress(progress: Progress[]): void {
    this.setItem(STORAGE_KEYS.PROGRESS, progress);
  }

  public getProgress(): Progress[] {
    return this.getItem<Progress[]>(STORAGE_KEYS.PROGRESS) || [];
  }

	  // Gestion des commentaires
	  public saveComments(comments: import('@/types').Comment[]): void {
	    this.setItem(STORAGE_KEYS.COMMENTS, comments);
	  }

	  public getComments(): import('@/types').Comment[] {
	    return this.getItem<import('@/types').Comment[]>(STORAGE_KEYS.COMMENTS) || [];
	  }

	  public addComment(comment: import('@/types').Comment): void {
	    const comments = this.getComments();
	    comments.push(comment);
	    this.saveComments(comments);
	  }

	  public getCommentsFor(entityId: string, entityType: import('@/types').Comment['objectiveType']): import('@/types').Comment[] {
	    return this.getComments().filter(c => c.objectiveId === entityId && c.objectiveType === entityType);
	  }


  public addProgress(progress: Progress): void {
    const progressList = this.getProgress();
    progressList.push(progress);
    this.saveProgress(progressList);
  }

  // Utilitaires
  public clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  public exportData(): string {
    const data = {
      user: this.getUser(),
      ambitions: this.getAmbitions(),
      keyResults: this.getKeyResults(),
      okrs: this.getOKRs(),
      actions: this.getActions(),
      quarterlyObjectives: this.getQuarterlyObjectives(),
      quarterlyKeyResults: this.getQuarterlyKeyResults(),
      progress: this.getProgress(),
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.user) this.saveUser(data.user);
      if (data.ambitions) this.saveAmbitions(data.ambitions);
      if (data.keyResults) this.saveKeyResults(data.keyResults);
      if (data.okrs) this.saveOKRs(data.okrs);
      if (data.actions) this.saveActions(data.actions);
      if (data.quarterlyObjectives) this.saveQuarterlyObjectives(data.quarterlyObjectives);
      if (data.quarterlyKeyResults) this.saveQuarterlyKeyResults(data.quarterlyKeyResults);
      if (data.progress) this.saveProgress(data.progress);

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw new Error('Format de données invalide');
    }
  }

  private createBackup(): void {
    try {
      const backup = this.exportData();
      localStorage.setItem('oskar_backup', backup);
    } catch (error) {
      console.error('Erreur lors de la création du backup:', error);
    }
  }

  public restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem('oskar_backup');
      if (backup) {
        this.importData(backup);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      return false;
    }
  }

  // Migration: Convertir les actions de quarterlyObjectiveId vers quarterlyKeyResultId
  public migrateActionsToKeyResults(): void {
    try {
      const actions = this.getActions();
      const quarterlyKeyResults = this.getQuarterlyKeyResults();

      console.log('🔄 Migration des actions:', {
        totalActions: actions.length,
        totalKRs: quarterlyKeyResults.length,
        actionsAvecOldFormat: actions.filter((a: any) => a.quarterlyObjectiveId && !a.quarterlyKeyResultId).length,
      });

      if (!actions || actions.length === 0) {
        console.log('⚠️ Aucune action à migrer');
        return;
      }

      let migrated = 0;
      let skipped = 0;
      const migratedActions = actions.map((action: any) => {
        // Si l'action a un quarterlyObjectiveId mais pas de quarterlyKeyResultId
        if (action.quarterlyObjectiveId && !action.quarterlyKeyResultId) {
          // Trouver le premier KR de cet objectif
          const firstKR = quarterlyKeyResults.find(
            kr => kr.quarterlyObjectiveId === action.quarterlyObjectiveId
          );

          if (firstKR) {
            migrated++;
            const { quarterlyObjectiveId, ...rest } = action;
            console.log(`  ✓ Action "${action.title}" migrée vers KR "${firstKR.title}"`);
            return {
              ...rest,
              quarterlyKeyResultId: firstKR.id,
            };
          } else {
            skipped++;
            console.warn(`  ⚠️ Action "${action.title}" ignorée: aucun KR trouvé pour l'objectif ${action.quarterlyObjectiveId}`);
          }
        }
        return action;
      });

      if (migrated > 0) {
        this.saveActions(migratedActions);
        console.log(`✅ Migration terminée: ${migrated} actions migrées, ${skipped} ignorées`);
      } else {
        console.log('ℹ️ Aucune action à migrer');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la migration des actions:', error);
    }
  }
}

// Instance singleton
export const storageService = StorageService.getInstance();

// Fonction de débogage globale pour forcer la migration
if (typeof window !== 'undefined') {
  (window as any).forceMigrateActions = () => {
    console.log('🔧 Forçage de la migration des actions...');
    storageService.migrateActionsToKeyResults();
    console.log('✅ Migration forcée terminée. Rechargez la page pour voir les changements.');
  };

  (window as any).debugActions = () => {
    const actions = storageService.getActions();
    const krs = storageService.getQuarterlyKeyResults();
    console.log('📊 État des actions:', {
      totalActions: actions.length,
      actions: actions.map((a: any) => ({
        id: a.id,
        title: a.title,
        quarterlyObjectiveId: a.quarterlyObjectiveId,
        quarterlyKeyResultId: a.quarterlyKeyResultId,
      })),
      totalKRs: krs.length,
      krs: krs.map(kr => ({
        id: kr.id,
        title: kr.title,
        quarterlyObjectiveId: kr.quarterlyObjectiveId,
      })),
    });
  };
}
