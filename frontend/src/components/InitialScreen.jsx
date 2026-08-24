import React, { useState } from 'react';
import { 
  Video, 
  Youtube, 
  UploadCloud, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  FileAudio, 
  Play, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { MOCK_SAMPLE_VIDEOS } from '../data/mockData';

export default function InitialScreen({ onStartAnalysis }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('english');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!youtubeUrl && !selectedFile) {
      setErrorMsg('Please enter a YouTube URL or upload a local file.');
      return;
    }
    setErrorMsg('');
    const source = selectedFile ? selectedFile.name : youtubeUrl;
    onStartAnalysis({ source, language, isFile: !!selectedFile });
  };

  const handleSelectSample = (sample) => {
    setYoutubeUrl(sample.url);
    setSelectedFile(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#212121] text-gray-100 flex flex-col justify-between items-center px-4 py-8 relative overflow-y-auto">
      {/* Top Header / Brand Badge */}
      <header className="w-full max-w-4xl flex justify-between items-center pt-2 pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">AI Video Assistant</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#2f2f2f] text-gray-400 border border-[#383838]">
            v2.5 RAG Engine
          </span>
        </div>
      </header>

      {/* Main Center Hero Section */}
      <main className="w-full max-w-2xl flex-1 flex flex-col justify-center items-center my-auto py-8">
        
        {/* ChatGPT Style Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            What video would you like to analyze?
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Extract key summaries, decisions, action items, and chat directly with your transcript using RAG.
          </p>
        </div>

        {/* Input Container Box */}
        <form 
          onSubmit={handleSubmit}
          className="w-full bg-[#2f2f2f]/80 backdrop-blur-md border border-[#383838] rounded-2xl p-5 shadow-2xl space-y-4 transition-all duration-200 focus-within:border-[#555555]"
        >
          {/* YouTube URL Input */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
              YouTube Video URL
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-gray-400">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  if (e.target.value) setSelectedFile(null);
                  setErrorMsg('');
                }}
                className="w-full pl-11 pr-10 py-3 bg-[#212121] border border-[#383838] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/80 transition-colors"
              />
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={() => setYoutubeUrl('')}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-[#383838]"></div>
            <span className="px-3 text-xs text-gray-500 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-[#383838]"></div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
              dragActive 
                ? 'border-teal-500 bg-teal-500/10' 
                : selectedFile 
                ? 'border-teal-500/60 bg-teal-500/5' 
                : 'border-[#383838] hover:border-gray-500 bg-[#212121]/50'
            }`}
          >
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {selectedFile ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3 text-left">
                  <FileAudio className="w-6 h-6 text-teal-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#383838]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                <UploadCloud className="w-7 h-7 text-gray-400" />
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-teal-400">Click to upload local file</span> or drag & drop
                </p>
                <p className="text-xs text-gray-500">MP4, MP3, WAV, M4A up to 500MB</p>
              </div>
            )}
          </div>

          {/* Options & Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Language Selector */}
            <div className="flex items-center space-x-2 bg-[#212121] px-3 py-2 border border-[#383838] rounded-xl">
              <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <label htmlFor="language-select" className="text-xs text-gray-400 whitespace-nowrap">
                Language:
              </label>
              <select
                id="language-select"
                aria-label="Select transcription language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="english" className="bg-[#212121]">English (Whisper)</option>
                <option value="hinglish" className="bg-[#212121]">Hinglish (Sarvam AI)</option>
              </select>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-teal-900/20 transition-all duration-200 active:scale-[0.98]"
            >
              <span>Analyze Video</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-xs text-red-400 text-center font-medium pt-1 animate-fade-in">
              {errorMsg}
            </p>
          )}
        </form>

        {/* Quick Sample Demo Pills */}
        <div className="w-full mt-8">
          <p className="text-xs font-medium text-gray-500 mb-3 text-center uppercase tracking-wider">
            Or try with a sample video
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {MOCK_SAMPLE_VIDEOS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="flex flex-col text-left p-3 rounded-xl bg-[#2f2f2f]/50 border border-[#383838] hover:border-teal-500/50 hover:bg-[#2f2f2f] transition-all duration-150 group"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#212121] text-teal-400 font-medium">
                    {sample.tag}
                  </span>
                  <span>{sample.duration}</span>
                </div>
                <p className="text-xs font-medium text-gray-200 group-hover:text-white truncate">
                  {sample.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-gray-500 py-4">
        Powered by OpenAI Whisper, Sarvam AI, Chroma DB & Mistral LLM
      </footer>
    </div>
  );
}
