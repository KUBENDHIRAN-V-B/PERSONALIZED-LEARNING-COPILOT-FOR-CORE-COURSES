import React, { useState } from 'react';
import axios from 'axios';
import {
    HelpCircle,
    Check,
    X,
    ArrowRight,
    Award,
    AlertCircle,
    BrainCircuit,
    ChevronDown,
    Zap,
    Trophy,
    Sparkles,
    Cpu,
    TrendingUp,
    MessageSquareText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OptionButton = ({ option, isSelected, isCorrect, showResult, onClick }) => {
    let bg = "bg-white hover:border-primary/30";
    let border = "border-slate-200";
    let text = "text-slate-700";
    let icon = null;

    if (showResult) {
        if (isCorrect) {
            bg = "bg-emerald-50"; border = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"; text = "text-emerald-900";
            icon = <div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div>;
        } else if (isSelected) {
            bg = "bg-rose-50"; border = "border-rose-500"; text = "text-rose-900";
            icon = <div className="p-1 bg-rose-500 rounded-full"><X size={12} className="text-white" /></div>;
        } else {
            bg = "bg-slate-50 opacity-40"; border = "border-slate-100";
        }
    } else if (isSelected) {
        bg = "bg-indigo-50"; border = "border-primary shadow-[0_0_15px_rgba(79,70,229,0.1)]"; text = "text-primary";
    }

    return (
        <motion.button
            whileHover={!showResult ? { x: 5 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={showResult}
            className={`p-6 rounded-[2rem] text-left font-display font-black tracking-tight border-2 transition-all duration-300 flex items-center justify-between ${bg} ${border} ${text}`}
        >
            <span>{option}</span>
            {icon}
        </motion.button>
    );
};

const Quiz = () => {
    // Setup
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(false);

    // Quiz State
    const [quizData, setQuizData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [shortAnswer, setShortAnswer] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [resultData, setResultData] = useState(null);

    const generateQuiz = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/quiz', { topic, difficulty });
            setQuizData(res.data);
            setCurrentIndex(0);
            setScore(0);
            setAnswers({});
            setShortAnswer('');
            setShowExplanation(false);
            setResultData(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMCQSelect = (option) => {
        if (showExplanation) return;
        const currentQ = quizData.questions[currentIndex];
        const isCorrect = option === currentQ.correct_answer;
        setAnswers({ ...answers, [currentIndex]: option });
        if (isCorrect) setScore(s => s + 1);
        setShowExplanation(true);
    };

    const [validationFeedback, setValidationFeedback] = useState(null);
    const [validating, setValidating] = useState(false);

    const handleShortAnswerSubmit = async () => {
        if (!shortAnswer.trim() || validating) return;

        const currentQ = quizData.questions[currentIndex];
        setValidating(true);
        setValidationFeedback(null);

        try {
            const res = await axios.post('http://127.0.0.1:8000/validate-answer', {
                question: currentQ.question,
                correct_answer: currentQ.correct_answer,
                student_answer: shortAnswer
            });

            setAnswers({ ...answers, [currentIndex]: shortAnswer });
            setValidationFeedback(res.data);

            // Add score based on AI evaluation
            if (res.data.score) {
                setScore(s => s + res.data.score);
            }

            setShowExplanation(true);
        } catch (error) {
            console.error('Validation error:', error);
            // Fallback: just show explanation without validation
            setAnswers({ ...answers, [currentIndex]: shortAnswer });
            setShowExplanation(true);
        } finally {
            setValidating(false);
        }
    };

    const handleNext = async () => {
        if (currentIndex < quizData.questions.length - 1) {
            setCurrentIndex(p => p + 1);
            setShowExplanation(false);
            setShortAnswer('');
            setValidationFeedback(null);
        } else {
            await submitResults();
        }
    };

    const submitResults = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/submit', {
                topic_name: quizData.topic || topic,
                score: score,
                total_questions: quizData.questions.length,
                difficulty: difficulty
            });
            setResultData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const currentQ = quizData?.questions[currentIndex];

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        Conceptual <span className="text-gradient">Pressure Test</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Adaptive testing to identify and bridge your knowledge gaps.</p>
                </div>
                {!quizData && (
                    <div className="interactive-pill flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" />
                        <span className="text-sm font-bold text-slate-700">Earn Mastery Points</span>
                    </div>
                )}
            </div>

            {!quizData && !resultData ? (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col items-center mb-10 text-center">
                            <div className="p-4 bg-violet-500/10 rounded-2xl mb-6">
                                <BrainCircuit size={32} className="text-violet-600" />
                            </div>
                            <h2 className="text-2xl font-display font-black text-slate-900 leading-tight">Initialize Evaluation</h2>
                            <p className="text-slate-500 font-medium mt-1">Target a specific topic for adaptive drilling.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Topic</p>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Engineering Basics"
                                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.2rem] focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all font-display text-lg font-black tracking-tight"
                                    />
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none group-hover:text-violet-400 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cognitive Load / Difficulty</p>
                                <div className="flex gap-4">
                                    {['easy', 'medium', 'hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`flex-1 py-5 rounded-2xl font-display font-black capitalize border-2 transition-all duration-300 tracking-tight
                                                ${difficulty === d
                                                    ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-200 scale-105'
                                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateQuiz}
                                disabled={loading || !topic}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] text-lg font-black hover:bg-slate-800 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Generating Conceptual Drill...
                                    </>
                                ) : (
                                    <>
                                        Start Intelligence Test <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : resultData ? (
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-12 rounded-[3.5rem] text-center shadow-3xl border-slate-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/5 to-transparent -z-10" />

                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 rotate-3">
                            <Award className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-4xl font-display font-black text-slate-900 mb-2">Drill Complete!</h2>
                        <p className="text-slate-500 font-medium mb-10 tracking-tight">Your conceptual mastery has been synchronized.</p>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Raw Performance</p>
                                <p className="text-4xl font-display font-black text-slate-800">{score}<span className="text-slate-300">/</span>{quizData.questions.length}</p>
                            </div>
                            <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center justify-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Mastery Gain</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-emerald-500 w-6 h-6" />
                                    <span className="text-4xl font-display font-black text-emerald-700">+{resultData.delta}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Trophy size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Topic Status</p>
                                    <p className="text-lg font-black text-white">{resultData.status || 'Expert'}</p>
                                </div>
                            </div>
                            <div className="pr-4">
                                <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-pulse" />
                                    <span className="text-[10px] font-black">{resultData.new_mastery}%</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setQuizData(null); setResultData(null); }}
                            className="w-full py-6 bg-slate-100 text-slate-800 rounded-[2rem] text-lg font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                        >
                            Return to Selection <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* Progress Header */}
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <span className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                Topic: {topic}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentIndex + 1} <span className="text-slate-200">of</span> {quizData.questions.length}</span>
                            <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentIndex + 1) / quizData.questions.length) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-12 rounded-[3.5rem] shadow-2xl bg-white border-slate-100 flex flex-col min-h-[500px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-50 rounded-lg text-primary">
                                    {currentQ.type === 'multiple_choice' ? <Zap size={18} /> : <MessageSquareText size={18} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {currentQ.type === 'multiple_choice' ? 'Analytical Selection' : 'Strategic Exposition'}
                                </span>
                            </div>

                            <h3 className="text-3xl font-display font-black text-slate-900 mb-12 leading-tight tracking-tight">
                                {currentQ.question}
                            </h3>

                            {currentQ.type === 'multiple_choice' ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQ.options?.map((option, idx) => (
                                        <OptionButton
                                            key={idx}
                                            option={option}
                                            isSelected={answers[currentIndex] === option}
                                            isCorrect={option === currentQ.correct_answer}
                                            showResult={showExplanation}
                                            onClick={() => handleMCQSelect(option)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <textarea
                                        value={shortAnswer}
                                        onChange={(e) => setShortAnswer(e.target.value)}
                                        disabled={showExplanation || validating}
                                        placeholder="Type your strategic response here detailing the engineering core principles..."
                                        className="w-full h-48 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-lg leading-relaxed shadow-inner resize-none"
                                    />
                                    {!showExplanation && (
                                        <button
                                            onClick={handleShortAnswerSubmit}
                                            disabled={!shortAnswer.trim() || validating}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {validating ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    AI is Evaluating...
                                                </>
                                            ) : (
                                                'Lock Strategic Response'
                                            )}
                                        </button>
                                    )}

                                    {/* AI Validation Feedback */}
                                    {validationFeedback && showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-6 rounded-2xl border-2 ${validationFeedback.is_correct
                                                    ? 'bg-emerald-50 border-emerald-500'
                                                    : validationFeedback.score >= 0.5
                                                        ? 'bg-amber-50 border-amber-500'
                                                        : 'bg-rose-50 border-rose-500'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                {validationFeedback.is_correct ? (
                                                    <div className="p-2 bg-emerald-500 rounded-full">
                                                        <Check size={16} className="text-white" />
                                                    </div>
                                                ) : validationFeedback.score >= 0.5 ? (
                                                    <div className="p-2 bg-amber-500 rounded-full">
                                                        <AlertCircle size={16} className="text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-rose-500 rounded-full">
                                                        <X size={16} className="text-white" />
                                                    </div>
                                                )}
                                                <span className={`font-black text-lg ${validationFeedback.is_correct
                                                        ? 'text-emerald-800'
                                                        : validationFeedback.score >= 0.5
                                                            ? 'text-amber-800'
                                                            : 'text-rose-800'
                                                    }`}>
                                                    {validationFeedback.is_correct
                                                        ? 'Correct!'
                                                        : validationFeedback.score >= 0.5
                                                            ? 'Partially Correct'
                                                            : 'Incorrect'}
                                                </span>
                                                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-black ${validationFeedback.is_correct
                                                        ? 'bg-emerald-200 text-emerald-800'
                                                        : validationFeedback.score >= 0.5
                                                            ? 'bg-amber-200 text-amber-800'
                                                            : 'bg-rose-200 text-rose-800'
                                                    }`}>
                                                    +{validationFeedback.score} pts
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">{validationFeedback.feedback}</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-12 p-8 bg-indigo-50/50 border border-primary/10 rounded-[2.5rem] relative group"
                                >
                                    <div className="absolute -top-4 left-8 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        Intelligence Reveal
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm self-start">
                                            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-display font-black text-indigo-900 mb-2 leading-tight">Professional Insight & Model Answer</p>
                                            {currentQ.type === 'short_answer' && (
                                                <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Model Answer:</p>
                                                    <p className="text-sm font-bold text-emerald-900">{currentQ.correct_answer}</p>
                                                </div>
                                            )}
                                            <p className="text-slate-600 font-medium text-[15px] leading-relaxed italic">"{currentQ.explanation}"</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-12 flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!showExplanation}
                                className="px-10 py-5 bg-primary text-white rounded-[2rem] font-display font-black text-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all shadow-xl shadow-primary/30"
                            >
                                {currentIndex === quizData.questions.length - 1 ? 'Finalize Test' : 'Next Conceptual Drill'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quiz;
