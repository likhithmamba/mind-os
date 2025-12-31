import { ThoughtNode, DateCell, HeatmapPoint } from './types';

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

export const getStorageSize = (): { size: string; percent: number } => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2;
    }
  }
  const sizeKB = total / 1024;
  const percent = Math.min(100, (sizeKB / 5120) * 100);
  return { size: sizeKB.toFixed(2) + ' KB', percent };
};

export const downloadBackup = (nodes: ThoughtNode[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "mind_os_backup_" + new Date().toISOString().split('T')[0] + ".json");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// --- COGNITIVE UTILS ---

export const getReflections = (nodes: ThoughtNode[]): { label: string, node: ThoughtNode }[] => {
  const today = new Date();
  const targets = [
    { days: 7, label: "7 Days Ago" },
    { days: 30, label: "30 Days Ago" },
    { days: 90, label: "3 Months Ago" },
    { days: 365, label: "1 Year Ago" }
  ];

  const reflections: { label: string, node: ThoughtNode }[] = [];

  targets.forEach(target => {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - target.days);
    const iso = toISODate(pastDate);
    
    // Find a significant node (win or idea preferred)
    const match = nodes.find(n => n.date === iso && (n.type === 'win' || n.type === 'idea')) 
               || nodes.find(n => n.date === iso);
    
    if (match) {
      reflections.push({ label: target.label, node: match });
    }
  });

  return reflections;
};

export const generateHeatmapData = (nodes: ThoughtNode[]): HeatmapPoint[] => {
  const map: Record<string, number> = {};
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 365);

  nodes.forEach(n => {
    if (n.date) {
      map[n.date] = (map[n.date] || 0) + 1;
    }
  });

  const points: HeatmapPoint[] = [];
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    const count = map[iso] || 0;
    let intensity: 0|1|2|3|4 = 0;
    if (count > 0) intensity = 1;
    if (count > 2) intensity = 2;
    if (count > 4) intensity = 3;
    if (count > 6) intensity = 4;

    points.push({ date: iso, count, intensity });
  }
  return points;
};