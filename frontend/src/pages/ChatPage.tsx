import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiCpu } from 'react-icons/fi';
import { chatAPI } from '../services/api';
import { useFocusTimer } from '../useFocusTimer';
import { FocusTimer } from '../components/FocusTimer';
import { AIResponseBox } from '../components/AIResponseBox';
import APIStatusIndicator from '../components/APIStatusIndicator';
import { DistractionStop } from '../components/DistractionStop';



// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-3">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

interface Message {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
}

const ChatPage: React.FC = memo(() => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const focusTimer = useFocusTimer();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    setLoading(true);
    setInput('');

    try {
      const response = await chatAPI.sendMessage(courseId || 'dsa', trimmedInput, conversationId);

      if (!conversationId && response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }

      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        userMessage: trimmedInput,
        aiResponse: response.data.aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        userMessage: trimmedInput,
        aiResponse: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, courseId, conversationId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  const goBack = useCallback(() => navigate('/dashboard'), [navigate]);

  const courseName = courseId?.toUpperCase() || 'Learning';

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${isFocusMode ? 'bg-gray-100' : 'bg-gray-50'}`}>
      {/* Distraction Stop Button */}
      <DistractionStop onFocusModeChange={setIsFocusMode} />

      {/* Header - hidden in focus mode */}
      <header className={`bg-white shadow-sm flex-shrink-0 transition-all duration-300 ${isFocusMode ? 'opacity-70 hover:opacity-100' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FiArrowLeft size={20} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FiCpu className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{courseName} Assistant</h1>
                <p className="text-xs text-gray-500">AI-powered learning companion</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* API Status + Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Live API Status Indicator */}
          <div className="mb-4">
            <APIStatusIndicator />
          </div>

          {/* Messages */}
          <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <FiCpu className="text-4xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Start Learning {courseName}!
              </h2>
              <p className="text-gray-600 max-w-md mb-8">
                Ask any question about {courseName} and I'll help you understand it with personalized explanations.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  `What is ${courseName}?`,
                  'Explain with examples',
                  'Best practices',
                  'Common mistakes'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className="space-y-4 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%] shadow-sm">
                    {msg.userMessage}
                  </div>
                </div>

                {/* AI Response */}
                <AIResponseBox content={msg.aiResponse} />
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCpu className="text-purple-600" size={16} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend />
              )}
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Focus Timer Widget */}
      <FocusTimer 
        totalTime={focusTimer.totalTime}
        activeTime={focusTimer.activeTime}
        focusScore={focusTimer.focusScore}
        isActive={focusTimer.isActive}
      />
    </div>
  );
});

export default ChatPage;
