import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, FileText, Database, Sparkles, XCircle } from 'lucide-react';

const STEPS = [
  { id: 1, label: "Downloading & converting audio track...", icon: FileText, duration: 1500 },
  { id: 2, label: "Transcribing speech to text (Whisper / Sarvam AI)...", icon: Cpu, duration: 2200 },
  { id: 3, label: "Extracting summary, action items & decisions...", icon: Sparkles, duration: 1800 },
  { id: 4, label: "Building Chroma Vector DB & RAG retriever...", icon: Database, duration: 1200 },
];

export default function ProcessingScreen({ analysisParams, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    let timer1 = setTimeout(() => {
      setCurrentStep(2);
      setProgress(45);
    }, 1500);

    let timer2 = setTimeout(() => {
      setCurrentStep(3);
      setProgress(75);
    }, 3700);

    let timer3 = setTimeout(() => {
      setCurrentStep(4);
      setProgress(92);
    }, 5500);

    let timer4 = setTimeout(() => {
      setProgress(100);
      onComplete();
    }, 6700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#212121] text-gray-100 flex flex-col justify-center items-center px-4 relative">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#2f2f2f] border border-[#383838] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Animated Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-3 animate-bounce">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white">Analyzing Video Content</h2>
          <p className="text-xs text-gray-400 truncate px-4">
            Source: <span className="text-gray-200 font-medium">{analysisParams?.source || "Video Source"}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>Overall Progress</span>
            <span className="text-teal-400 font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#212121] rounded-full overflow-hidden border border-[#383838]">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Multi-step timeline */}
        <div className="space-y-3 pt-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-[#212121] border border-teal-500/40 shadow-sm' 
                    : isDone 
                    ? 'bg-[#212121]/40 border border-transparent opacity-75' 
                    : 'opacity-40'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel Action */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors py-1 px-3 rounded-lg hover:bg-[#212121]"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Analysis</span>
          </button>
        </div>

      </div>
    </div>
  );
}
