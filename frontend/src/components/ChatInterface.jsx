import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  PanelLeftOpen, 
  MessageSquare 
} from 'lucide-react';
import { generateMockRAGAnswer } from '../data/mockData';

const SUGGESTED_PROMPTS = [
  "What are the assigned action items and deadlines?",
  "Why did the team select Sarvam AI for transcription?",
  "Summarize the technical decisions regarding Chroma DB",
  "Who is responsible for the RAG latency benchmarking?"
];

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  sidebarCollapsed, 
  onToggleSidebar 
}) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCitation = (msgId) => {
    setExpandedCitations(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] relative overflow-hidden">
      
      {/* Top Navbar Header */}
      <header className="h-14 border-b border-[#2e2e2e] bg-[#212121]/90 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-3">
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2f2f2f] transition-colors"
              title="Open Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-sm text-white">RAG Assistant Chat</span>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-[#2f2f2f] px-2.5 py-1 rounded-md border border-[#383838]">
          Model: mistral-small-latest
        </div>
      </header>

      {/* Main Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Message Bubble */}
                  <div 
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-[#2f2f2f] text-white rounded-tr-xs border border-[#383838]' 
                        : 'bg-[#212121] text-gray-100 rounded-tl-xs border border-[#2f2f2f]'
                    }`}
                  >
                    {/* Render message body */}
                    <div className="whitespace-pre-wrap custom-markdown">
                      {msg.text}
                    </div>

                    {/* Expandable Citations for RAG Assistant */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#333333]">
                        <button
                          type="button"
                          onClick={() => toggleCitation(msg.id)}
                          className="flex items-center space-x-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>RAG Transcript Sources ({msg.citations.length})</span>
                          {expandedCitations[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {expandedCitations[msg.id] && (
                          <div className="mt-2 space-y-2">
                            {msg.citations.map((cit, idx) => (
                              <div key={idx} className="bg-[#181818] p-2.5 rounded-lg border border-[#2e2e2e] text-xs space-y-1">
                                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                                  Timestamp {cit.timestamp}
                                </span>
                                <p className="text-gray-300 italic">{cit.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex items-center space-x-2 text-[10px] text-gray-500 px-1">
                    <span>{msg.timestamp || 'Just now'}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-gray-300 transition-colors p-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 flex-shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Prompt Chips (if few messages) */}
      {messages.length <= 2 && (
        <div className="max-w-3xl mx-auto px-4 pb-2 w-full">
          <p className="text-[11px] font-medium text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(promptText)}
                className="text-xs bg-[#2f2f2f] hover:bg-[#383838] border border-[#3a3a3a] text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors truncate max-w-full"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sticky ChatGPT-Style Input Container */}
      <div className="p-4 bg-[#212121] border-t border-[#2e2e2e]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <div className="relative flex items-center bg-[#2f2f2f] border border-[#383838] rounded-2xl shadow-xl transition-all duration-200 focus-within:border-[#676767]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this meeting..."
              className="w-full pl-4 pr-12 py-3.5 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none max-h-40 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`absolute right-3 p-2 rounded-xl transition-all duration-200 ${
                inputText.trim() 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md' 
                  : 'bg-[#212121] text-gray-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-2">
            <span>Press <kbd className="bg-[#2f2f2f] px-1.5 py-0.5 rounded border border-[#383838] text-gray-400">Enter</kbd> to send, <kbd className="bg-[#2f2f2f] px-1.5 py-0.5 rounded border border-[#383838] text-gray-400">Shift + Enter</kbd> for line break</span>
            <span>RAG context window: active</span>
          </div>
        </form>
      </div>

    </div>
  );
}
