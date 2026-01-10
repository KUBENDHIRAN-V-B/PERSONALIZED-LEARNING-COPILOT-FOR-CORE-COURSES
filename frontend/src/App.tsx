import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import ApiKeySetup from './components/ApiKeySetup';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

// Loading component with smooth animation
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
    <div className="text-center text-white animate-fade-in">
      <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48, borderWidth: 4 }}></div>
      <p className="text-lg font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('api_keys');
    setHasApiKeys(!!savedKeys);
  }, []);

  const handleKeysSet = () => {
    setHasApiKeys(true);
  };

  if (!hasApiKeys) {
    return <ApiKeySetup onKeysSet={handleKeysSet} />;
  }

  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat/:courseId" element={<ChatPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
}

export default App;
