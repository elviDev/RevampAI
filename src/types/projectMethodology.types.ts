import { TaskAssignee } from './task.types';

export type ProjectMethodology = 'agile' | 'scrum' | 'kanban' | 'waterfall' | 'lean' | 'hybrid';
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type StoryPointScale = 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89;

// Agile/Scrum specific types
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  capacity: number; // in story points
  velocity: number; // actual completed points
  burndownData: BurndownPoint[];
  tasks: string[]; // task IDs
  retrospectiveNotes?: string;
}

export interface BurndownPoint {
  date: Date;
  remainingPoints: number;
  idealBurndown: number;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: StoryPointScale;
  epic?: string;
  assignee?: TaskAssignee;
  status: 'backlog' | 'selected' | 'in-progress' | 'testing' | 'done';
  priority: number; // for backlog ordering
  tasks: string[]; // breakdown tasks
  definition_of_done: string[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  businessValue: string;
  status: 'concept' | 'planned' | 'in-progress' | 'completed';
  stories: UserStory[];
  timeline: {
    startDate: Date;
    targetEndDate: Date;
  };
}

// Kanban specific types
export interface KanbanColumn {
  id: string;
  name: string;
  wipLimit?: number; // Work In Progress limit
  tasks: string[];
  position: number;
}

export interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
  swimlanes?: KanbanSwimlane[];
}

export interface KanbanSwimlane {
  id: string;
  name: string;
  description?: string;
  tasks: string[];
}

// Waterfall specific types
export interface WaterfallPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  dependencies: string[]; // previous phase IDs
  deliverables: Deliverable[];
  gateReview: GateReview;
  tasks: string[];
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'review' | 'approved' | 'rejected';
  assignee: TaskAssignee;
  approver?: TaskAssignee;
}

export interface GateReview {
  id: string;
  criteria: string[];
  status: 'pending' | 'passed' | 'failed';
  reviewDate?: Date;
  reviewer?: TaskAssignee;
  comments?: string;
}

// Lean specific types
export interface ValueStream {
  id: string;
  name: string;
  steps: ValueStreamStep[];
  cycleTime: number; // days
  leadTime: number; // days
  wasteAnalysis: WasteItem[];
}

export interface ValueStreamStep {
  id: string;
  name: string;
  type: 'value-add' | 'necessary-non-value-add' | 'waste';
  duration: number; // minutes
  waitTime: number; // minutes
}

export interface WasteItem {
  id: string;
  type: 'motion' | 'waiting' | 'overproduction' | 'defects' | 'inventory' | 'processing' | 'transportation';
  description: string;
  impact: 'high' | 'medium' | 'low';
  improvementIdea?: string;
}

// Hybrid methodology types
export interface MethodologyMix {
  primary: ProjectMethodology;
  secondary?: ProjectMethodology;
  customRules: MethodologyRule[];
  adaptations: string[];
}

export interface MethodologyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
}

// Project methodology specific data
export interface ProjectMethodologyData {
  methodology: ProjectMethodology;
  
  // Agile/Scrum data
  sprints?: Sprint[];
  backlog?: UserStory[];
  epics?: Epic[];
  currentSprint?: string;
  
  // Kanban data
  kanbanBoard?: KanbanBoard;
  
  // Waterfall data
  phases?: WaterfallPhase[];
  currentPhase?: string;
  
  // Lean data
  valueStream?: ValueStream;
  
  // Hybrid data
  methodologyMix?: MethodologyMix;
  
  // Common metrics
  metrics: {
    velocity?: number; // for Scrum
    cycleTime?: number; // for Kanban/Lean
    leadTime?: number; // for Kanban/Lean
    burndownRate?: number; // for Agile
    phaseCompletionRate?: number; // for Waterfall
    defectRate?: number;
    teamSatisfaction?: number;
    customerSatisfaction?: number;
  };
}

// Methodology-specific views
export interface MethodologyView {
  type: ProjectMethodology;
  components: {
    dashboard: boolean;
    backlog?: boolean;
    sprintPlanning?: boolean;
    burndownChart?: boolean;
    kanbanBoard?: boolean;
    phaseGantt?: boolean;
    valueStreamMap?: boolean;
    cumulativeFlow?: boolean;
    velocityChart?: boolean;
    retrospective?: boolean;
  };
}

// Methodology templates
export interface MethodologyTemplate {
  id: string;
  name: string;
  methodology: ProjectMethodology;
  description: string;
  defaultSettings: any;
  requiredRoles: string[];
  ceremonies?: string[];
  artifacts?: string[];
}

// Phase management types
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold';

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: PhaseStatus;
  startDate: Date | null;
  endDate: Date | null;
  estimatedDuration: number; // in hours
  actualDuration: number; // in hours
  progress: number; // percentage 0-100
  
  // Phase requirements and deliverables
  prerequisites: string[];
  deliverables: string[];
  exitCriteria: string[];
  
  // Team and resources
  assignedTeam: string[]; // user IDs
  
  // Blockers and risks
  blockers: PhaseBlocker[];
  risks: PhaseRisk[];
  
  // Phase artifacts and documentation
  artifacts: PhaseArtifact[];
  
  // Phase metrics
  metrics: Record<string, number>;
}

export interface PhaseBlocker {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blockedSince: Date;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
}

export interface PhaseRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
}

export interface PhaseArtifact {
  id: string;
  name: string;
  type: 'document' | 'code' | 'design' | 'test' | 'other';
  url?: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  size?: number;
}

export interface PhaseTransition {
  fromPhase: string;
  toPhase: string;
  reason: string;
  timestamp: Date;
  triggeredBy: string; // user ID
  notes?: string;
  metadata?: Record<string, any>;
}