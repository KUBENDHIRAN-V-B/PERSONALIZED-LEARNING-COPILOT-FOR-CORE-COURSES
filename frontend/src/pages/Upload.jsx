import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    UploadCloud,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    BookOpen,
    Layers,
    History,
    X,
    Cpu,
    ShieldCheck,
    ArrowRight,
    Eye,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadSlot = ({ icon, title, label, onUpload, status, fileName }) => (
    <div className={`p-8 rounded-[2.5rem] bg-white border-2 border-dashed transition-all duration-300 relative group
        ${status === 'success' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
    `}>
        <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onUpload(e.target.files[0])}
            disabled={status === 'uploading'}
        />
        <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-3
                ${status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}
            `}>
                {status === 'success' ? <CheckCircle className="w-6 h-6" /> : icon}
            </div>
            <h4 className="text-lg font-display font-black text-slate-800 line-clamp-1 px-4">{fileName || title}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
        {status === 'success' && (
            <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest">
                <ShieldCheck size={12} /> Indexed
            </div>
        )}
    </div>
);

const UploadPage = () => {
    const [uploadStates, setUploadStates] = useState({
        syllabus: { status: 'idle', file: null },
        textbook: { status: 'idle', file: null },
        slides: { status: 'idle', file: null },
        pyqs: { status: 'idle', file: null }
    });
    const [documents, setDocuments] = useState([]);
    const [overallStatus, setOverallStatus] = useState(null);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/files');
            setDocuments(res.data);
        } catch (e) {
            console.error("Error fetching documents:", e);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (type, file) => {
        if (!file) return;

        setUploadStates(prev => ({ ...prev, [type]: { status: 'uploading', file: file.name } }));
        setOverallStatus('uploading');

        const formData = new FormData();
        formData.append('files', file);

        try {
            await axios.post('http://127.0.0.1:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStates(prev => ({ ...prev, [type]: { status: 'success', file: file.name } }));
            setOverallStatus('success');
            fetchDocuments(); // Refresh list after upload
        } catch (error) {
            console.error(error);
            setUploadStates(prev => ({ ...prev, [type]: { status: 'error', file: null } }));
            setOverallStatus('error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document? This will remove it from the knowledge base.")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/files/${id}`);
            setDocuments(docs => docs.filter(doc => doc.id !== id));
            alert("Document deleted successfully.");
        } catch (e) {
            console.error("Error deleting document:", e);
            alert("Failed to delete document. Check console for details.");
        }
    };

    const handleView = (id) => {
        window.open(`http://127.0.0.1:8000/files/${id}`, '_blank');
    };

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        Knowledge <span className="text-gradient">Ingestion</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Upload your engineering materials to synchronize your AI tutor.</p>
                </div>
                <div className="flex gap-3">
                    <div className="interactive-pill flex items-center gap-2">
                        <Cpu size={16} className="text-primary" />
                        <span className="text-sm font-bold text-slate-700">Auto-Tagging Active</span>
                    </div>
                </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <UploadSlot
                    icon={<FileText size={24} />}
                    title="Course Syllabus"
                    label="Curriculum & Objectives"
                    onUpload={(f) => handleUpload('syllabus', f)}
                    status={uploadStates.syllabus.status}
                    fileName={uploadStates.syllabus.file}
                />
                <UploadSlot
                    icon={<BookOpen size={24} />}
                    title="Textbook"
                    label="Core Reference Material"
                    onUpload={(f) => handleUpload('textbook', f)}
                    status={uploadStates.textbook.status}
                    fileName={uploadStates.textbook.file}
                />
                <UploadSlot
                    icon={<Layers size={24} />}
                    title="Lecture Slides"
                    label="Instructor Notes"
                    onUpload={(f) => handleUpload('slides', f)}
                    status={uploadStates.slides.status}
                    fileName={uploadStates.slides.file}
                />
                <UploadSlot
                    icon={<History size={24} />}
                    title="Prev Papers"
                    label="Previous Year Questions"
                    onUpload={(f) => handleUpload('pyqs', f)}
                    status={uploadStates.pyqs.status}
                    fileName={uploadStates.pyqs.file}
                />
            </div>

            {/* Bottom Panel */}
            <div className="glass-card p-10 rounded-[3rem] text-center border-dashed border-2 border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <UploadCloud className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 mb-2">Massive Ingestion</h3>
                    <p className="text-slate-500 max-w-sm mb-8 font-medium">Or simply drop your entire course folder here. We'll handle the categorization automatically using LLM-vision.</p>

                    <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-lg font-black hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95">
                        {overallStatus === 'uploading' ? (
                            <>
                                <Loader2 size={24} className="animate-spin" /> Sychnronizing AI...
                            </>
                        ) : (
                            <>
                                Browse All Files <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Recent Uploads */}
            <div className="space-y-6">
                <h3 className="text-xl font-display font-black text-slate-900 ml-4">Recently Synchronized</h3>
                <div className="space-y-4">
                    {documents.length === 0 ? (
                        <div className="p-10 text-center glass-card rounded-[2rem] border-dashed">
                            <p className="text-slate-400 font-bold italic">No materials indexed yet.</p>
                        </div>
                    ) : (
                        documents.map((doc, i) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 rounded-[2rem] flex items-center justify-between hover:border-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-700">{doc.filename}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.file_type} • Sync Data Path Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleView(doc.id)}
                                        className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2 group/btn"
                                    >
                                        <Eye size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Preview</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 group/btn"
                                    >
                                        <Trash2 size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Delete</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {overallStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-emerald-500 text-white rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] font-black flex items-center gap-3 border border-emerald-400"
                    >
                        <CheckCircle size={24} />
                        Intelligence Synchronized Successfully
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadPage;
