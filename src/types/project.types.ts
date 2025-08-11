import { User } from './auth';
import { TaskAssignee } from './task.types';

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MemberRole = 'owner' | 'admin' | 'lead' | 'member' | 'viewer';
export type MilestoneStatus = 'upcoming' | 'in-progress' | 'completed' | 'overdue';
export type BudgetCategory = 'development' | 'design' | 'marketing' | 'infrastructure' | 'miscellaneous';
export type ActivityType = 'task_created' | 'task_updated' | 'milestone_completed' | 'member_added' | 'file_uploaded' | 'comment_added';

export interface ProjectBudget {
  id: string;
  category: BudgetCategory;
  allocated: number;
  spent: number;
  remaining: number;
  currency: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: MilestoneStatus;
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  dependencies: string[]; // Milestone IDs
}

export interface ProjectMember {
  id: string;
  user: TaskAssignee;
  role: MemberRole;
  joinedAt: Date;
  permissions: ProjectPermission[];
  workload: number; // hours per week
  lastActive: Date;
}

export interface ProjectPermission {
  action: 'view' | 'edit' | 'delete' | 'manage_members' | 'manage_budget' | 'manage_settings';
  resource: 'project' | 'tasks' | 'milestones' | 'files' | 'budget' | 'members';
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'archive' | 'code';
  size: number;
  url: string;
  uploadedBy: TaskAssignee;
  uploadedAt: Date;
  version: number;
  tags: string[];
}

export interface ProjectActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user: TaskAssignee;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigating' | 'resolved';
  owner: TaskAssignee;
  mitigationPlan?: string;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  actualHours: number;
  budgetUtilization: number;
  teamProductivity: number;
  milestoneProgress: number;
  riskScore: number;
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  milestones: ProjectMilestone[];
}

export interface ProjectSettings {
  isPublic: boolean;
  allowGuestAccess: boolean;
  autoAssignTasks: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Team & Organization
  owner: TaskAssignee;
  members: ProjectMember[];
  
  // Timeline & Progress
  timeline: ProjectTimeline;
  progress: number; // 0-100
  
  // Financial
  budget: {
    total: number;
    currency: string;
    categories: ProjectBudget[];
  };
  
  // Project Assets
  files: ProjectFile[];
  
  // Tracking & Analytics
  metrics: ProjectMetrics;
  activities: ProjectActivity[];
  risks: ProjectRisk[];
  
  // Configuration
  settings: ProjectSettings;
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parentProjectId?: string;
  subProjects: string[];
  
  // Custom Fields
  customFields: Record<string, any>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  memberCount: number;
  taskCount: number;
  dueDate: Date;
  owner: TaskAssignee;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  tags: string[];
  lastActivity: Date;
}

export interface ProjectFilter {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  category?: string[];
  member?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  budget?: {
    min: number;
    max: number;
  };
}

export interface ProjectSort {
  field: 'name' | 'status' | 'priority' | 'progress' | 'dueDate' | 'createdAt' | 'budget';
  direction: 'asc' | 'desc';
}