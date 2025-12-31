import React from 'react';
import { ThoughtNode, NodeType } from '../types';
import { Brain, Sparkles, Rewind, Layers, GripVertical } from 'lucide-react';
import { Button } from './Button';
import { getStorageSize, generateHeatmapData, getReflections, downloadBackup } from '../utils';

interface SidebarProps {
  nodes: ThoughtNode[];
  onNodeClick: (node: ThoughtNode) => void;
  onAddInbox: () => void;
  onRestore: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodes, 
  onNodeClick, 
  onAddInbox,
  onRestore
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inboxNodes = nodes.filter(n => !n.date);
  const heatmapData = generateHeatmapData(nodes);
  const reflections = getReflections(nodes);
  const storageInfo = getStorageSize();

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('nodeId', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onRestore(e.target.files[0]);
    }
  };

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-[#18181b] border-r border-stone-800 overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="p-6 border-b border-stone-800">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-stone-800 rounded-lg">
            <Brain size={20} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-stone-100 tracking-tight">Mind-OS</h1>
        </div>
        <p className="text-xs text-stone-500 font-mono pl-1">v2.0 // Cognitive Calendar</p>
      </div>

      {/* Memory Heatmap */}
      <div className="p-6 border-b border-stone-800">
        <div className="flex items-center gap-2 mb-4 text-stone-400">
          <Layers size={14} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Idea Density</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmapData.map((point, i) => (
            <div 
              key={i}
              title={`${point.date}: ${point.count} nodes`}
              className={`w-2.5 h-2.5 rounded-sm transition-colors ${
                point.intensity === 0 ? 'bg-stone-800' :
                point.intensity === 1 ? 'bg-emerald-900' :
                point.intensity === 2 ? 'bg-emerald-700' :
                point.intensity === 3 ? 'bg-emerald-500' : 'bg-emerald-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Reflection Engine */}
      {reflections.length > 0 && (
        <div className="p-6 border-b border-stone-800 bg-stone-900/30">
          <div className="flex items-center gap-2 mb-3 text-fuchsia-400">
            <Rewind size={14} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Look Back</h3>
          </div>
          <div className="space-y-3">
            {reflections.map((ref, idx) => (
              <div 
                key={idx} 
                onClick={() => onNodeClick(ref.node)}
                className="group cursor-pointer p-3 rounded-lg border border-stone-800 hover:border-fuchsia-500/30 hover:bg-stone-800/50 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-stone-500 uppercase font-mono">{ref.label}</span>
                  <span className="text-[10px] text-fuchsia-400">Recall</span>
                </div>
                <div className="text-sm text-stone-300 font-medium truncate">{ref.node.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idea Inbox (Scratchpad) */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles size={14} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Idea Inbox</h3>
          </div>
          <span className="text-xs text-stone-600">{inboxNodes.length}</span>
        </div>
        
        <div className="space-y-2 min-h-[100px]">
          {inboxNodes.map(node => (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              onClick={() => onNodeClick(node)}
              className="flex items-center gap-2 p-3 bg-stone-800/50 border border-stone-800 rounded-lg hover:border-amber-500/30 hover:bg-stone-800 cursor-move group transition-all active:cursor-grabbing"
            >
              <GripVertical size={14} className="text-stone-600 group-hover:text-stone-400" />
              <span className="text-sm text-stone-300 truncate">{node.title || 'Untitled Idea'}</span>
            </div>
          ))}
          <button 
            onClick={onAddInbox}
            className="w-full py-2 border border-dashed border-stone-700 rounded-lg text-xs text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-colors"
          >
            + Jot down quick idea
          </button>
        </div>
      </div>

      {/* Footer / Storage */}
      <div className="p-6 border-t border-stone-800 bg-stone-900/50">
         <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
           <span>Local Storage</span>
           <span>{storageInfo.size}</span>
         </div>
         <div className="w-full bg-stone-800 h-1 rounded-full mb-4">
           <div className="bg-stone-600 h-full rounded-full" style={{ width: `${storageInfo.percent}%` }}></div>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => downloadBackup(nodes)}>Backup</Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>Restore</Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
         </div>
      </div>
    </div>
  );
};