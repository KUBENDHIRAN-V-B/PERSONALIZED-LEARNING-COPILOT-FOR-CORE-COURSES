import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import Chat from './pages/Chat';
import Planner from './pages/Planner';
import Quiz from './pages/Quiz';
import Landing from './pages/Landing';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
        <Route path="/chat" element={<Layout><Chat /></Layout>} />
        <Route path="/plan" element={<Layout><Planner /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
