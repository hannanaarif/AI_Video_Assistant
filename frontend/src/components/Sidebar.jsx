import React, { useState } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  CheckSquare, 
  Square, 
  Key, 
  HelpCircle, 
  Video, 
  Clock, 
  Tag, 
  PanelLeftClose, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ 
  analysisData, 
  onNewAnalysis, 
  actionItems, 
  onToggleActionItem, 
  isCollapsed, 
  onToggleCollapse 
}) {
  const [openSections, setOpenSections] = useState({
    summary: true,
    actionItems: true,
    keyDecisions: true,
    openQuestions: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  if (isCollapsed) {
    return (
      <div className="w-14 bg-[#171717] border-r border-[#2e2e2e] flex flex-col items-center py-4 space-y-4 flex-shrink-0 transition-all duration-200">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#212121] transition-colors"
          title="Expand Sidebar"
        >
          <PanelLeftClose className="w-5 h-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={onNewAnalysis}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-md"
          title="New Analysis"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[320px] bg-[#171717] border-r border-[#2e2e2e] flex flex-col h-full flex-shrink-0 select-none overflow-hidden transition-all duration-200">
      
      {/* Top Header Actions */}
      <div className="p-3 border-b border-[#2e2e2e] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onNewAnalysis}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-[#212121] hover:bg-[#2a2a2a] border border-[#333333] rounded-xl text-xs font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>New Analysis</span>
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#212121] transition-colors"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Meeting Context Accordion Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* Title & Metadata Card */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-3.5 space-y-2">
          <div className="flex items-start justify-between">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              📌 Meeting Context
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {analysisData?.metadata?.duration || "24m"}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white leading-snug">
            {analysisData?.title || "Meeting Analysis"}
          </h2>
          {analysisData?.metadata?.sourceUrl && (
            <a
              href={analysisData.metadata.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-[11px] text-gray-400 hover:text-teal-400 transition-colors"
            >
              <Video className="w-3 h-3" />
              <span className="truncate max-w-[200px]">View Source Video</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* 📋 Executive Summary Accordion */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-200 hover:bg-[#282828] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>📋 Executive Summary</span>
            </div>
            {openSections.summary ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {openSections.summary && (
            <div className="px-3 pb-3 pt-1 border-t border-[#2a2a2a] text-xs text-gray-300 space-y-2 leading-relaxed">
              {analysisData?.summary?.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Action Items Accordion (Checklist) */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('actionItems')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-200 hover:bg-[#282828] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>✅ Action Items</span>
              <span className="text-[10px] bg-[#2e2e2e] text-emerald-400 font-mono px-1.5 py-0.5 rounded-full">
                {actionItems.filter(i => i.completed).length}/{actionItems.length}
              </span>
            </div>
            {openSections.actionItems ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {openSections.actionItems && (
            <div className="px-3 pb-3 pt-1 border-t border-[#2a2a2a] space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleActionItem(item.id)}
                  className={`flex items-start space-x-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                    item.completed ? 'bg-[#1a1a1a] opacity-60' : 'bg-[#282828] hover:bg-[#303030]'
                  }`}
                >
                  <div className="pt-0.5 text-emerald-400 flex-shrink-0">
                    {item.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="text-xs space-y-0.5 min-w-0">
                    <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {item.task}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>👤 {item.owner}</span>
                      <span>📅 {item.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔑 Key Decisions Accordion */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('keyDecisions')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-200 hover:bg-[#282828] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>🔑 Key Decisions</span>
            </div>
            {openSections.keyDecisions ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {openSections.keyDecisions && (
            <div className="px-3 pb-3 pt-1 border-t border-[#2a2a2a] text-xs text-gray-300 space-y-2">
              {analysisData?.key_decisions?.map((dec, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-[#262626] p-2 rounded-lg border border-[#303030]">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ❓ Open Questions Accordion */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('openQuestions')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-200 hover:bg-[#282828] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>❓ Open Questions</span>
            </div>
            {openSections.openQuestions ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {openSections.openQuestions && (
            <div className="px-3 pb-3 pt-1 border-t border-[#2a2a2a] text-xs text-gray-300 space-y-2">
              {analysisData?.open_questions?.map((q, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-[#262626] p-2 rounded-lg border border-[#303030]">
                  <span className="text-purple-400 font-bold">?</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#2e2e2e] text-[11px] text-gray-500 flex justify-between items-center bg-[#171717]">
        <span>Vector RAG DB: Active</span>
        <span className="font-mono text-teal-400 text-[10px]">k=4</span>
      </div>
    </aside>
  );
}
