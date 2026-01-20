import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileUp,
    MessageSquare,
    Calendar,
    BrainCircuit,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Cpu,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import FocusCockpit from './FocusCockpit';

const SidebarItem = ({ to, icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
            ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}
        `}
    >
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span className="font-semibold text-sm tracking-tight">{label}</span>}
    </NavLink>
);

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [focusSeconds, setFocusSeconds] = useState(0);
    const location = useLocation();

    useEffect(() => {
        let interval = null;
        if (focusMode) {
            interval = setInterval(() => {
                setFocusSeconds(s => s + 1);
            }, 1000);
        } else {
            setFocusSeconds(0);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [focusMode]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFocusMode(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFocusMode = () => {
        if (!focusMode) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            }
            setFocusMode(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setFocusMode(false);
        }
    };

    const menuItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/upload', icon: <FileUp size={20} />, label: 'My Courses' },
        { to: '/plan', icon: <Calendar size={20} />, label: 'Study Planner' },
        { to: '/chat', icon: <MessageSquare size={20} />, label: 'AI Tutor Chat' },
        { to: '/quiz', icon: <BrainCircuit size={20} />, label: 'Adaptive Quizzes' },
        { to: '/dashboard', icon: <TrendingUp size={20} />, label: 'Mastery Analytics' },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Left Sidebar */}
            <aside
                className={`
                    flex flex-col bg-white border-r border-slate-200 transition-all duration-500 z-50
                    ${collapsed ? 'w-24' : 'w-72'}
                `}
            >
                <div className="p-8 flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary rounded-lg rotate-3">
                                <Cpu className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-black text-xl tracking-tight text-slate-800">
                                EduCopilot
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item, i) => (
                        <SidebarItem key={i} {...item} collapsed={collapsed} />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-4">
                    {!collapsed && (
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Focus Mode</span>
                                <button
                                    onClick={toggleFocusMode}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${focusMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${focusMode ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Mute distractions and enter concentrated study.</p>
                        </div>
                    )}
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 cursor-pointer group">
                        <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                        {!collapsed && <span className="font-semibold text-sm">Settings</span>}
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Bar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Engineering Course</span>
                        <div className="px-4 py-2 bg-slate-100 rounded-xl font-black text-xs text-slate-600 border border-slate-200">
                            Active Knowledge Base
                        </div>
                        {focusMode && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest tabular-nums">Focus: {formatTime(focusSeconds)}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Distractions Muted</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-slate-400 hover:text-primary transition-colors">
                            <Sparkles size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 border-2 border-white shadow-xl" />
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <motion.div
                        className="flex-1 overflow-auto"
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
