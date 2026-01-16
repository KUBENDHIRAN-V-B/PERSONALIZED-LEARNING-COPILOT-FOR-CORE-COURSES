import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('api_keys');
    setHasApiKeys(!!savedKeys);
  }, []);

  const handleKeysSet = () => {
    // Check if keys were actually saved to localStorage
    const savedKeys = localStorage.getItem('api_keys');
    console.log('handleKeysSet called, savedKeys:', savedKeys);
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        console.log('Parsed keys:', parsedKeys);
        // Check if there are valid keys with provider and key
        const hasValidKeys = parsedKeys.some((key: any) => key.provider && key.key?.trim());
        console.log('Has valid keys:', hasValidKeys);
        if (hasValidKeys) {
          setHasApiKeys(true);
          setShowApiSetup(false);
          
          // If we're on the settings page, navigate to dashboard
          if (location.pathname === '/settings') {
            navigate('/dashboard');
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing saved keys:', error);
      }
    }
    // If no valid keys, stay on the setup page
    console.warn('No valid API keys found after save attempt');
  };

  // If no API keys and not showing setup, show setup
  if (!hasApiKeys && !showApiSetup) {
    return <ApiKeySetup onKeysSet={handleKeysSet} />;
  }

  // If showing API setup (from settings)
  if (showApiSetup) {
    return <ApiKeySetup onKeysSet={handleKeysSet} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat/:courseId" element={<ChatPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/settings" element={<ApiKeySetup onKeysSet={handleKeysSet} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
