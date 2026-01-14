import React, { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiZap, FiBarChart2 } from 'react-icons/fi';
import { PersonalizedInsights } from '../components/PersonalizedInsights';

const DashboardPage: React.FC = memo(() => {
  const navigate = useNavigate();

  const navigateTo = useCallback((path: string) => () => navigate(path), [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Learning Copilot" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">Learning Copilot</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-blue-100 text-lg">
              Continue your learning journey and master core CS and ECE concepts
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            onClick={navigateTo('/courses')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all group border-l-4 border-blue-500"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <FiBook className="text-2xl text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Explore Courses</h3>
            <p className="text-sm text-gray-600">Browse 35+ courses</p>
          </div>
          <div
            onClick={navigateTo('/quiz')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all group border-l-4 border-purple-500"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
              <FiBarChart2 className="text-2xl text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Custom Quiz</h3>
            <p className="text-sm text-gray-600">Test your knowledge</p>
          </div>
          <div
            onClick={navigateTo('/settings')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all group border-l-4 border-gray-500"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-gray-600 transition-colors">
              <FiZap className="text-2xl text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">API Settings</h3>
            <p className="text-sm text-gray-600">Update API keys</p>
          </div>
        </div>

        {/* Personalized Insights */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiZap className="text-yellow-500" /> Your Personalized Insights
          </h3>
          <PersonalizedInsights />
        </div>

        {/* Learning Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Learning Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Study during your peak focus hours for better retention</li>
            <li>✓ Use the timer to track focused study sessions</li>
            <li>✓ Ask the AI tutor specific questions about topics</li>
            <li>✓ Review weak topics regularly to improve mastery</li>
          </ul>
        </div>
      </main>
    </div>
  );
});

export default DashboardPage;
