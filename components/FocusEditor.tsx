import React, { useState, useEffect } from 'react';
import { X, Save, Lightbulb, Trophy, BookOpen, Brain, Tag } from 'lucide-react';
import { ThoughtNode, NodeType } from '../types';
import { Button } from './Button';
import { toISODate } from '../utils';

interface FocusEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: ThoughtNode) => void;
  onDelete: (id: string) => void;
  node: ThoughtNode | null;
  initialDate?: Date;
}

export const FocusEditor: React.FC<FocusEditorProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  node,
  initialDate 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NodeType>('idea');
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setContent(node.content);
      setType(node.type);
      setDate(node.date);
    } else {
      setTitle('');
      setContent('');
      setType('idea');
      // If initialDate is provided, use it. Otherwise null (Inbox)
      setDate(initialDate ? toISODate(initialDate) : null);
    }
  }, [node, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: node?.id || crypto.randomUUID(),
      title,
      content,
      type,
      date,
      createdAt: node?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  const getTypeIcon = (t: NodeType) => {
    switch (t) {
      case 'idea': return <Lightbulb size={16} />;
      case 'win': return <Trophy size={16} />;
      case 'learning': return <BookOpen size={16} />;
      case 'memory': return <Brain size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-4xl h-[90vh] bg-[#1c1917] border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden zen-shadow animate-fade-in-up">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/50">
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-stone-800 p-1 rounded-lg">
              {(['idea', 'win', 'learning', 'memory'] as NodeType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-2 rounded-md transition-all ${
                    type === t 
                      ? 'bg-stone-700 text-emerald-400 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                >
                  {getTypeIcon(t)}
                </button>
              ))}
            </div>
            <span className="text-stone-500 text-sm font-mono">
              {date ? date : 'Inbox (Unscheduled)'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             {node && (
               <button 
                 onClick={() => { onDelete(node.id); onClose(); }}
                 className="text-stone-500 hover:text-red-400 transition-colors px-3 py-2 text-sm"
               >
                 Delete
               </button>
             )}
             <Button variant="ghost" onClick={onClose}><X size={20} /></Button>
             <Button variant="primary" onClick={handleSubmit} icon={<Save size={16} />}>Save Node</Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New Thought..."
            className="w-full bg-transparent text-4xl font-bold text-stone-100 placeholder-stone-700 border-none outline-none mb-6 font-display"
            autoFocus
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Capture your ideas, wins, or lessons here. Use markdown-style bullets (- ) for lists."
            className="w-full h-full min-h-[50vh] bg-transparent text-lg text-stone-300 placeholder-stone-700 border-none outline-none resize-none font-mono leading-relaxed"
          />
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 border-t border-stone-800 bg-stone-900/50 text-xs text-stone-600 flex justify-between">
           <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
           <span>Focus Mode Active</span>
        </div>

      </div>
    </div>
  );
};