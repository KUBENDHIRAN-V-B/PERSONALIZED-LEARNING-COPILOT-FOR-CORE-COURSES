export interface StudySession {
    id: string;
    userId: string;
    courseId: string;
    topic: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    accuracy?: number;
    focusScore?: number;
}
export interface TopicMastery {
    topic: string;
    mastery: number;
    sessionsCount: number;
    lastStudied: Date;
}
export interface UserPreferences {
    peakFocusTime: {
        startHour: number;
        endHour: number;
    } | null;
    optimalDuration: number | null;
    masteryGoals: {
        [topic: string]: number;
    };
}
export interface AnalyticsSession {
    userId: string;
    courseId: string;
    duration: number;
    conceptsCovered: string[];
    accuracy: number;
    timestamp: Date;
}
export declare const normalizeTopicKey: (topic: string) => string;
export declare const getUserSessions: (userId: string) => StudySession[];
export declare const getUserMastery: (userId: string) => Map<string, TopicMastery>;
export declare const getUserPreferences: (userId: string) => UserPreferences;
export declare const setUserPreferences: (userId: string, prefs: UserPreferences) => Map<string, UserPreferences>;
export declare const getActiveTimer: (userId: string) => {
    startTime: Date;
    topic: string;
    courseId: string;
};
export declare const setActiveTimer: (userId: string, timer: {
    startTime: Date;
    topic: string;
    courseId: string;
}) => Map<string, {
    startTime: Date;
    topic: string;
    courseId: string;
}>;
export declare const clearActiveTimer: (userId: string) => boolean;
export declare const addAnalyticsSession: (s: AnalyticsSession) => number;
export declare const getAnalyticsData: () => AnalyticsSession[];
export declare const updateTopicMastery: (userId: string, topic: string, delta: number) => TopicMastery;
//# sourceMappingURL=analyticsStore.d.ts.map