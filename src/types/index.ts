// Types principaux pour OKaRina

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  createdAt: Date;
  lastLoginAt: Date;
  companyProfile?: CompanyProfile;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: CompanySize;
  stage: CompanyStage;
  mainChallenges: string[];
  currentGoals: string[];
  marketPosition: string;
  targetMarket: string;
  businessModel: string;
}

export interface Ambition {
  id: string;
  userId: string;
  title: string;
  description: string;
  year: number;
  category: AmbitionCategory;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  aiValidation?: AIValidation;
}

export interface KeyResult {
  id: string;
  ambitionId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  aiValidation?: AIValidation;
}

export interface OKR {
  id: string;
  keyResultId: string;
  quarter: Quarter;
  year: number;
  objective: string;
  keyResults: OKRKeyResult[];
  status: Status;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  aiValidation?: AIValidation;
}

export interface OKRKeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  weight: number; // Pondération sur 100
}

// Types pour les actions (remplacent les tâches)
export interface Action {
  id: string;
  title: string;
  description?: string;
  quarterlyObjectiveId: string;
  status: ActionStatus;
  priority: Priority;
  labels: string[];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Types pour les objectifs trimestriels
export interface QuarterlyObjective {
  id: string;
  title: string;
  description: string;
  ambitionId: string; // Rattachement à l'ambition
  quarter: Quarter;
  year: number;
  keyResults: QuarterlyKeyResult[];
  actions: Action[];
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les Key Results trimestriels (différents des KR d'ambition)
export interface QuarterlyKeyResult {
  id: string;
  title: string;
  description: string;
  quarterlyObjectiveId: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  entityId: string; // ID de l'entité (Ambition, KR, OKR, Action)
  entityType: EntityType;
  value: number;
  note?: string;
  recordedAt: Date;
  recordedBy: string;
}

export interface AIValidation {
  isValid: boolean;
  confidence: number; // 0-100
  suggestions: string[];
  warnings: string[];
  category: ValidationCategory;
  validatedAt: Date;
}

export interface SmartAnalysis {
  specific: boolean;
  measurable: boolean;
  achievable: boolean;
  relevant: boolean;
  timeBound: boolean;
  score: number; // 0-100
  recommendations: string[];
}

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  period: ReportPeriod;
  data: any;
  generatedAt: Date;
  format: ReportFormat;
}

// Enums
export enum AmbitionCategory {
  REVENUE = 'revenue',
  GROWTH = 'growth',
  PRODUCT = 'product',
  TEAM = 'team',
  MARKET = 'market',
  OPERATIONAL = 'operational',
  PERSONAL = 'personal'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Status {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BEHIND = 'behind',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Enum pour les trimestres
export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

// Enum pour le statut des actions dans le kanban
export enum ActionStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}



export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export enum CompanyStage {
  IDEA = 'idea',
  PROTOTYPE = 'prototype',
  EARLY_STAGE = 'early_stage',
  GROWTH = 'growth',
  MATURE = 'mature',
  SCALE_UP = 'scale_up'
}

export enum EntityType {
  AMBITION = 'ambition',
  KEY_RESULT = 'key_result',
  OKR = 'okr',
  ACTION = 'action',
  QUARTERLY_OBJECTIVE = 'quarterly_objective',
  QUARTERLY_KEY_RESULT = 'quarterly_key_result'
}

export enum ValidationCategory {
  AMBITION = 'ambition',
  OBJECTIVE = 'objective',
  KEY_RESULT = 'key_result',
  ACTION = 'action',
  QUARTERLY_OBJECTIVE = 'quarterly_objective',
  QUARTERLY_KEY_RESULT = 'quarterly_key_result'
}

export enum ReportType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

export enum ReportPeriod {
  CURRENT_MONTH = 'current_month',
  CURRENT_QUARTER = 'current_quarter',
  CURRENT_YEAR = 'current_year',
  LAST_MONTH = 'last_month',
  LAST_QUARTER = 'last_quarter',
  LAST_YEAR = 'last_year'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json'
}

// Types pour les composants UI
export interface CanvasStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalAmbitions: number;
  activeOKRs: number;
  completedActions: number;
  overallProgress: number;
  monthlyProgress: number;
  upcomingDeadlines: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Types pour les formulaires
export interface AmbitionFormData {
  title: string;
  description: string;
  category: AmbitionCategory;
  priority: Priority;
  year: number;
}

export interface KeyResultFormData {
  title: string;
  description: string;
  target: number;
  unit: string;
  deadline: string;
  priority: Priority;
}

export interface OKRFormData {
  quarter: Quarter;
  year: number;
  objective: string;
  keyResults: Omit<OKRKeyResult, 'id'>[];
}



// Types pour les formulaires des objectifs trimestriels
export interface QuarterlyObjectiveFormData {
  title: string;
  description: string;
  ambitionId: string;
  quarter: Quarter;
  year: number;
}

// Types pour les formulaires des actions
export interface ActionFormData {
  title: string;
  description?: string;
  priority: Priority;
  labels: string; // Chaîne séparée par des virgules
  deadline?: string;
  quarterlyObjectiveId?: string;
}

// Types pour les formulaires des objectifs trimestriels
export interface QuarterlyObjectiveFormData {
  title: string;
  description: string;
  ambitionId: string;
  quarter: Quarter;
  year: number;
}

// Types pour les formulaires des KR trimestriels
export interface QuarterlyKeyResultFormData {
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO string in form
}
