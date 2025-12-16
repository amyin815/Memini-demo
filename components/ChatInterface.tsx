import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Topic, Dimension, DIMENSIONS_ORDER, MILESTONES } from '../types';
import { generateTherapyResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  topic: Topic;
  initialHistory: ChatMessage[];
  onEndSession: (history: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ topic, initialHistory, onEndSession }) => {
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [coveredDims, setCoveredDims] = useState<Dimension[]>([]);
  const [coveredMilestones, setCoveredMilestones] = useState<string[]>([]);
  const [activeDim, setActiveDim] = useState<Dimension>(Dimension.WHO); // Default start
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (history.length === 0) {
      setLoading(true);
      const greeting = `Hello. I'm ready to listen. To start our journey into "${topic}", is there a specific person or moment coming to mind?`;
      setHistory([{ id: 'init', role: 'model', text: greeting }]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, loading]);

  // Update active dimension based on progress
  useEffect(() => {
    // Find the first dimension that isn't fully covered, or default to the last one
    const nextDim = DIMENSIONS_ORDER.find(d => !coveredDims.includes(d));
    if (nextDim) setActiveDim(nextDim);
  }, [coveredDims]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    // Optimistically update history with user message
    const historyWithUser = [...history, userMsg];
    setHistory(historyWithUser);
    setInput('');
    setLoading(true);

    const result = await generateTherapyResponse(history, topic, userMsg.text);

    // Update State
    setCoveredDims(result.coveredDimensions);
    // Accumulate milestones (don't lose previous ones)
    setCoveredMilestones(prev => Array.from(new Set([...prev, ...result.coveredMilestones])));

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: result.text
    };

    const historyWithModel = [...historyWithUser, modelMsg];
    setHistory(historyWithModel);
    setLoading(false);

    // Auto-end session if model deems it complete
    if (result.isSessionComplete) {
      setTimeout(() => {
        onEndSession(historyWithModel);
      }, 2500); // 2.5s delay to read the final message
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative font-sans">
      
      {/* Header & Two-Tier Progress Bar */}
      <div className="bg-amber-50 pb-2 pt-8 px-4 shadow-sm z-20 rounded-b-3xl border-b border-amber-100">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => onEndSession(history)} className="text-gray-400 hover:text-gray-600">
             <span className="material-icons">arrow_back_ios</span>
          </button>
          <h2 className="font-semibold text-gray-700 text-sm tracking-wide uppercase">{topic}</h2>
          <button 
            onClick={() => onEndSession(history)}
            className="text-blue-500 hover:text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full transition-colors"
          >
             Finish
          </button> 
        </div>

        {/* Tier 1: 5W1H Tabs */}
        <div className="flex justify-between gap-1 mb-3">
          {DIMENSIONS_ORDER.map((dim) => {
            const isCovered = coveredDims.includes(dim);
            const isActive = dim === activeDim;
            return (
              <div 
                key={dim}
                className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                  ${isActive ? 'bg-blue-500 text-white shadow-md transform scale-105' : 
                    isCovered ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-400'}
                `}
              >
                {dim}
              </div>
            );
          })}
        </div>

        {/* Tier 2: Milestone Rail */}
        <div className="relative h-6 flex items-center justify-center px-4">
          {/* The Rail */}
          <div className="absolute w-full h-1.5 bg-gray-200 rounded-full top-1/2 transform -translate-y-1/2">
             <div 
                className="h-full bg-green-400 rounded-full transition-all duration-700"
                style={{ width: `${(coveredMilestones.length / 18) * 100}%` }} // Approx 3 milestones * 6 dims
             ></div>
          </div>
          
          {/* The Dots for CURRENT Dimension */}
          <div className="relative w-full flex justify-between z-10 px-2">
            {MILESTONES[activeDim].map((ms, idx) => {
              const isDone = coveredMilestones.includes(ms);
              return (
                <div key={ms} className="flex flex-col items-center group">
                  <div 
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                      ${isDone ? 'bg-green-500 border-green-500 scale-125' : 'bg-white border-gray-300'}
                    `}
                    title={ms}
                  ></div>
                  {/* Tooltip-ish label for milestone */}
                  <span className={`absolute -bottom-4 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                      ${idx === 0 ? 'left-0' : idx === 2 ? 'right-0' : 'text-center'}
                  `}>
                    {ms}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {history.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                mi
              </div>
            )}

            <div className={`max-w-[75%] px-5 py-3 shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-green-300 text-gray-800 rounded-2xl rounded-br-none' 
                : 'bg-white text-gray-700 rounded-2xl rounded-bl-none border border-gray-100'
            }`}>
              {msg.image && (
                <img src={`data:image/png;base64,${msg.image}`} alt="User upload" className="mb-2 rounded-lg max-h-40 w-full object-cover"/>
              )}
              {msg.text}
            </div>

             {/* User Avatar */}
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 shadow-md">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-end gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">mi</div>
             <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm w-16">
               <div className="flex space-x-1 justify-center">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s'}}></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s'}}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 pb-8">
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-100 pl-4 pr-2 py-2">
            <button className="text-gray-400 p-2 hover:bg-gray-100 rounded-full">
              <span className="material-icons text-xl">keyboard</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 px-2 text-gray-700 focus:ring-0 focus:outline-none"
              disabled={loading}
            />
             {input.trim() ? (
               <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-md"
              >
                <span className="material-icons text-sm">arrow_upward</span>
              </button>
             ) : (
              <button className="bg-gray-200 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-300 transition">
                <span className="material-icons text-xl">mic</span>
              </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;