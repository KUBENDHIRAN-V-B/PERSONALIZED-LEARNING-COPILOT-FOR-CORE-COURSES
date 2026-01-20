import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar,
    Lightbulb,
    Clock,
    ChevronRight,
    Target,
    Zap,
    Goal,
    Crown,
    CheckCircle2,
    Cpu,
    ArrowRight,
    Save,
    Check,
    History,
    Trash2,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeekCard = ({ week, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative pl-12 pb-12 group last:pb-0"
    >
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 group-last:bottom-full group-last:h-6" />
        {/* Timeline Dot */}
        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-[3px] border-slate-200 flex items-center justify-center z-10 group-hover:border-primary transition-colors group-hover:scale-110 duration-300">
            <span className="text-[10px] font-black text-slate-400 group-hover:text-primary">{week.week_number}</span>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden border-slate-100 flex flex-col md:flex-row shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {/* Week Sidebar */}
            <div className="md:w-64 bg-slate-50/50 p-8 border-r border-slate-100/50 flex flex-col justify-between shrink-0">
                <div>
                    <h3 className="text-2xl font-display font-black text-slate-800 leading-tight mb-2">
                        Week {week.week_number}
                    </h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">
                        {week.theme}
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl w-fit shadow-xs">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{week.total_hours || '14'} Hours</span>
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Focus Mode</p>
                    <p className="text-xs font-bold text-slate-600 line-clamp-2">{week.revision_focus}</p>
                </div>
            </div>

            {/* Daily Schedule */}
            <div className="flex-1 p-8 space-y-6 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {week.daily_plan.map((day, d) => (
                        <div key={d} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group/day hover:bg-white hover:shadow-lg transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{day.day}</span>
                                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg opacity-0 group-hover/day:opacity-100 transition-opacity">
                                    <CheckCircle2 size={12} />
                                </div>
                            </div>
                            <h4 className="text-sm font-black text-slate-800 leading-tight mb-2 min-h-[40px]">
                                {day.focus_topic}
                            </h4>
                            <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 w-fit px-2 py-1 rounded-md mb-2">
                                <Zap size={10} className="fill-current" /> Mastery Task
                            </div>
                            <ul className="space-y-1.5">
                                {day.activities.slice(0, 3).map((act, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-500 font-medium">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                        <span className="line-clamp-1">{act}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const Planner = () => {
    const [goal, setGoal] = useState('');
    const [hours, setHours] = useState(2);
    const [examDate, setExamDate] = useState('');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savedPlans, setSavedPlans] = useState([]);
    const [showSavedPlans, setShowSavedPlans] = useState(false);

    useEffect(() => {
        fetchSavedPlans();
    }, []);

    const fetchSavedPlans = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/plans');
            setSavedPlans(res.data);
        } catch (error) {
            console.error('Failed to fetch saved plans:', error);
        }
    };

    const loadSavedPlan = async (planId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/plan/${planId}`);
            if (res.data.plan_data) {
                setPlan(res.data.plan_data);
                setGoal(res.data.goal);
                setExamDate(res.data.exam_date);
                setHours(res.data.hours_per_day);
                setShowSavedPlans(false);
            }
        } catch (error) {
            console.error('Failed to load plan:', error);
        }
    };

    const deleteSavedPlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this saved plan?')) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/plan/${planId}`);
            fetchSavedPlans();
        } catch (error) {
            console.error('Failed to delete plan:', error);
        }
    };

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/plan', {
                goal,
                hours_per_day: parseInt(hours),
                exam_date: examDate,
                weak_topics: null
            });
            setPlan(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        if (!plan) return;
        setSaving(true);
        try {
            await axios.post('http://127.0.0.1:8000/plan/save', {
                goal,
                exam_date: examDate,
                hours_per_day: parseInt(hours),
                plan_data: plan
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save plan:', error);
            alert('Failed to save plan. Please try again.');
        } finally {
            setSaving(false);
            fetchSavedPlans(); // Refresh the list after saving
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        Strategic <span className="text-gradient">Roadmap</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">AI-generated milestones to navigate your toughest course materials.</p>
                </div>
                <div className="flex gap-3">
                    {savedPlans.length > 0 && (
                        <button
                            onClick={() => setShowSavedPlans(!showSavedPlans)}
                            className={`interactive-pill flex items-center gap-2 cursor-pointer transition-all ${showSavedPlans ? 'ring-2 ring-primary' : ''}`}
                        >
                            <History size={16} className="text-primary" />
                            <span className="text-sm font-bold text-slate-700">
                                {showSavedPlans ? 'Hide' : 'View'} Saved Plans ({savedPlans.length})
                            </span>
                        </button>
                    )}
                    <div className="interactive-pill flex items-center gap-2">
                        <Goal size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700">Exam-Oriented Strategy</span>
                    </div>
                </div>
            </div>

            {/* Saved Plans Section */}
            <AnimatePresence>
                {showSavedPlans && savedPlans.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-8 rounded-[2.5rem] space-y-4">
                            <h3 className="text-lg font-display font-black text-slate-800 flex items-center gap-2">
                                <History size={20} className="text-primary" />
                                Your Saved Roadmaps
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedPlans.map((savedPlan) => (
                                    <div
                                        key={savedPlan.id}
                                        className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${savedPlan.is_active
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 bg-white hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-black text-slate-800 line-clamp-1">{savedPlan.goal}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    Exam: {savedPlan.exam_date}
                                                </p>
                                            </div>
                                            {savedPlan.is_active && (
                                                <span className="px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">
                                            {savedPlan.hours_per_day}h/day • Created {new Date(savedPlan.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => loadSavedPlan(savedPlan.id)}
                                                className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 hover:bg-slate-800 transition-all"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                onClick={() => deleteSavedPlan(savedPlan.id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!plan ? (
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col items-center mb-10">
                            <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                                <Cpu size={32} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-display font-black text-slate-900">Define Your Campaign</h2>
                            <p className="text-slate-500 font-medium mt-1">Tell the AI your goal and availability.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Learning Mission</p>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g. Master the core concepts of my syllabus"
                                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-display text-lg font-black tracking-tight"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Deadline / Exam Date</p>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Daily Commitment</p>
                                    <div className="relative">
                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                                        <input
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-slate-700"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours / Day</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={generatePlan}
                                disabled={loading || !goal || !examDate}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-lg font-black hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xl shadow-slate-200 shadow-indigo-200 flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyzing Materials & Plotting Roadmap...
                                    </>
                                ) : (
                                    <>
                                        Generate Intelligence Roadmap <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Strategy Overview */}
                    <div className="glass-card p-10 rounded-[3.5rem] premium-gradient text-white flex flex-col md:flex-row md:items-center gap-10 shadow-2xl shadow-primary/30">
                        <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2.5rem] md:w-1/3 shrink-0">
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="w-6 h-6 text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Campaign Overview</span>
                            </div>
                            <p className="text-3xl font-display font-black leading-tight mb-2">
                                {plan.total_weeks} Week Mastery Journey
                            </p>
                            <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                                "{plan.strategy_summary}"
                            </p>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <Lightbulb size={24} className="text-amber-400 shrink-0" />
                                <h3 className="text-xl font-display font-black">AI Reasoning</h3>
                            </div>
                            <p className="text-sm font-medium leading-[1.8] text-white/90 glass-card bg-white/5 border-none shadow-none p-6 rounded-3xl">
                                {plan.reasoning}
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="max-w-6xl mx-auto pt-16">
                        {plan.schedule.map((week, i) => (
                            <WeekCard key={i} week={week} index={i} />
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={savePlan}
                            disabled={saving || saved}
                            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 ${saved
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : saved ? (
                                <>
                                    <Check size={16} />
                                    Roadmap Saved!
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Roadmap
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { setPlan(null); setSaved(false); }}
                            className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            Configure New Strategy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Planner;
