import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    BookOpen,
    Calendar,
    Target,
    ShieldCheck,
    ArrowRight,
    BrainCircuit,
    Zap,
    Cpu
} from 'lucide-react';

const Landing = () => {
    return (
        <div className="bg-[#F8FAFC] min-h-screen selection:bg-primary/20">
            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary rounded-xl rotate-3">
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display text-xl font-black tracking-tight text-slate-800">
                        EduCopilot<span className="text-primary">.ai</span>
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/chat" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Tutor</Link>
                    <Link to="/plan" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Planner</Link>
                    <Link to="/upload" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-32 px-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-40 right-40 w-64 h-64 bg-violet-400/10 rounded-full blur-[80px] -z-10" />

                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            Next-Gen Intelligence for Engineering
                        </div>
                        <h1 className="text-7xl font-display font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                            Your AI Study Mentor for <br />
                            <span className="text-gradient">Tough Engineering Subjects</span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                            Personalized Learning Copilot that turns complex engineering concepts into mastery. Upload your materials and get AI-powered doubt solving, strategic roadmaps, and adaptive quizzes.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Link to="/upload" className="px-8 py-5 bg-primary text-white rounded-2xl text-lg font-black shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                Upload & Generate Plan <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/chat" className="px-8 py-5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                                Try AI Tutor
                            </Link>
                        </div>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-20 relative p-4 bg-white/40 backdrop-blur-sm border border-white/60 rounded-[3rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.1)]"
                    >
                        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm aspect-video">
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center relative group">
                                <BrainCircuit className="w-24 h-24 text-slate-200 transition-transform group-hover:scale-110 duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                            </div>
                        </div>
                        {/* Decorative UI elements */}
                        <div className="absolute -left-12 top-1/4 p-6 glass-card rounded-[2rem] max-w-[240px] shadow-2xl animate-bounce-slow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <Target className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-xs font-black text-slate-800 tracking-tight">Mastery Reached</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="w-[85%] h-full bg-emerald-500 rounded-full" />
                            </div>
                            <p className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-widest text-center">Core Engineering: 88%</p>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-32 px-10 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-display font-black text-slate-900 mb-4">Master Every Engineering Concept</h2>
                        <p className="text-slate-500 font-medium">Built by engineers, for the next generation of problem solvers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-indigo-600" />,
                                title: "Instant Solves",
                                desc: "RAG-powered AI that cites your exact textbook pages for every answer.",
                                color: "indigo"
                            },
                            {
                                icon: <Calendar className="w-6 h-6 text-violet-600" />,
                                title: "Strategic Roadmap",
                                desc: "AI calculates study load based on your exam date and daily hours.",
                                color: "violet"
                            },
                            {
                                icon: <Target className="w-6 h-6 text-rose-600" />,
                                title: "Adaptive Quizzes",
                                desc: "Proprietary testing engine that identifies your conceptual gaps.",
                                color: "rose"
                            },
                            {
                                icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                                title: "Mastery Tracking",
                                desc: "Duolingo-style tracking of every engineered topic in your syllabus.",
                                color: "emerald"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl group"
                            >
                                <div className={`p-4 bg-white rounded-2xl w-fit mb-8 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 px-10">
                <div className="max-w-5xl mx-auto p-16 premium-gradient rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-display font-black mb-6">Start Your Mastery Journey Today</h2>
                        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">
                            Don't study harder. Study smarter with your AI engineering copilot.
                        </p>
                        <Link to="/upload" className="px-10 py-5 bg-white text-primary rounded-2xl text-lg font-black hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3">
                            Launch Intelligence Engine <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
