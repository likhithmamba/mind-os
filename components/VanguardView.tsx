import React, { useState, useEffect, useMemo } from 'react';
import { Target, Shield, BookOpen, Rocket, Activity, Timer, Play, Pause, TrendingUp, CheckSquare, Trash2 } from 'lucide-react';

interface Log {
  date: string;
  revision: string;
  upskill: string;
  confidence: number;
}

interface SyllabusItem {
  id: number;
  text: string;
  completed: boolean;
}

export const VanguardView = () => {
  // State initialization
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('vanguard_logs'); 
    return saved ? JSON.parse(saved) : [];
  });
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(() => {
    const saved = localStorage.getItem('vanguard_syllabus');
    return saved ? JSON.parse(saved) : [];
  });
  const [examDate, setExamDate] = useState(() => localStorage.getItem('vanguard_exam') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('vanguard_logs', JSON.stringify(logs));
    localStorage.setItem('vanguard_syllabus', JSON.stringify(syllabus));
    localStorage.setItem('vanguard_exam', examDate);
  }, [logs, syllabus, examDate]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert("Focus session complete. Log your progress.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const daysRemaining = useMemo(() => {
    if (!examDate) return "N/A";
    const diff = new Date(examDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [examDate]);

  const currentLog = logs.find(l => l.date === selectedDate) || { date: selectedDate, revision: '', upskill: '', confidence: 1 };

  const saveLog = (field: keyof Log, val: any) => {
    const updatedLogs = [...logs];
    const idx = updatedLogs.findIndex(l => l.date === selectedDate);
    if (idx > -1) {
      updatedLogs[idx] = { ...updatedLogs[idx], [field]: val };
    } else {
      updatedLogs.push({ date: selectedDate, revision: '', upskill: '', confidence: 1, [field]: val });
    }
    setLogs(updatedLogs);
  };

  const addSyllabusItem = (text: string) => {
    if (!text.trim()) return;
    setSyllabus([...syllabus, { id: Date.now(), text, completed: false }]);
  };

  const toggleSyllabusItem = (id: number) => {
    setSyllabus(syllabus.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };
  
  const deleteSyllabusItem = (id: number) => {
      setSyllabus(syllabus.filter(s => s.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full p-6 md:p-8 space-y-8 relative overflow-hidden">
        <div className="vanguard-bg"></div>

        {/* TOP HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 relative z-10">
            {/* Exam Countdown */}
            <div className="glass-panel-vanguard rounded-2xl p-6 flex items-center justify-between border-l-4 border-l-indigo-500">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Exam Countdown</p>
                    <p className="text-4xl font-bold font-mono text-slate-100 tracking-tight">{daysRemaining} DAYS</p>
                </div>
                <input 
                    type="date" 
                    value={examDate} 
                    onChange={e => setExamDate(e.target.value)} 
                    className="bg-slate-900/50 border border-slate-700 text-xs p-2 rounded text-slate-300 outline-none focus:border-indigo-500 font-mono" 
                />
            </div>
            
            {/* Tactical Timer */}
            <div className="glass-panel-vanguard rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Tactical Timer</p>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold font-mono text-slate-100 tracking-tight">{formatTime(timeLeft)}</p>
                        <Timer size={20} className="text-slate-500" />
                    </div>
                </div>
                <button 
                    onClick={() => setIsActive(!isActive)} 
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all tracking-wide ${isActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}
                >
                    {isActive ? <Pause size={14} /> : <Play size={14} />}
                    {isActive ? 'PAUSE' : 'FOCUS'}
                </button>
            </div>

            {/* Syllabus Mastery */}
            <div className="glass-panel-vanguard rounded-2xl p-6 flex items-center justify-between border-r-4 border-r-emerald-500">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Syllabus Mastery</p>
                    <p className="text-4xl font-bold font-mono text-slate-100 tracking-tight">
                        {Math.round((syllabus.filter(s => s.completed).length / (syllabus.length || 1)) * 100)}%
                    </p>
                </div>
                <TrendingUp size={36} className="text-emerald-500/50" />
            </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-1 gap-8 overflow-hidden relative z-10 flex-col md:flex-row">
            
            {/* LEFT: SYLLABUS */}
            <div className="w-full md:w-80 glass-panel-vanguard rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <CheckSquare size={16} className="text-indigo-400" /> Curriculum
                </h3>
                <input 
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            addSyllabusItem(e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }}
                    placeholder="+ Add Topic..." 
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 font-medium"
                />
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                    {syllabus.map(item => (
                        <div key={item.id} className="flex items-center gap-3 group p-3 rounded-lg hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-800/50">
                            <button 
                                onClick={() => toggleSyllabusItem(item.id)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 hover:border-indigo-500'}`}
                            >
                                {item.completed && <CheckSquare size={12} className="text-white" />}
                            </button>
                            <span className={`text-sm truncate flex-1 font-medium leading-normal ${item.completed ? 'line-through opacity-40 text-slate-500' : 'text-slate-200'}`}>
                                {item.text}
                            </span>
                             <button 
                                onClick={() => deleteSyllabusItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {syllabus.length === 0 && (
                        <div className="text-center py-10 opacity-30 text-xs uppercase tracking-widest text-slate-500 font-bold">No Topics Added</div>
                    )}
                </div>
            </div>

            {/* CENTER: DAILY DEPLOYMENT */}
            <div className="flex-1 glass-panel-vanguard rounded-2xl p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                            <Activity size={16} />
                            <span className="text-xs font-mono uppercase tracking-widest font-bold">Log Date</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white font-display">{selectedDate}</h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Confidence</span>
                        <div className="flex gap-1.5">
                            {[1,2,3,4,5].map(n => (
                                <button 
                                    key={n} 
                                    onClick={() => saveLog('confidence', n)} 
                                    className={`w-9 h-9 text-sm font-mono font-bold rounded-lg border transition-all ${currentLog.confidence >= n ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-800 text-slate-600 bg-slate-900/30 hover:bg-slate-800'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 flex-1 min-h-0">
                    <div className="space-y-4 flex flex-col h-1/2">
                        <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-2 tracking-wide">
                            <BookOpen size={14} className="text-red-400" /> Exam Revision Topics
                        </label>
                        <textarea 
                            value={currentLog.revision}
                            onChange={e => saveLog('revision', e.target.value)}
                            className="flex-1 w-full bg-slate-900/50 rounded-xl p-5 text-base border border-slate-800/60 outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all text-slate-200 placeholder-slate-600 resize-none leading-relaxed"
                            placeholder="Detail specific formulas, chapters, or mock tests covered today..."
                        ></textarea>
                    </div>
                    <div className="space-y-4 flex flex-col h-1/2">
                        <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-2 tracking-wide">
                            <Rocket size={14} className="text-emerald-400" /> Skill Upskilling (Growth)
                        </label>
                        <textarea 
                            value={currentLog.upskill}
                            onChange={e => saveLog('upskill', e.target.value)}
                            className="flex-1 w-full bg-slate-900/50 rounded-xl p-5 text-base border border-slate-800/60 outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 transition-all text-slate-200 placeholder-slate-600 resize-none leading-relaxed"
                            placeholder="Log new technologies learned, code written, or projects advanced..."
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* RIGHT: TIMELINE SELECTOR */}
            <div className="w-24 glass-panel-vanguard rounded-2xl flex flex-col items-center p-3 gap-2.5 overflow-y-auto custom-scrollbar">
                {Array.from({length: 40}).map((_, i) => {
                    const d = new Date(); 
                    d.setDate(d.getDate() - 10 + i);
                    const ds = d.toISOString().split('T')[0];
                    const hasLog = logs.some(l => l.date === ds);
                    const isSelected = selectedDate === ds;
                    return (
                        <button 
                            key={ds} 
                            onClick={() => setSelectedDate(ds)} 
                            className={`w-full py-4 rounded-xl flex flex-col items-center transition-all duration-300 ${isSelected ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'hover:bg-slate-800/40 opacity-50 hover:opacity-100 text-slate-400'}`}
                        >
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider mb-0.5">{d.toLocaleString('default', {month:'short'})}</span>
                            <span className="text-lg font-bold font-mono">{d.getDate()}</span>
                            {hasLog && <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
  );
};