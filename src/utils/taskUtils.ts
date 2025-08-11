import {
  TaskAssignee,
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
} from '../types/task.types';

// Mock assignees data
export const mockAssignees: TaskAssignee[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'J',
    role: 'Frontend Developer',
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    avatar: 'S',
    role: 'UI/UX Designer',
    email: 'sarah@example.com',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'M',
    role: 'Product Manager',
    email: 'mike@example.com',
  },
  {
    id: '4',
    name: 'Alex Chen',
    avatar: 'A',
    role: 'Backend Developer',
    email: 'alex@example.com',
  },
  {
    id: '5',
    name: 'Emily Davis',
    avatar: 'E',
    role: 'DevOps Engineer',
    email: 'emily@example.com',
  },
];

// Mock tasks data

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Create login, signup, and password reset functionality',
    status: 'in-progress',
    priority: 'high',
    category: 'development',
    assignees: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'J',
        role: 'Developer',
        email: 'john@example.com',
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        avatar: 'S',
        role: 'Designer',
        email: 'sarah@example.com',
      },
    ],
    reporter: {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'M',
      role: 'Product Manager',
      email: 'mike@example.com',
    },
    channelId: '1',
    channelName: 'Brainstorming',
    tags: ['authentication', 'security', 'frontend'],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    estimatedHours: 40,
    actualHours: 25,
    progress: 65,
    subtasks: [
      { id: 's1', title: 'Design login UI', completed: true },
      { id: 's2', title: 'Implement backend API', completed: true },
      { id: 's3', title: 'Add validation', completed: false },
    ],
    comments: [],
    attachments: [],
    dependencies: [],
    watchers: [],
  },
  {
    id: '2',
    title: 'Design system documentation',
    description: 'Create comprehensive design system documentation',
    status: 'pending',
    priority: 'medium',
    category: 'documentation',
    assignees: [],
    reporter: {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'S',
      role: 'Designer',
      email: 'sarah@example.com',
    },
    channelId: '2',
    channelName: 'Design',
    tags: ['design-system', 'documentation'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedHours: 16,
    progress: 0,
    subtasks: [],
    comments: [],
    attachments: [],
    dependencies: [],
    watchers: [],
  },
  {
    id: '3',
    title: 'API performance optimization',
    description: 'Optimize API endpoints for better performance',
    status: 'completed',
    priority: 'high',
    category: 'development',
    assignees: [
      {
        id: '4',
        name: 'Alex Chen',
        avatar: 'A',
        role: 'Backend Developer',
        email: 'alex@example.com',
      },
    ],
    reporter: {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'M',
      role: 'Product Manager',
      email: 'mike@example.com',
    },
    channelId: '3',
    channelName: 'Backend',
    tags: ['performance', 'api', 'optimization'],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimatedHours: 20,
    actualHours: 18,
    progress: 100,
    subtasks: [],
    comments: [],
    attachments: [],
    dependencies: [],
    watchers: [],
  },
];

// Helper functions
export const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'urgent':
      return '#EF4444';
    case 'high':
      return '#F97316';
    case 'medium':
      return '#EAB308';
    case 'low':
      return '#22C55E';
    default:
      return '#6B7280';
  }
};

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return '#6B7280';
    case 'in-progress':
      return '#3B82F6';
    case 'completed':
      return '#22C55E';
    case 'on-hold':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const getCategoryIcon = (category: TaskCategory) => {
  switch (category) {
    case 'development':
      return 'code';
    case 'design':
      return 'palette';
    case 'research':
      return 'search';
    case 'meeting':
      return 'users';
    case 'documentation':
      return 'file-text';
    case 'testing':
      return 'check-circle';
    case 'deployment':
      return 'upload';
    default:
      return 'circle';
  }
};

export const formatDueDate = (dueDate: Date) => {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return dueDate.toLocaleDateString();
  }
};
