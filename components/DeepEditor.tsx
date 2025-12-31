import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, Calendar, CornerDownLeft, Maximize2, Minimize2, Plus } from 'lucide-react';
import { ThoughtNode, NodeType } from '../types';
import { Button } from './Button';
import { toISODate } from '../utils';

interface DeepEditorProps {
  isOpen: boolean;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onClose: () => void;
  onSave: (node: ThoughtNode) => void;
  onDelete: (id: string) => void;
  date: Date | null;
  nodes: ThoughtNode[];
}

export const DeepEditor: React.FC<DeepEditorProps> = ({ 
  isOpen, 
  isFocusMode,
  onToggleFocus,
  onClose, 
  onSave, 
  onDelete,
  date,
  nodes
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NodeType>('idea');
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  const dayNodes = date ? nodes.filter(n => n.date === toISODate(date)) : [];

  useEffect(() => {
    if (isOpen && dayNodes.length > 0 && !activeNodeId) {
      selectNode(dayNodes[0]);
    } else if (isOpen && dayNodes.length === 0) {
      resetForm();
    }
  }, [isOpen, date]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (isOpen) handleSave();
      }
      if (e.key === 'Escape') {
        if(isFocusMode) onToggleFocus();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, content, type, isFocusMode]);

  const selectNode = (node: ThoughtNode) => {
    setActiveNodeId(node.id);
    setTitle(node.title);
    setContent(node.content);
    setType(node.type);
  };

  const resetForm = () => {
    setActiveNodeId(null);
    setTitle('');
    setContent('');
    setType('idea');
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    
    const node: ThoughtNode = {
      id: activeNodeId || crypto.randomUUID(),
      title: title || 'Untitled Note',
      content,
      type,
      date: date ? toISODate(date) : null,
      createdAt: new Date().toISOString()
    };
    onSave(node);
    if (!activeNodeId) setActiveNodeId(node.id);
  };

  if (!isOpen || !date) return null;

  return (
    <div className={`h-full flex flex-col glass-panel border-l border-stone-800 bg-stone-950/95 backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isFocusMode ? 'border-none bg-stone-950/90' : ''}`}>
      
      {/* Header: Auto-fades in Focus Mode for Zen Experience */}
      <div className={`
        flex items-center justify-between p-6 border-b border-stone-800/50 transition-all duration-700
        ${isFocusMode ? 'opacity-20 hover:opacity-100 bg-transparent border-transparent absolute top-0 left-0 w-full z-50' : 'opacity-100 bg-stone-950/50'}
      `}>
        <div>
          <h2 className={`text-2xl font-bold text-stone-100 flex items-center gap-2 transition-all ${isFocusMode ? 'blur-[2px] hover:blur-none' : ''}`}>
            <Calendar size={22} className="text-amber-500" />
            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-sm text-stone-500 mt-1 flex items-center gap-1 font-medium">
            {isFocusMode ? 'Focus Mode Active' : 'Deep Editor'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={onToggleFocus}
             className={`p-2 rounded-lg transition-colors ${isFocusMode ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-stone-800 text-stone-500 hover:text-amber-400'}`}
             title={isFocusMode ? "Exit Focus (ESC)" : "Enter Focus"}
          >
             {isFocusMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-amber-400 transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-hidden flex flex-col md:flex-row ${isFocusMode ? 'pt-20' : ''}`}>
        
        {/* Node List (Collapses in Focus Mode) */}
        <div className={`
          border-r border-stone-800/50 overflow-y-auto bg-stone-900/30 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isFocusMode ? 'w-0 opacity-0 p-0 border-none' : 'w-full md:w-64 p-4 opacity-100'}
        `}>
          <button 
            onClick={resetForm}
            className={`
              w-full py-3 mb-4 text-xs font-bold border rounded-lg transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide
              ${!activeNodeId 
                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                : 'text-stone-400 border-dashed border-stone-800 hover:bg-stone-800 hover:text-stone-200'}
            `}
          >
            <Plus size={16} /> Create New Node
          </button>
          
          <div className="space-y-2">
            {dayNodes.map(node => (
              <div 
                key={node.id}
                onClick={() => selectNode(node)}
                className={`
                  p-4 rounded-lg cursor-pointer border transition-all duration-200
                  ${activeNodeId === node.id 
                    ? 'bg-stone-800 border-stone-700 text-stone-100 shadow-lg border-l-4 border-l-amber-500 translate-x-1' 
                    : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900'}
                `}
              >
                <div className="font-bold text-base truncate">{node.title || 'Untitled'}</div>
                <div className="text-xs opacity-70 capitalize mt-1 text-amber-500/90 font-medium">{node.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Inputs (Expands & Centers in Focus Mode) */}
        <div className={`
          flex-1 flex flex-col bg-gradient-to-br from-stone-950/50 to-stone-900/20 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isFocusMode ? 'p-12 md:p-32 max-w-5xl mx-auto w-full' : 'p-8 md:p-12'}
        `}>
          <div className={`flex items-center gap-3 mb-8 transition-opacity duration-500 ${isFocusMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
            {(['idea', 'win', 'learning', 'memory'] as NodeType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`
                  px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all
                  ${type === t 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                    : 'bg-transparent border-stone-800 text-stone-600 hover:border-stone-700 hover:text-stone-400'}
                `}
              >
                {t}
              </button>
            ))}
            <div className="flex-1"></div>
            {activeNodeId && (
              <button 
                onClick={() => { onDelete(activeNodeId); resetForm(); }}
                className="text-stone-600 hover:text-red-400 transition-colors p-2 hover:bg-red-900/10 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your thought..."
            className={`
              bg-transparent font-bold text-stone-100 placeholder-stone-700 border-none outline-none mb-6 font-display transition-all duration-500
              ${isFocusMode ? 'text-7xl text-center placeholder:text-center' : 'text-5xl'}
            `}
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing... (Markdown friendly)"
            className={`
              flex-1 bg-transparent text-stone-300 placeholder-stone-700 border-none outline-none resize-none font-mono leading-loose custom-scrollbar transition-all duration-500
              ${isFocusMode ? 'text-2xl md:text-3xl px-8 leading-loose' : 'text-xl'}
            `}
          />

          <div className={`mt-8 pt-8 border-t border-stone-800 flex justify-end items-center gap-6 transition-opacity duration-500 ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
             <span className="text-xs text-stone-600 flex items-center gap-2 font-bold tracking-wide">
               <CornerDownLeft size={14} /> Cmd+Enter to save
             </span>
             <Button variant="primary" onClick={handleSave} icon={<Save size={18} />}>
               {activeNodeId ? 'Update Note' : 'Save Note'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};