import React, { useState, useEffect } from 'react';
import {
    Timer,
    Activity,
    Target,
    ChevronLeft,
    Maximize2,
    Minimize2,
    BookOpen,
    BrainCircuit,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FocusCockpit = ({ children, onExit }) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0F172A] text-slate-200 flex flex-col overflow-hidden font-display">
            {/* Minimal Focus Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} /> Exit Focus
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Deep Learning Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 glass-card bg-white/5 border-none px-4 py-1.5 rounded-full">
                        <Timer size={14} className="text-primary" />
                        <span className="text-xl font-black tabular-nums">{formatTime(seconds)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Progress</p>
                            <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3-Column Cockpit Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Content Navigator */}
                <aside className="w-80 border-r border-white/5 bg-slate-900/30 p-8 hidden lg:flex flex-col gap-8 shrink-0">
                    <section>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Learning Path</h4>
                        <div className="space-y-4">
                            {[
                                { icon: <BookOpen size={16} />, label: 'Reviewing: Core Principles', status: 'active' },
                                { icon: <Zap size={16} />, label: 'Mastery Drill: Concept A', status: 'pending' },
                                { icon: <Activity size={16} />, label: 'Retention Check', status: 'pending' },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${item.status === 'active' ? 'bg-primary/10 border-primary/20 text-white' : 'bg-white/5 border-transparent text-slate-400'}`}>
                                    {item.icon}
                                    <span className="text-sm font-bold">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-auto p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <BrainCircuit className="text-indigo-400" />
                            <h5 className="font-black text-sm text-indigo-100">AI Observer</h5>
                        </div>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                            "You're currently in high-alpha state. Perfect for tackling the complex proofs in Chapter 4."
                        </p>
                    </section>
                </aside>

                {/* Center: Hero Workspace */}
                <main className="flex-1 overflow-auto relative bg-[#020617]">
                    <div className="max-w-4xl mx-auto py-12 px-8 min-h-full">
                        {children}
                    </div>
                </main>

                {/* Right: Metrics & Analytics */}
                <aside className="w-80 border-l border-white/5 bg-slate-900/30 p-8 hidden xl:flex flex-col gap-8 shrink-0">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Focus Pulse</h4>

                    <div className="glass-card bg-white/5 border-none p-6 rounded-[2rem] space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-400">Concentration Level</span>
                                <span className="text-lg font-black text-emerald-400">92%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: '92%' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-400">Retention Probability</span>
                                <span className="text-lg font-black text-primary">84%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: '84%' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity">
                            <Activity className="mx-auto text-primary animate-pulse" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyzing Retention Curve...</p>
                        </div>
                    </div>

                    <div className="p-1 border border-white/10 rounded-2xl flex gap-1">
                        <button className="flex-1 py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20">Mute All</button>
                        <button className="flex-1 py-3 bg-primary rounded-xl text-[10px] font-black uppercase tracking-widest">Ambient ON</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FocusCockpit;
