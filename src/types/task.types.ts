export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'development' | 'design' | 'research' | 'meeting' | 'documentation' | 'testing' | 'deployment';

export interface TaskAssignee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: TaskAssignee;
  timestamp: Date;
  attachments?: TaskAttachment[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size: number;
  uploadedBy: TaskAssignee;
  uploadedAt: Date;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: TaskAssignee;
  dueDate?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignees: TaskAssignee[];
  reporter: TaskAssignee;
  channelId: string;
  channelName: string;
  tags: string[];
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
  progress: number; // 0-100
  subtasks: TaskSubtask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  dependencies: string[]; // Task IDs that this task depends on
  watchers: TaskAssignee[]; // People watching this task for updates
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assignee?: string[];
  channel?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
}

export interface TaskSort {
  field: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'updatedAt' | 'title';
  direction: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number; // Due within 24 hours
  unassigned: number;
}

export interface BoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
}

export interface TaskActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'assigned' | 'status_changed' | 'due_date_changed';
  description: string;
  user: TaskAssignee;
  timestamp: Date;
  taskId: string;
  metadata?: any;
}
