import React, { useState } from 'react';
import InitialScreen from './components/InitialScreen';
import ProcessingScreen from './components/ProcessingScreen';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { MOCK_ANALYSIS_RESULT, generateMockRAGAnswer } from './data/mockData';

export default function App() {
  const [phase, setPhase] = useState('INITIAL'); // 'INITIAL' | 'PROCESSING' | 'DASHBOARD'
  const [analysisParams, setAnalysisParams] = useState(null);
  const [analysisData, setAnalysisData] = useState(MOCK_ANALYSIS_RESULT);
  const [actionItems, setActionItems] = useState(MOCK_ANALYSIS_RESULT.action_items);
  const [messages, setMessages] = useState(MOCK_ANALYSIS_RESULT.initialChatMessages);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleStartAnalysis = (params) => {
    setAnalysisParams(params);
    setPhase('PROCESSING');
  };

  const handleProcessingComplete = () => {
    // Generate custom title if URL was provided
    if (analysisParams?.source) {
      setAnalysisData(prev => ({
        ...prev,
        title: analysisParams.source.includes('youtube.com') 
          ? `Analysis of ${analysisParams.source.split('v=')[1]?.substring(0, 8) || 'Video'}` 
          : `Analysis of ${analysisParams.source}`
      }));
    }
    setPhase('DASHBOARD');
  };

  const handleNewAnalysis = () => {
    setPhase('INITIAL');
    setAnalysisParams(null);
    setMessages(MOCK_ANALYSIS_RESULT.initialChatMessages);
  };

  const handleToggleActionItem = (id) => {
    setActionItems(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleSendMessage = (userText) => {
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // Simulate RAG AI Response
    setTimeout(() => {
      const ragReply = generateMockRAGAnswer(userText);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: ragReply.text,
        citations: ragReply.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div className="w-screen h-screen bg-[#212121] text-gray-100 flex overflow-hidden font-sans">
      {phase === 'INITIAL' && (
        <InitialScreen onStartAnalysis={handleStartAnalysis} />
      )}

      {phase === 'PROCESSING' && (
        <ProcessingScreen 
          analysisParams={analysisParams}
          onComplete={handleProcessingComplete}
          onCancel={handleNewAnalysis}
        />
      )}

      {phase === 'DASHBOARD' && (
        <div className="w-full h-full flex overflow-hidden animate-fade-in">
          <Sidebar 
            analysisData={analysisData}
            onNewAnalysis={handleNewAnalysis}
            actionItems={actionItems}
            onToggleActionItem={handleToggleActionItem}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <ChatInterface 
            messages={messages}
            onSendMessage={handleSendMessage}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(false)}
          />
        </div>
      )}
    </div>
  );
}
