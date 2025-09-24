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
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  isSmartCompliant: boolean;
  smartAnalysis?: SmartAnalysis;
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
  targetValue: number;
  currentValue: number;
  unit: string;
  weight: number; // Pondération sur 100
}

export interface Action {
  id: string;
  okrId: string;
  title: string;
  description: string;
  deadline: Date;
  assignee?: string;
  status: ActionStatus;
  priority: Priority;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  actionId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  priority: Priority;
  estimatedMinutes?: number;
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

export enum ActionStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
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
  TASK = 'task'
}

export enum ValidationCategory {
  AMBITION = 'ambition',
  OBJECTIVE = 'objective',
  KEY_RESULT = 'key_result',
  ACTION = 'action',
  TASK = 'task'
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
  targetValue: number;
  unit: string;
  deadline: string;
}

export interface OKRFormData {
  quarter: Quarter;
  year: number;
  objective: string;
  keyResults: Omit<OKRKeyResult, 'id'>[];
}

export interface ActionFormData {
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  estimatedHours?: number;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  estimatedMinutes?: number;
}
