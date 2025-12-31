import React from 'react';
import { ThoughtNode, NodeType } from '../types';
import { Sparkles, Database, GripVertical, Trash2, Layout, Shield } from 'lucide-react';
import { Button } from './Button';

interface SidebarProps {
  nodes: ThoughtNode[];
  onPickupNode: (node: ThoughtNode) => void;
  carryingNode: ThoughtNode | null;
  onDeleteNode: (id: string) => void;
  storageStats: { usedKB: string; percent: number };
  onBackup: () => void;
  onWipe: () => void;
  onRestore: (file: File) => void;
  appMode: string;
  setAppMode: (mode: string) => void;
}

const ImperialShieldLogo = () => (
  <svg width="40" height="48" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    <defs>
      <linearGradient id="silverGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e5e5e5" />
        <stop offset="50%" stopColor="#737373" />
        <stop offset="100%" stopColor="#262626" />
      </linearGradient>
    </defs>
    <path d="M25 58L4 46V14L25 2L46 14V46L25 58Z" stroke="url(#silverGradient)" strokeWidth="3" fill="rgba(0,0,0,0.2)"/>
    <g transform="translate(14, 16)">
       <path d="M2 0V28" stroke="url(#silverGradient)" strokeWidth="3" strokeLinecap="square"/>
       <path d="M20 0V28" stroke="url(#silverGradient)" strokeWidth="3" strokeLinecap="square"/>
       <path d="M2 28L20 0" stroke="url(#silverGradient)" strokeWidth="3" strokeLinecap="square"/>
    </g>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodes, 
  onPickupNode,
  carryingNode,
  onDeleteNode,
  storageStats,
  onBackup,
  onWipe,
  onRestore,
  appMode,
  setAppMode
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inboxNodes = nodes.filter(n => !n.date);

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-[#0c0a09] border-r border-stone-800">
      
      <div className="p-8 flex flex-col items-center border-b border-stone-800/50 bg-gradient-to-b from-stone-900/50 to-transparent">
        <div className="mb-4 transform hover:scale-105 transition-transform duration-500">
          <ImperialShieldLogo />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-stone-200 tracking-widest leading-none drop-shadow-md">IMPERIAL</h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
            <span className="text-sm font-display font-bold text-amber-500 tracking-[0.3em]">OS</span>
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-5 py-6">
        <div className="flex items-center gap-2.5 mb-5 px-1 text-stone-400">
          <Sparkles size={16} className="text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-widest font-display">Thought Reserve</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar p-1">
          {inboxNodes.length === 0 && (
            <div className="text-center p-8 border border-dashed border-stone-800/50 rounded-xl bg-stone-900/20">
              <p className="text-sm text-stone-500 font-display">Reserve Empty</p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">Thoughts without dates dwell here until summoned.</p>
            </div>
          )}
          
          {inboxNodes.map(node => (
            <div
              key={node.id}
              draggable="true"
              onDragStart={(e) => {
                onPickupNode(node);
                e.dataTransfer.setData('text/plain', node.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => onPickupNode(node)}
              className={`
                group relative p-3.5 rounded-lg border transition-all duration-300 cursor-grab active:cursor-grabbing
                ${carryingNode?.id === node.id 
                  ? 'bg-amber-900/80 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)] transform scale-105 z-10' 
                  : 'bg-stone-900/40 border-stone-800 hover:border-stone-600 hover:bg-stone-800'}
              `}
            >
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-stone-600 mt-0.5 group-hover:text-stone-400 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold font-display truncate ${carryingNode?.id === node.id ? 'text-white' : 'text-stone-300'}`}>
                    {node.title || 'Untitled'}
                  </div>
                  <div className={`text-xs truncate mt-1 capitalize tracking-wide font-medium ${carryingNode?.id === node.id ? 'text-amber-200' : 'text-stone-500 group-hover:text-stone-400'}`}>
                    {node.type}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded text-stone-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 border-t border-stone-800 bg-stone-950">
        <div className="glass-card rounded-xl p-5 space-y-5 border border-stone-800/60 shadow-2xl">
          
          {/* MODE TOGGLE */}
          <div className="flex bg-stone-900/80 rounded-lg p-1 border border-stone-800 mb-2">
             <button 
                onClick={() => setAppMode('mind-os')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center justify-center gap-2 ${appMode === 'mind-os' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-500 hover:text-stone-300'}`}
             >
                <Layout size={14} /> Mind OS
             </button>
             <button 
                onClick={() => setAppMode('vanguard')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center justify-center gap-2 ${appMode === 'vanguard' ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-500 hover:text-stone-300'}`}
             >
                <Shield size={14} /> Vanguard
             </button>
          </div>

          <div className="flex items-center gap-2 text-stone-500 mb-0">
            <Database size={16} className="text-amber-700" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-display">System Status</h3>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-stone-500 mb-1.5 font-mono font-medium">
              <span>{storageStats.usedKB} KB</span>
              <span>{Math.round(storageStats.percent)}%</span>
            </div>
            <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${storageStats.percent > 80 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-amber-600 shadow-[0_0_10px_orange]'}`} 
                style={{ width: `${Math.max(2, storageStats.percent)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={onBackup} className="text-xs bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 py-2.5 rounded-lg transition-all font-display font-bold uppercase tracking-wider">
              Export
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 py-2.5 rounded-lg transition-all font-display font-bold uppercase tracking-wider">
              Import
            </button>
          </div>
          <button onClick={onWipe} className="w-full text-xs text-stone-600 hover:text-red-500 transition-colors py-1.5 font-mono hover:underline decoration-red-900/50">
            Format Drive
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={(e) => e.target.files?.[0] && onRestore(e.target.files[0])} 
          />
        </div>
      </div>
    </div>
  );
};