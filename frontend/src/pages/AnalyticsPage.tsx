import React, { useEffect, useState, useCallback, memo, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiClock, FiTarget, FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { analyticsAPI } from '../services/api';

interface Analytics {
  thisWeek: {
    sessions: number;
    hours: number;
    accuracy: number;
    conceptsMastered: number;
  };
  thisMonth: {
    totalTime: number;
    improvement: number;
    fastestLearning: string;
  };
  recommendations: string[];
}

// Skeleton loader component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Debounced chart wrapper to prevent ResizeObserver loops
const DebouncedChart: React.FC<{ children: React.ReactNode; delay?: number }> = memo(({ children, delay = 100 }) => {
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setIsReady(true), delay);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  if (!isReady) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <>{children}</>;
});

const AnalyticsPage: React.FC = memo(() => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        const data = await analyticsAPI.getDashboard();
        if (mounted) setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  const goBack = useCallback(() => navigate('/dashboard'), [navigate]);

  const chartData = useMemo(() => [
    { name: 'Mon', accuracy: 75, sessions: 2 },
    { name: 'Tue', accuracy: 78, sessions: 3 },
    { name: 'Wed', accuracy: 82, sessions: 2 },
    { name: 'Thu', accuracy: 80, sessions: 4 },
    { name: 'Fri', accuracy: 85, sessions: 3 },
    { name: 'Sat', accuracy: 88, sessions: 5 },
    { name: 'Sun', accuracy: 90, sessions: 4 },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Monthly Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-green-500" /> This Month's Progress
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiClock className="text-blue-600 text-xl" />
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Total Time</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.thisMonth.totalTime || 0}h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="text-green-600 text-xl" />
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Improvement</div>
                  <div className="text-2xl font-bold text-green-600">
                    +{analytics?.thisMonth.improvement || 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiTarget className="text-purple-600 text-xl" />
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Fastest Learning</div>
                  <div className="text-lg font-bold text-purple-600">
                    {analytics?.thisMonth.fastestLearning || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Chart */}
          <div className="bg-white rounded-lg shadow p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold mb-4">Weekly Accuracy Trend</h2>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <DebouncedChart>
                <div key="accuracy-chart" style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={[60, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorAccuracy)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </DebouncedChart>
            )}
          </div>

          {/* Sessions Chart */}
          <div className="bg-white rounded-lg shadow p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold mb-4">Daily Sessions</h2>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <DebouncedChart delay={200}>
                <div key="sessions-chart" style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="sessions" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DebouncedChart>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiZap className="text-yellow-500" /> Personalized Recommendations
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
            <ul className="space-y-3">
              {analytics?.recommendations.map((rec, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 animate-fade-in p-3 bg-gray-50 rounded-lg" 
                  style={{ animationDelay: `${400 + idx * 100}ms` }}
                >
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
});

export default AnalyticsPage;
