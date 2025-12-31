import React, { useState, useEffect, useMemo } from 'react';
import { ThoughtNode, NodeType } from './types';
import { generateCalendar, toISODate, StorageManager, getRandomRecall } from './utils';
import { MonthGrid } from './components/MonthGrid';
import { Sidebar } from './components/Sidebar';
import { DeepEditor } from './components/DeepEditor';
import { VanguardView } from './components/VanguardView';
import { ChevronLeft, ChevronRight, Filter, Zap, Sparkles } from 'lucide-react';
import { Button } from './components/Button';

export default function App() {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nodes, setNodes] = useState<ThoughtNode[]>([]);
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  
  // UI State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NodeType | 'all'>('all');
  const [carryingNode, setCarryingNode] = useState<ThoughtNode | null>(null);
  const [recallNode, setRecallNode] = useState<ThoughtNode | null>(null);
  const [appMode, setAppMode] = useState<string>('mind-os');

  // --- STORAGE ---
  useEffect(() => {
    const data = StorageManager.load();
    setNodes(data.nodes);
    setHabits(data.habits);
  }, []);

  useEffect(() => {
    StorageManager.save(nodes, habits);
  }, [nodes, habits]);

  // --- ACTIONS ---
  const handleSaveNode = (node: ThoughtNode) => {
    const exists = nodes.find(n => n.id === node.id);
    if (exists) {
      setNodes(nodes.map(n => n.id === node.id ? node : n));
    } else {
      setNodes([...nodes, node]);
    }
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (isEditorOpen) {
       setIsEditorOpen(false);
       setIsFocusMode(false);
    }
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && date.getTime() === selectedDate.getTime() && isEditorOpen) {
      setIsEditorOpen(false);
      setIsFocusMode(false);
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
      setIsEditorOpen(true);
    }
  };

  const handleToggleHabit = (date: Date) => {
    const iso = toISODate(date);
    setHabits(prev => ({ ...prev, [iso]: !prev[iso] }));
  };

  const handlePickupNode = (node: ThoughtNode) => {
    if (carryingNode?.id === node.id) {
      setCarryingNode(null);
    } else {
      setCarryingNode(node);
    }
  };

  const handleDropNode = (date: Date) => {
    if (!carryingNode) return;
    const updated = { ...carryingNode, date: toISODate(date) };
    handleSaveNode(updated);
    setCarryingNode(null);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.nodes && parsed.habits) {
          setNodes(parsed.nodes);
          setHabits(parsed.habits);
          alert('System restored.');
        }
      } catch (err) {
        alert('Data corruption detected.');
      }
    };
    reader.readAsText(file);
  };

  const triggerRecall = () => {
    const node = getRandomRecall(nodes);
    setRecallNode(node);
    setTimeout(() => setRecallNode(null), 8000); 
  };

  const calendarCells = useMemo(() => 
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth()), 
  [currentDate]);

  const storageStats = useMemo(() => StorageManager.getStats(nodes), [nodes]);

  return (
    <div className="flex h-screen w-screen bg-[#0c0a09] text-stone-200 overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* LEFT: SIDEBAR */}
      <div className={`layout-transition flex-shrink-0 bg-[#0c0a09] border-r border-stone-800 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isFocusMode ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-full md:w-80 opacity-100'}`}>
        <Sidebar 
          nodes={nodes}
          carryingNode={carryingNode}
          onPickupNode={handlePickupNode}
          onDeleteNode={handleDeleteNode}
          storageStats={storageStats}
          appMode={appMode}
          setAppMode={setAppMode}
          onBackup={() => StorageManager.load().nodes && StorageManager.load().nodes.length > 0 && console.log("Backing up...")}
          onWipe={() => { if(confirm('Nuke all data?')) { StorageManager.wipe(); setNodes([]); setHabits({}); } }}
          onRestore={handleRestore}
        />
      </div>

      {appMode === 'mind-os' ? (
        <>
            {/* CENTER: CALENDAR GRID */}
            <div className={`layout-transition flex flex-col relative z-10 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isFocusMode ? 'w-0 opacity-0 overflow-hidden' : 'flex-1'} ${isEditorOpen && !isFocusMode ? 'w-[50vw]' : 'w-full'}`}>
            
            <header className="flex items-center justify-between px-10 py-8">
                <div className="flex items-center gap-6">
                <h2 className="text-4xl font-bold text-stone-100 tracking-tight font-display drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex bg-stone-900 rounded-lg p-1.5 border border-stone-800">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:text-white text-stone-500"><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:text-white text-stone-500"><ChevronRight size={20} /></button>
                </div>
                <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold text-stone-500 hover:text-amber-500 transition-colors uppercase tracking-widest">Jump to Today</button>
                </div>

                <div className="flex items-center gap-2 bg-stone-900/50 p-1.5 rounded-full border border-stone-800">
                <Filter size={16} className="ml-2 text-stone-500" />
                {(['all', 'idea', 'win', 'learning', 'memory'] as const).map(f => (
                    <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`
                        px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                        ${activeFilter === f ? 'bg-amber-600 text-white shadow-md' : 'text-stone-500 hover:text-stone-300'}
                    `}
                    >
                    {f}
                    </button>
                ))}
                </div>
            </header>

            <main className="flex-1 px-10 pb-10 overflow-hidden">
                <MonthGrid 
                cells={calendarCells} 
                nodes={nodes}
                habits={habits}
                activeFilter={activeFilter}
                onDateClick={handleDateClick}
                onToggleHabit={handleToggleHabit}
                carryingNode={carryingNode}
                onDropNode={handleDropNode}
                />
            </main>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <button 
                onClick={triggerRecall}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass-card hover:bg-stone-800/60 transition-all text-xs text-amber-500/90 font-bold border border-amber-900/20 uppercase tracking-widest"
                >
                <Zap size={16} /> Memory Recall
                </button>
            </div>

            {recallNode && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-96 glass-panel p-6 rounded-2xl shadow-2xl animate-fade-in-up z-50 border-amber-500/20">
                <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Resurfaced Memory
                </div>
                <div className="text-lg font-bold text-white mb-2 font-display">{recallNode.title}</div>
                <div className="text-sm text-stone-300 leading-relaxed line-clamp-3">{recallNode.content}</div>
                </div>
            )}
            </div>

            {/* RIGHT: DEEP EDITOR */}
            <div className={`layout-transition border-l border-stone-800 bg-[#0c0a09] relative z-20 flex-shrink-0 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isFocusMode ? 'w-screen translate-x-0' : isEditorOpen ? 'w-[45vw] translate-x-0' : 'w-0 translate-x-full opacity-0'}`}>
            <DeepEditor 
                isOpen={isEditorOpen}
                isFocusMode={isFocusMode}
                onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                onClose={() => { setIsEditorOpen(false); setIsFocusMode(false); setSelectedDate(null); }}
                date={selectedDate}
                nodes={nodes}
                onSave={handleSaveNode}
                onDelete={handleDeleteNode}
            />
            </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden relative">
            <VanguardView />
        </div>
      )}

    </div>
  );
}