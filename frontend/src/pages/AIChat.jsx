import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am your IntelliLib Research Assistant. How can I help you with your academic research today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // In production, this URL should point to your FastAPI service
      // For now, we'll simulate a response if the service isn't reachable directly from frontend demo
      // const response = await axios.post('http://localhost:8000/api/ai/chat', { message: input });

      // Simulating API call for UI demonstration
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          role: 'assistant',
          content: `I've analyzed your query about "${userMessage.content}". Based on the documents in our library, I recommend looking into semantic vector spaces. Would you like me to find specific papers on this topic?`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Chat error:', error);
      setLoading(false);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        role: 'assistant',
        content: 'I apologize, but I am having trouble connecting to the AI core at the moment. Please try again later.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary py-4 px-6 shadow-dark">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-text-primary text-bg-primary flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <h1 className="text-xl font-bold font-inter">Research Assistant</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-text-muted">Online • GPT-4 Model</span>
              </div>
            </div>
          </div>
          <button
            className="btn-secondary text-sm hidden sm:block"
            onClick={() => setMessages([messages[0]])}
          >
            Clear Conversation
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 sm:p-6 relative shadow-md ${msg.role === 'user'
                    ? 'bg-bg-hover text-text-primary border border-border-secondary'
                    : 'bg-bg-card text-text-primary border border-border-primary'
                  }`}
              >
                {/* Role Label */}
                <div className="mb-2 flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-[10px] text-text-dim">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed">
                  {msg.content}
                </div>

                {/* AI Decorative Element */}
                {msg.role === 'assistant' && (
                  <div className="absolute -left-3 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-border-primary border-b-[10px] border-b-transparent hidden sm:block"></div>
                )}
                {msg.role === 'user' && (
                  <div className="absolute -right-3 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-l-[12px] border-l-border-secondary border-b-[10px] border-b-transparent hidden sm:block"></div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-bg-card border border-border-primary rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-bg-secondary border-t border-border-primary p-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a research question..."
              className="w-full bg-bg-primary border-2 border-border-primary rounded-xl py-4 pl-6 pr-16 text-text-primary placeholder-text-dim focus:outline-none focus:border-text-primary transition-colors shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-text-primary text-bg-primary rounded-lg flex items-center justify-center hover:bg-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-text-dim">
              AI responses may vary. Cross-reference sources for critical research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
