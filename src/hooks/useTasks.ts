import { useState, useEffect, useMemo } from 'react';
import { Task, TaskFilter, TaskSort, TaskAssignee, TaskStatus, TaskPriority, TaskCategory } from '../types/task.types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>({});
  const [sortBy, setSortBy] = useState<TaskSort>({
    field: 'dueDate',
    direction: 'asc',
  });

  // Mock assignees data
  const mockAssignees: TaskAssignee[] = [
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

  const loadMockTasks = () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Implement user authentication',
        description: 'Create login, signup, and password reset functionality',
        status: 'in-progress',
        priority: 'high',
        category: 'development',
        assignees: [mockAssignees[0]],
        reporter: mockAssignees[0],
        channelId: 'dev-team',
        channelName: 'Development Team',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        dueDate: new Date('2024-02-01'),
        estimatedHours: 12,
        tags: ['frontend', 'backend', 'security'],
        progress: 60,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
      {
        id: '2',
        title: 'Design dashboard mockups',
        description: 'Create wireframes and high-fidelity mockups for the admin dashboard',
        status: 'pending',
        priority: 'medium',
        category: 'design',
        assignees: [mockAssignees[1]],
        reporter: mockAssignees[2],
        channelId: 'design-team',
        channelName: 'Design Team',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        dueDate: new Date('2024-01-28'),
        estimatedHours: 8,
        tags: ['ui', 'ux', 'mockups'],
        progress: 0,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
      {
        id: '3',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline',
        status: 'completed',
        priority: 'high',
        category: 'deployment',
        assignees: [mockAssignees[4]],
        reporter: mockAssignees[2],
        channelId: 'devops-team',
        channelName: 'DevOps Team',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        dueDate: new Date('2024-01-25'),
        estimatedHours: 16,
        tags: ['devops', 'automation', 'testing'],
        progress: 100,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
      {
        id: '4',
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with examples',
        status: 'in-progress',
        priority: 'low',
        category: 'documentation',
        assignees: [mockAssignees[3]],
        reporter: mockAssignees[3],
        channelId: 'dev-team',
        channelName: 'Development Team',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        dueDate: new Date('2024-02-05'),
        estimatedHours: 6,
        tags: ['documentation', 'api'],
        progress: 25,
        subtasks: [],
        comments: [],
        attachments: [],
        dependencies: [],
        watchers: [],
      },
    ];
    setTasks(mockTasks);
  };

  useEffect(() => {
    loadMockTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query)) ||
          task.assignees.some(assignee =>
            assignee.name.toLowerCase().includes(query),
          ),
      );
    }

    if (selectedFilter.status?.length) {
      filtered = filtered.filter(task =>
        selectedFilter.status!.includes(task.status),
      );
    }

    if (selectedFilter.priority?.length) {
      filtered = filtered.filter(task =>
        selectedFilter.priority!.includes(task.priority),
      );
    }

    if (selectedFilter.category?.length) {
      filtered = filtered.filter(task =>
        selectedFilter.category!.includes(task.category),
      );
    }

    if (selectedFilter.assignee?.length) {
      filtered = filtered.filter(task =>
        task.assignees.some(assignee =>
          selectedFilter.assignee!.includes(assignee.id),
        ),
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy.field) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          const priorityOrder: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }
      return sortBy.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, selectedFilter, sortBy]);

  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'development',
      assignees: taskData.assignees || [],
      reporter: mockAssignees[0], // Default reporter
      channelId: 'general',
      channelName: 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: taskData.estimatedHours || 0,
      tags: taskData.tags || [],
      progress: 0,
      subtasks: [],
      comments: [],
      attachments: [],
      dependencies: [],
      watchers: [],
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    mockAssignees,
    createTask,
    updateTask,
    deleteTask,
  };
};