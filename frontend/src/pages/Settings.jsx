import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
    Settings as SettingsIcon,
    Moon,
    Sun,
    Clock,
    Calendar,
    Database,
    ShieldAlert,
    Cpu,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingGroup = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">{title}</h3>
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-slate-100">
            {children}
        </div>
    </div>
);

const SettingRow = ({ icon, label, value, type = "toggle", onClick }) => {
    const [isOn, setIsOn] = useState(true);

    return (
        <div className="flex items-center justify-between p-8 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    {icon}
                </div>
                <div>
                    <h4 className="text-[15px] font-black text-slate-800 tracking-tight">{label}</h4>
                    <p className="text-xs text-slate-400 font-medium">Manage your {label.toLowerCase()} preferences.</p>
                </div>
            </div>
            <div>
                {type === "toggle" ? (
                    <button
                        onClick={() => setIsOn(!isOn)}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isOn ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'left-7' : 'left-1'}`} />
                    </button>
                ) : (
                    <div className="flex items-center gap-3 text-sm font-black text-slate-400 hover:text-slate-800 cursor-pointer">
                        <span>{value}</span>
                        <ChevronRight size={16} />
                    </div>
                )}
            </div>
        </div>
    );
};

const Settings = () => {
    const [hours, setHours] = useState(4);
    const [loading, setLoading] = useState(false);

    const handlePurge = async () => {
        if (!window.confirm("CRITICAL ACTION: This will permanently delete ALL uploaded materials and reset the AI memory. Do you wish to proceed?")) return;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/reset-system`);
            alert("System reset successful. All background data cleared.");
            window.location.href = '/dashboard';
        } catch (err) {
            console.error(err);
            alert("Error resetting system. Please ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        System <span className="text-gradient">Configuration</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Fine-tune your cognitive environment and model parameters.</p>
                </div>
            </div>

            <div className="space-y-10">
                <SettingGroup title="Study Preferences">
                    <div className="p-8 border-b border-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black text-slate-800 tracking-tight">Daily Study Hours</h4>
                                    <p className="text-xs text-slate-400 font-medium">Set your target commitment for AI roadmap generation.</p>
                                </div>
                            </div>
                            <span className="text-2xl font-display font-black text-primary">{hours}h</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                    <SettingRow icon={<Calendar size={20} />} label="Semester Goal" value="Final Exams" type="select" />
                    <SettingRow icon={<Sun size={20} />} label="Appearance" value="Modern Light" type="select" />
                </SettingGroup>

                <SettingGroup title="Intelligence Engine">
                    <SettingRow icon={<Cpu size={20} />} label="Core Model" value="Claude 3.5 Sonnet" type="select" />
                    <SettingRow icon={<Database size={20} />} label="RAG Depth" value="High Precision" type="select" />
                    <SettingRow icon={<Sparkles size={20} />} label="Suggestive Mode" type="toggle" />
                </SettingGroup>

                <SettingGroup title="Privacy & Security">
                    <SettingRow icon={<ShieldAlert size={20} />} label="Encrypted Materials" type="toggle" />
                    <div className="p-10 text-center">
                        <p className="text-xs text-slate-400 font-medium mb-6">EduCopilot uses OpenRouter for model inference. All uploads are stored locally in your workspace.</p>
                        <button
                            onClick={handlePurge}
                            disabled={loading}
                            className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-50"
                        >
                            {loading ? "Wiping Data..." : "Purge All Synchronization Data"}
                        </button>
                    </div>
                </SettingGroup>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
                <div className="flex items-center gap-4">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                    <div>
                        <p className="text-lg font-black tracking-tight">Configuration Synchronized</p>
                        <p className="text-xs text-slate-400 font-medium">Settings are applied to all AI sub-agents.</p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    Save Changes <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Settings;
