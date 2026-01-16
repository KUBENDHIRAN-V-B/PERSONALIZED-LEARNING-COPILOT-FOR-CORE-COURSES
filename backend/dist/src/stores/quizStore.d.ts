export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export interface QuizQuestion {
    id: string;
    topicKey: string;
    difficulty: QuizDifficulty;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}
export interface QuizQuestionPublic {
    id: string;
    topic: string;
    difficulty: QuizDifficulty;
    question: string;
    options: string[];
}
export interface QuizAttemptItem {
    questionId: string;
    difficulty: QuizDifficulty;
    selectedIndex: number;
    correct: boolean;
    correctIndex: number;
    explanation: string;
}
export interface QuizSession {
    id: string;
    userId: string;
    courseId: string;
    topic: string;
    topicKey: string;
    targetCount: number;
    baseDifficulty: QuizDifficulty;
    currentDifficulty: QuizDifficulty;
    createdAt: Date;
    currentIndex: number;
    askedQuestionIds: Set<string>;
    items: QuizAttemptItem[];
    completed: boolean;
    useAI?: boolean;
}
export interface QuizHistoryEntry {
    id: string;
    userId: string;
    courseId: string;
    topic: string;
    topicKey: string;
    baseDifficulty: QuizDifficulty;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    createdAt: Date;
}
export declare const toPublicQuestion: (q: QuizQuestion, topic: string) => QuizQuestionPublic;
export declare const createQuizSession: (params: {
    userId: string;
    courseId: string;
    topic: string;
    baseDifficulty: QuizDifficulty;
    questionCount: number;
    useAI?: boolean;
}) => {
    session: QuizSession;
    firstQuestion: QuizQuestionPublic;
};
export declare const getQuizSession: (sessionId: string) => QuizSession;
export declare const submitAnswerAndAdvance: (params: {
    sessionId: string;
    userId: string;
    questionId: string;
    selectedIndex: number;
}) => {
    correct: boolean;
    correctIndex: number;
    explanation: string;
    nextQuestion: QuizQuestionPublic | null;
    progress: {
        current: number;
        total: number;
    };
    updatedDifficulty: QuizDifficulty;
};
export declare const finalizeQuiz: (params: {
    sessionId: string;
    userId: string;
    timeSpentSeconds: number;
}) => {
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    items: QuizAttemptItem[];
    updatedMastery: {
        topicKey: string;
        newMastery: number;
        delta: number;
    };
    historyEntry: QuizHistoryEntry;
};
export declare const getQuizHistory: (userId: string) => QuizHistoryEntry[];
//# sourceMappingURL=quizStore.d.ts.map