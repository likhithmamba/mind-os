import React from 'react';
import { DateCell, ThoughtNode, NodeType } from '../types';
import { toISODate } from '../utils';
import { Lightbulb, Trophy, BookOpen, Brain } from 'lucide-react';

interface MonthGridProps {
  cells: DateCell[];
  nodes: ThoughtNode[];
  onDateClick: (date: Date) => void;
  onNodeClick: (node: ThoughtNode) => void;
  onDropNode: (date: Date, nodeId: string) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ 
  cells, 
  nodes, 
  onDateClick, 
  onNodeClick,
  onDropNode 
}) => {
  
  const getNodesForDate = (date: Date) => {
    const iso = toISODate(date);
    return nodes.filter(n => n.date === iso);
  };

  const getTypeColor = (t: NodeType) => {
    switch (t) {
      case 'idea': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'win': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'learning': return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'memory': return 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-stone-800');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-stone-800');
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-stone-800');
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId) {
      onDropNode(date, nodeId);
    }
  };

  return (
    <div className="grid grid-cols-7 h-full auto-rows-fr gap-px bg-stone-800 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="bg-[#1c1917] p-3 text-center text-xs font-semibold text-stone-500 uppercase tracking-widest h-10 border-b border-stone-800">
          {day}
        </div>
      ))}
      
      {cells.map((cell, idx) => {
        const dayNodes = getNodesForDate(cell.date);
        
        // Find "Win of the Day"
        const win = dayNodes.find(n => n.type === 'win');
        
        return (
          <div 
            key={idx}
            onClick={() => onDateClick(cell.date)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, cell.date)}
            className={`
              relative min-h-[120px] p-3 transition-colors cursor-pointer group
              ${!cell.isCurrentMonth ? 'bg-[#151413] opacity-40' : 'bg-[#1c1917] hover:bg-stone-900'}
              ${cell.isToday ? 'bg-stone-900 ring-1 ring-inset ring-emerald-500/30' : ''}
            `}
          >
            {/* Date Header */}
            <div className="flex justify-between items-start mb-2">
              <span className={`
                text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-all
                ${cell.isToday 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'text-stone-500 group-hover:text-stone-300'}
              `}>
                {cell.date.getDate()}
              </span>
              
              {/* Type Indicators (Dots) */}
              <div className="flex gap-1 mt-1.5">
                {dayNodes.filter(n => n.type !== 'win').slice(0, 3).map(n => (
                  <div key={n.id} className={`w-1.5 h-1.5 rounded-full ${
                    n.type === 'idea' ? 'bg-amber-500' :
                    n.type === 'learning' ? 'bg-sky-500' : 'bg-fuchsia-500'
                  }`} />
                ))}
              </div>
            </div>

            {/* Content Preview Area */}
            <div className="space-y-1.5">
              {/* Prioritize showing the WIN */}
              {win && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onNodeClick(win); }}
                  className="px-2 py-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-medium mb-1 truncate hover:bg-emerald-500/10 transition-colors"
                >
                  🏆 {win.title}
                </div>
              )}

              {/* Show other notes */}
              {dayNodes.filter(n => n !== win).slice(0, 3).map(node => (
                <div 
                  key={node.id}
                  onClick={(e) => { e.stopPropagation(); onNodeClick(node); }}
                  className={`
                    px-2 py-1 rounded text-xs truncate border transition-all hover:brightness-110
                    ${getTypeColor(node.type)}
                  `}
                >
                  {node.title || 'Untitled Thought'}
                </div>
              ))}
              
              {dayNodes.length === 0 && cell.isCurrentMonth && (
                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-stone-700 text-xs">+ Log Thought</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};