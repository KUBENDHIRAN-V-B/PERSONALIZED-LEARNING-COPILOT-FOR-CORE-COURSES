import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Target,
    AlertCircle,
    TrendingUp,
    Clock,
    CheckCircle2,
    Zap,
    BrainCircuit,
    ArrowRight,
    Sparkles,
    BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const ProgressCircle = ({ percentage, color = "indigo-600" }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
                <circle
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
                <circle
                    stroke={color.includes('#') ? color : "currentColor"}
                    className={`transition-all duration-1000 ease-out ${!color.includes('#') ? `text-${color}` : ''}`}
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
            </svg>
            <span className="absolute text-xl font-display font-black text-slate-800">{Math.round(percentage)}%</span>
        </div>
    );
};

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/profile');
                setProfile(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="p-12 flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const stats = [
        { label: 'Active Materials', value: profile?.stats?.active_materials || '0', icon: <BookOpen size={20} />, color: 'indigo' },
        { label: 'Study Volume', value: profile?.stats?.study_hours || '0h', icon: <Clock size={20} />, color: 'amber' },
        { label: 'Avg Mastery', value: `${profile?.stats?.average_mastery || 0}%`, icon: <TrendingUp size={20} />, color: 'emerald' },
        { label: 'Quizzes Done', value: profile?.stats?.total_quizzes || '0', icon: <Target size={20} />, color: 'rose' },
    ];

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-10">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        Welcome back, <span className="text-gradient">Scholar</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time synchronization with your knowledge base is ACTIVE.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="interactive-pill flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400 fill-current" />
                        <span className="text-sm font-bold text-slate-700">
                            {profile?.weak_topics?.length > 0
                                ? `Focus Target: ${profile.weak_topics[0]}`
                                : 'Mastery Trend: Positive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-[2rem] flex items-center gap-5"
                    >
                        <div className={`p-4 bg-slate-100 rounded-2xl text-slate-600 transition-colors`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-2xl font-display font-black text-slate-800">{s.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Progress Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart */}
                    <div className="glass-card p-8 rounded-[2.5rem]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-display font-black text-slate-900">Cognitive Growth Trend</h3>
                                <p className="text-sm text-slate-400 font-medium tracking-tight">Data-driven insight into your retention curve</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-emerald-500 w-4 h-4" />
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={profile?.progress_history || []}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4F46E5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Topic Mastery Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile?.topic_details?.length > 0 ? (
                            profile.topic_details.map((topic, i) => (
                                <div key={i} className="glass-card p-6 rounded-[2.5rem] flex items-center justify-between group">
                                    <div className="max-w-[140px]">
                                        <h4 className="text-lg font-display font-black text-slate-800 truncate" title={topic.name}>
                                            {topic.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Indexed Topic</p>
                                        <button className="mt-4 flex items-center gap-2 text-primary font-black text-xs hover:gap-3 transition-all">
                                            Practice <ArrowRight size={14} />
                                        </button>
                                    </div>
                                    <ProgressCircle percentage={topic.mastery} color={i % 2 === 0 ? "indigo-600" : "violet-600"} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 p-12 text-center glass-card rounded-[2.5rem] border-dashed">
                                <p className="text-slate-400 font-bold italic">Upload materials or take quizzes to see topic mastery.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Alerts / Tasks */}
                <div className="space-y-8">
                    {/* Weak Topic Alerts */}
                    <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-900/5 border-indigo-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-500/10 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Weak Areas</h3>
                        </div>
                        <div className="space-y-4">
                            {profile?.weak_topics?.length > 0 ? (
                                profile.weak_topics.map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all cursor-pointer">
                                        <span className="text-sm font-bold text-slate-700">{topic}</span>
                                        <Zap size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 font-bold text-center py-4">No weak topics detected. Great job!</p>
                            )}
                        </div>
                        {profile?.weak_topics?.length > 0 && (
                            <button className="w-full mt-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
                                Start Remedial Drill
                            </button>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-display font-black text-slate-900 mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {profile?.recent_activity?.length > 0 ? (
                                profile.recent_activity.map((task, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <div className="w-0.5 flex-1 bg-slate-100 rounded-full last:bg-transparent" />
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-black text-slate-800">{task.topic}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.date}</span>
                                                <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md">{task.score}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 font-bold text-center py-4">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
