import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_BASE_URL from '../config/api';
import {
    Send,
    Bot,
    User,
    FileText,
    ChevronRight,
    Trash2,
    Sparkles,
    Cpu,
    ArrowUpCircle,
    BrainCircuit,
    Info,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/chat`, { message: input });
            const botMsg = {
                role: 'assistant',
                content: res.data.answer,
                sources: res.data.sources
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ I encountered an error while processing your request. Please ensure the backend is running."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-10 relative z-10 scrollbar-hide">
                <div className="max-w-4xl mx-auto space-y-10">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 relative"
                            >
                                <div className="absolute -top-3 -right-3 p-2 bg-amber-400 rounded-xl shadow-lg animate-bounce">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <Cpu className="w-16 h-16 text-primary" />
                            </motion.div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-display font-black text-slate-800 tracking-tight">Intelligence Engine Active</h2>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto">Upload your engineering materials and I'll help you solve the toughest conceptual problems with direct citations.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                                {[
                                    "Summarize the main principles in my notes.",
                                    "What are the key formulas I should memorize?",
                                    "Explain the most difficult concept in these documents.",
                                    "Create a study summary for Chapter 1."
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(q)}
                                        className="p-5 text-sm font-black text-slate-600 bg-white border border-slate-100 rounded-[1.5rem] hover:border-primary/30 hover:shadow-lg transition-all text-left group flex items-center justify-between"
                                    >
                                        <span className="line-clamp-1">{q}</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-6 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`shrink-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg
                                    ${msg.role === 'user'
                                        ? 'bg-slate-900 text-white shadow-slate-200'
                                        : 'bg-white border border-slate-100 text-primary shadow-primary/5'}
                                `}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className={`space-y-4 pt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`p-8 rounded-[2rem] shadow-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none prose-slate max-w-none shadow-xl shadow-slate-200/50'
                                        }`}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h3: ({ node, ...props }) => <h3 className="text-xl font-display font-black text-slate-900 mt-6 mb-4 border-b border-slate-200 pb-2" {...props} />,
                                                h4: ({ node, ...props }) => <h4 className="text-lg font-display font-black text-slate-800 mt-4 mb-2" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-[16px] font-medium leading-[1.8] mb-4" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 mb-4" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-6 space-y-2 mb-4" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-[15px] font-medium" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-black text-slate-900 bg-primary/5 px-1.5 py-0.5 rounded shadow-sm border-b-2 border-primary/20" {...props} />,
                                                // Tables
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
                                                        <table className="w-full text-sm" {...props} />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => <thead className="bg-slate-800 text-white" {...props} />,
                                                tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-200" {...props} />,
                                                tr: ({ node, ...props }) => <tr className="hover:bg-slate-50 transition-colors even:bg-slate-50/50" {...props} />,
                                                th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider" {...props} />,
                                                td: ({ node, ...props }) => <td className="px-4 py-3 font-medium" {...props} />,
                                                // Code blocks
                                                pre: ({ node, ...props }) => (
                                                    <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl my-6 overflow-x-auto shadow-lg border border-slate-700" {...props} />
                                                ),
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    if (inline) {
                                                        return <code className="bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-sm font-bold text-primary" {...props}>{children}</code>;
                                                    }
                                                    return (
                                                        <code className="block font-mono text-sm leading-relaxed" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                // Horizontal rule
                                                hr: ({ node, ...props }) => <hr className="my-6 border-slate-200" {...props} />,
                                                // Blockquote
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic rounded-r-lg" {...props} />
                                                ),
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {msg.sources.map((src, idx) => (
                                                <div key={idx} className="interactive-pill flex items-center gap-2 group cursor-help py-1.5">
                                                    <div className="p-1 bg-primary/10 rounded-lg">
                                                        <FileText size={12} className="text-primary" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-600 truncate max-w-[140px]">
                                                        {src.metadata?.source || `Source ${idx + 1}`}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="px-3 py-1.5 bg-emerald-500/10 rounded-full flex items-center gap-2 border border-emerald-500/20">
                                                <Search size={12} className="text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Grounding Search Active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-6 max-w-[80%]">
                                <div className="shrink-0 w-12 h-12 rounded-[1.25rem] bg-white border border-slate-100 text-primary flex items-center justify-center animate-pulse shadow-sm">
                                    <Bot size={20} />
                                </div>
                                <div className="p-8 bg-white border border-slate-100 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Synthesizing Explanation</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Sticky Input */}
            <div className="p-8 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent relative z-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative glass-card p-2 rounded-[2.5rem] shadow-2xl shadow-primary/10 group focus-within:border-primary/50 transition-all duration-500 bg-white/90">
                        <div className="flex items-center">
                            <div className="p-4 text-slate-300 group-focus-within:text-primary transition-colors">
                                <BrainCircuit size={24} />
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Engineering Inquiry... (e.g. Explain the main concept in Chapter 2)"
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 font-display font-medium text-lg px-2 placeholder:text-slate-300"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <button className="p-4 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                                    <Info size={20} />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="p-4 bg-slate-900 text-white rounded-[1.75rem] hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 group/btn active:scale-95"
                                >
                                    <ArrowUpCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            LLM Consensus: 98%
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Sources: 4 Indexed
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={12} /> Clear Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
