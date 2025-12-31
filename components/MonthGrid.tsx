import React from 'react';
import { DateCell, ThoughtNode, NodeType } from '../types';
import { toISODate } from '../utils';
import { Check, Circle } from 'lucide-react';

interface MonthGridProps {
  cells: DateCell[];
  nodes: ThoughtNode[];
  habits: Record<string, boolean>;
  activeFilter: NodeType | 'all';
  onDateClick: (date: Date) => void;
  onToggleHabit: (date: Date) => void;
  carryingNode: ThoughtNode | null;
  onDropNode: (date: Date) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ 
  cells, 
  nodes, 
  habits,
  activeFilter,
  onDateClick, 
  onToggleHabit,
  carryingNode,
  onDropNode
}) => {
  
  const getNodesForDate = (date: Date) => {
    const iso = toISODate(date);
    return nodes.filter(n => n.date === iso);
  };

  const getDensityStyle = (count: number) => {
    if (count === 0) return {};
    // Golden Heatmap Logic
    const intensity = Math.min(1, count / 8); 
    // Using a gradient background for density
    return {
      background: `linear-gradient(to bottom right, rgba(28, 25, 23, 0.4), rgba(245, 158, 11, ${intensity * 0.15}))`,
      borderColor: count > 3 ? `rgba(245, 158, 11, ${intensity * 0.4})` : undefined
    };
  };

  const getNodeDotColor = (t: NodeType) => {
    switch (t) {
      case 'idea': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'win': return 'bg-yellow-100 shadow-[0_0_8px_rgba(254,240,138,0.5)]';
      case 'learning': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
      case 'memory': return 'bg-stone-400 shadow-[0_0_8px_rgba(168,162,158,0.3)]';
    }
  };

  return (
    <div className="grid grid-cols-7 h-full auto-rows-fr gap-3 p-4">
      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
        <div key={day} className="text-center text-xs font-black text-stone-500 tracking-widest py-3">
          {day}
        </div>
      ))}
      
      {cells.map((cell, idx) => {
        const iso = toISODate(cell.date);
        const dayNodes = getNodesForDate(cell.date);
        const hasNodes = dayNodes.length > 0;
        const isHabitDone = habits[iso];
        const matchesFilter = activeFilter === 'all' || dayNodes.some(n => n.type === activeFilter);
        const isBlurry = hasNodes && !matchesFilter;

        return (
          <div 
            key={idx}
            onClick={() => carryingNode ? onDropNode(cell.date) : onDateClick(cell.date)}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#f59e0b'; // amber-500
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.background = '';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.background = '';
              onDropNode(cell.date);
            }}
            style={getDensityStyle(dayNodes.length)}
            className={`
              relative rounded-xl border transition-all duration-300 group overflow-hidden
              ${!cell.isCurrentMonth ? 'opacity-10 border-transparent' : 'glass-card border-stone-800 hover:border-amber-500/40'}
              ${cell.isToday ? 'ring-1 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}
              ${isBlurry ? 'blur-[2px] opacity-40 grayscale' : ''}
              ${carryingNode ? 'cursor-copy hover:bg-amber-900/30 scale-[0.98] hover:scale-100' : 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl'}
            `}
          >
            {/* Header */}
            <div className="relative z-20 flex justify-between items-start p-3">
              <span className={`
                text-lg font-bold transition-colors duration-300 font-display
                ${cell.isToday ? 'text-amber-500 scale-110' : 'text-stone-400 group-hover:text-stone-100'}
              `}>
                {cell.date.getDate()}
              </span>
              
              {cell.isCurrentMonth && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleHabit(cell.date); }}
                  className={`
                    transition-all duration-300 rounded-full p-1.5
                    ${isHabitDone ? 'text-amber-400 bg-amber-900/20 scale-110' : 'text-stone-700 hover:text-stone-400'}
                  `}
                >
                  {isHabitDone ? <Check size={14} strokeWidth={4} /> : <Circle size={14} strokeWidth={3} />}
                </button>
              )}
            </div>

            {/* Density Visualization (Dots) */}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 w-[85%] transition-opacity duration-300 group-hover:opacity-10">
               {dayNodes.slice(0, 7).map(n => (
                 <div key={n.id} className={`w-2 h-2 rounded-full ${getNodeDotColor(n.type)} transition-transform duration-500`} />
               ))}
               {dayNodes.length > 7 && <div className="w-2 h-2 rounded-full bg-stone-700" />}
            </div>

            {/* Preview on Hover */}
            <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-4 translate-y-2 group-hover:translate-y-0 z-30">
               <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 border-b border-stone-800 pb-1 flex justify-between">
                 <span>Preview</span>
                 <span className="text-amber-500">{dayNodes.length}</span>
               </div>
               <div className="space-y-2.5">
                 {dayNodes.slice(0, 3).map(node => (
                   <div key={node.id} className="flex items-center gap-2.5">
                     <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getNodeDotColor(node.type)}`} />
                     <span className="text-xs text-stone-200 truncate font-semibold">{node.title || 'Untitled'}</span>
                   </div>
                 ))}
                 {dayNodes.length > 3 && (
                   <div className="text-xs text-amber-600 pl-3 italic font-medium">+ {dayNodes.length - 3} more</div>
                 )}
                 {dayNodes.length === 0 && (
                   <div className="text-xs text-stone-600 italic">Empty. Drop ideas here.</div>
                 )}
               </div>
            </div>

            {/* Logical DnD Hint */}
            {carryingNode && (
               <div className="absolute inset-0 border-2 border-dashed border-amber-500/50 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-amber-500/5 flex items-center justify-center">
                 <span className="text-xs font-bold text-amber-500 bg-stone-950/80 px-3 py-1.5 rounded-lg tracking-wide">DROP HERE</span>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};