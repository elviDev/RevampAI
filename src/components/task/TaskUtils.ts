import { TaskPriority, TaskStatus, TaskCategory } from '../../types/task.types';

export const TaskUtils = {
  getPriorityColor: (priority: TaskPriority): string => {
    const colors: Record<TaskPriority, string> = {
      urgent: '#DC2626',
      high: '#EA580C',
      medium: '#CA8A04',
      low: '#16A34A',
    };
    return colors[priority] || colors.medium;
  },

  getStatusColor: (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      pending: '#6B7280',
      'in-progress': '#2563EB',
      completed: '#16A34A',
      'on-hold': '#D97706',
      cancelled: '#DC2626',
    };
    return colors[status] || colors.pending;
  },

  getCategoryIcon: (category: TaskCategory): string => {
    const icons: Record<TaskCategory, string> = {
      development: 'code',
      design: 'palette',
      research: 'search',
      meeting: 'people',
      documentation: 'article',
      testing: 'bug-report',
      deployment: 'rocket-launch',
    };
    return icons[category] || 'work';
  },

  formatDueDate: (dueDate: Date): string => {
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
      return dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  },

  formatTimeAgo: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  isOverdue: (dueDate: Date, status: TaskStatus): boolean => {
    return dueDate < new Date() && status !== 'completed';
  },

  isDueSoon: (dueDate: Date, status: TaskStatus): boolean => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return dueDate <= tomorrow && dueDate > new Date() && status !== 'completed';
  },
};