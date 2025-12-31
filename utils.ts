import { ThoughtNode, DateCell, StorageStats } from './types';

export const generateCalendar = (year: number, month: number): DateCell[] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayIndex = firstDayOfMonth.getDay(); 
  
  const calendarCells: DateCell[] = [];
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
      isToday: false,
    });
  }
  
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    calendarCells.push({
      date: date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
    });
  }
  
  return calendarCells;
};

export const toISODate = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const d = new Date(date.getTime() - (offset*60*1000));
  return d.toISOString().split('T')[0];
};

export class StorageManager {
  static KEYS = {
    NODES: 'mind_os_nodes',
    HABITS: 'mind_os_habits'
  };

  static getStats(nodes: ThoughtNode[]): StorageStats {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    const sizeKB = total / 1024;
    // 5MB limit approximation
    const percent = Math.min(100, (sizeKB / 5120) * 100);
    
    return {
      usedKB: sizeKB.toFixed(2),
      percent,
      totalNodes: nodes.length
    };
  }

  static save(nodes: ThoughtNode[], habits: Record<string, boolean>) {
    localStorage.setItem(this.KEYS.NODES, JSON.stringify(nodes));
    localStorage.setItem(this.KEYS.HABITS, JSON.stringify(habits));
  }

  static load(): { nodes: ThoughtNode[], habits: Record<string, boolean> } {
    const nodesStr = localStorage.getItem(this.KEYS.NODES);
    const habitsStr = localStorage.getItem(this.KEYS.HABITS);
    
    return {
      nodes: nodesStr ? JSON.parse(nodesStr) : [],
      habits: habitsStr ? JSON.parse(habitsStr) : {}
    };
  }
  
  static wipe() {
    localStorage.removeItem(this.KEYS.NODES);
    localStorage.removeItem(this.KEYS.HABITS);
  }
}

export const getRandomRecall = (nodes: ThoughtNode[]): ThoughtNode | null => {
  if (nodes.length === 0) return null;
  // Prefer nodes older than 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oldNodes = nodes.filter(n => new Date(n.createdAt) < twoWeeksAgo);
  
  const pool = oldNodes.length > 0 ? oldNodes : nodes;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const downloadBackup = (data: any) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "mind_os_ultra_backup_" + new Date().toISOString().split('T')[0] + ".json");
  document.body.appendChild(link);
  link.click();
  link.remove();
};