import React, { useState, useEffect } from 'react';
import { ThoughtNode, DateCell } from './types';
import { generateCalendar, toISODate } from './utils';
import { MonthGrid } from './components/MonthGrid';
import { Sidebar } from './components/Sidebar';
import { FocusEditor } from './components/FocusEditor';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './components/Button';

export default function App() {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  
  // Focus Mode State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<ThoughtNode | null>(null);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);

  // --- STORAGE ---
  useEffect(() => {
    const stored = localStorage.getItem('mind_os_nodes');
    if (stored) {
      try {
        setNodes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse nodes", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mind_os_nodes', JSON.stringify(nodes));
  }, [nodes]);

  // --- ACTIONS ---
  const handleSaveNode = (node: ThoughtNode) => {
    if (activeNode) {
      setNodes(nodes.map(n => n.id === node.id ? node : n));
    } else {
      setNodes([...nodes, node]);
    }
    setActiveNode(null);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setActiveNode(null);
  };

  const handleDropNode = (date: Date, nodeId: string) => {
    const iso = toISODate(date);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const updated = { ...node, date: iso };
      setNodes(nodes.map(n => n.id === nodeId ? updated : n));
    }
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setNodes(parsed);
          alert('Mind-OS Memory Restored.');
        }
      } catch (err) {
        alert('Corrupt memory file.');
      }
    };
    reader.readAsText(file);
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const openEditorForDate = (date: Date) => {
    setTargetDate(date);
    setActiveNode(null);
    setIsEditorOpen(true);
  };

  const openEditorForNode = (node: ThoughtNode) => {
    setActiveNode(node);
    setTargetDate(undefined);
    setIsEditorOpen(true);
  };

  const openEditorForInbox = () => {
    setActiveNode(null);
    setTargetDate(undefined);
    setIsEditorOpen(true);
  };

  const calendarCells = generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1c1917] text-stone-200 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <Sidebar 
        nodes={nodes}
        onNodeClick={openEditorForNode}
        onAddInbox={openEditorForInbox}
        onRestore={handleRestore}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-8 py-6 bg-[#1c1917]">
          <h2 className="text-3xl font-bold text-stone-100 font-display">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-stone-800 rounded-lg p-1 border border-stone-700">
               <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)} icon={<ChevronLeft size={18} />}></Button>
               <Button variant="ghost" size="sm" onClick={() => changeMonth(1)} icon={<ChevronRight size={18} />}></Button>
             </div>
             <Button onClick={() => setCurrentDate(new Date())} variant="zen">Today</Button>
          </div>
        </header>

        {/* CALENDAR GRID */}
        <main className="flex-1 px-8 pb-8 overflow-hidden animate-fade-in">
           <MonthGrid 
             cells={calendarCells} 
             nodes={nodes}
             onDateClick={openEditorForDate}
             onNodeClick={openEditorForNode}
             onDropNode={handleDropNode}
           />
        </main>
      </div>

      {/* FOCUS MODE EDITOR */}
      <FocusEditor 
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setActiveNode(null);
        }}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
        node={activeNode}
        initialDate={targetDate}
      />
    </div>
  );
}