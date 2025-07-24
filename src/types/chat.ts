export interface Message {
  id: string;
  type: 'text' | 'voice' | 'file' | 'image' | 'task' | 'system';
  content: string;
  voiceTranscript?: string;
  audioUri?: string;
  fileUrl?: string;
  fileName?: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: Date;
  reactions: Reaction[];
  replies: Reply[];
  mentions: string[];
  isEdited: boolean;
  connectedTo?: string; // For message threading
  aiSummary?: string;
  taskAssignments?: TaskAssignment[];
}

export interface Reply {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface TaskAssignment {
  id: string;
  title: string;
  assigneeId: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ChannelSummary {
  id: string;
  title: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: TaskAssignment[];
  participants: string[];
  duration: string;
  generatedAt: Date;
}
