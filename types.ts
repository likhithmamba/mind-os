export type NodeType = 'idea' | 'win' | 'learning' | 'memory';

export interface ThoughtNode {
  id: string;
  title: string;
  content: string; // Markdown-like content
  date: string | null; // ISO Date String (YYYY-MM-DD) or null for Inbox
  type: NodeType;
  createdAt: string; // ISO Timestamp
}

export interface DateCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  nodes: ThoughtNode[];
  habits: Record<string, boolean>; // dateISO -> completed
  isEditorOpen: boolean;
  activeNodeId: string | null;
}

export interface StorageStats {
  usedKB: string;
  percent: number;
  totalNodes: number;
}