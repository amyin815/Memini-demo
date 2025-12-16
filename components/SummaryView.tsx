import React, { useEffect, useState } from 'react';
import { ChatMessage, EmotionResult } from '../types';
import { analyzeSessionEmotion } from '../services/geminiService';

interface SummaryViewProps {
  history: ChatMessage[];
  onRestart: () => void;
}

const EmpathicPersona: React.FC<{ char: string, color: string }> = ({ char, color }) => {
  // SVG Shapes for 7 Personas (a-g) based on the Figure 1
  const renderShape = () => {
    const commonProps = { fill: color, className: "drop-shadow-lg opacity-90" };
    const face = (
      <g>
         <circle cx="90" cy="100" r="4" fill="#333" opacity="0.8"/>
         <circle cx="110" cy="100" r="4" fill="#333" opacity="0.8"/>
         <path d="M95 110 Q100 115 105 110" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      </g>
    );

    switch (char) {
      case 'a': // Warm (Teardrop/Onion shape - yellow)
        return (
          <svg viewBox="0 0 200 200" className="w-64 h-64 animate-float">
            <path d="M100 20 Q160 80 160 130 A60 60 0 0 1 40 130 Q40 80 100 20 Z" {...commonProps} />
             {/* Legs */}
             <path d="M80 170 L80 190 M120 170 L120 190" stroke={color} strokeWidth="4" />
             {/* Arms */}
             <path d="M40 100 Q20 80 10 90 M160 100 Q180 80 190 90" stroke={color} strokeWidth="3" fill="none"/>
             {face}
          </svg>
        );
      case 'b': // Curious (Snake/Worm - purple)
        return (
           <svg viewBox="0 0 200 200" className="w-64 h-64 animate-float">
             <path d="M60 40 Q100 20 140 40 Q180 60 140 100 Q100 140 140 180" stroke={color} strokeWidth="40" strokeLinecap="round" fill="none" className="drop-shadow-lg"/>
             {/* Face on top segment */}
             <circle cx="60" cy="40" r="20" fill={color}/> 
             <g transform="translate(-40 -60)">
               {face}
             </g>
           </svg>
        );
      case 'c': // Pride (Toast/Square - red)
        return (
          <svg viewBox="0 0 200 200" className="w-64 h-64 animate-bounce-slow">
            <rect x="50" y="50" width="100" height="100" rx="20" {...commonProps} />
             {/* Arms up */}
             <path d="M50 100 Q30 80 30 60 M150 100 Q170 80 170 60" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none"/>
              {/* Legs */}
             <path d="M80 150 L80 180 M120 150 L120 180" stroke={color} strokeWidth="6" strokeLinecap="round" />
            {face}
          </svg>
        );
      case 'd': // Unsafe/Seen (Cloud/Puff - pink)
        return (
           <svg viewBox="0 0 200 200" className="w-64 h-64 animate-float">
             <path d="M50 100 Q30 50 80 50 Q100 20 120 50 Q170 50 150 100 Q180 140 120 140 Q100 170 80 140 Q20 140 50 100 Z" {...commonProps} />
             {/* Legs */}
             <path d="M90 140 L90 160 M110 140 L110 160" stroke={color} strokeWidth="3"/>
             {face}
           </svg>
        );
      case 'e': // Passion (Rock/Trapezoid - orange)
        return (
           <svg viewBox="0 0 200 200" className="w-64 h-64 animate-bounce-slow">
             <path d="M70 40 L130 40 L160 100 L130 160 L70 160 L40 100 Z" {...commonProps} />
             {/* Angry/Determined Brows */}
             <path d="M85 95 L95 100 M115 100 L125 95" stroke="#333" strokeWidth="2" />
             {/* Arms flexed */}
             <path d="M40 100 L20 80 M160 100 L180 80" stroke={color} strokeWidth="5" strokeLinecap="round"/>
             {/* Legs stance */}
             <path d="M70 160 L60 190 M130 160 L140 190" stroke={color} strokeWidth="5" strokeLinecap="round"/>
           </svg>
        );
      case 'f': // Healing (Bean - green)
        return (
           <svg viewBox="0 0 200 200" className="w-64 h-64 animate-float">
             <path d="M60 100 Q40 50 100 50 Q160 50 160 100 Q160 150 100 150 Q80 150 60 100 Z" transform="rotate(-20 100 100)" {...commonProps} />
              {/* Smiling Face */}
             <g transform="translate(10 -10)">
               {face}
             </g>
              {/* Arms hugging self */}
             <path d="M60 110 Q100 130 140 110" stroke="#333" strokeWidth="2" fill="none" opacity="0.2"/>
           </svg>
        );
      case 'g': // Playful (Star - blue)
        return (
           <svg viewBox="0 0 200 200" className="w-64 h-64 animate-spin-slow">
             <path d="M100 20 L120 80 L180 80 L130 120 L150 180 L100 140 L50 180 L70 120 L20 80 L80 80 Z" {...commonProps} />
             {/* Legs wiggling */}
             <path d="M80 160 Q70 180 80 200 M120 160 Q130 180 120 200" stroke={color} strokeWidth="3" fill="none"/>
             {face}
           </svg>
        );
      default:
        return null;
    }
  };

  return renderShape();
};

const SummaryView: React.FC<SummaryViewProps> = ({ history, onRestart }) => {
  const [result, setResult] = useState<EmotionResult | null>(null);

  useEffect(() => {
    const analyze = async () => {
      const emotionData = await analyzeSessionEmotion(history);
      setResult(emotionData);
    };
    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-500 font-medium">Crafting your memory keepsake...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white relative overflow-hidden font-sans">
      
      {/* Visual Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        
        {/* Dimension Recap lines (Decorative) */}
        <div className="w-full border-b border-dashed border-gray-300 mb-8 absolute top-20 left-0 opacity-50"></div>
        <div className="absolute top-16 right-8 text-xs text-gray-400 italic">how</div>

        <div className="mb-8 relative transform scale-125">
             <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 blur-xl"></div>
            <EmpathicPersona char={result.personaChar} color={result.color} />
        </div>

        {/* Emotion Bubble */}
        <div 
            className="p-6 rounded-3xl shadow-xl backdrop-blur-sm bg-white/80 border border-white/50 mb-8 max-w-xs transform -rotate-1 transition-all duration-500 hover:scale-105"
            style={{ boxShadow: `0 10px 40px -10px ${result.color}66`, borderTop: `4px solid ${result.color}` }}
        >
             <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: result.color}}></span>
                Your Journey
             </h2>
             <p className="text-gray-800 text-lg font-medium leading-relaxed italic">
                 "{result.feedback}"
             </p>
        </div>

        <div className="w-full border-b border-dashed border-gray-300 mt-4 opacity-50"></div>
        <div className="self-start mt-2 text-xs text-gray-400 italic">end</div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-white/50 backdrop-blur-md sticky bottom-0 z-20">
         <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                <span className="material-icons text-gray-400 text-3xl">mic</span>
            </div>
         </div>

        <div className="flex items-center justify-between">
            <button className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200">
                <span className="material-icons">keyboard</span>
            </button>

            <button
                onClick={onRestart}
                className="mx-4 flex-1 py-4 rounded-full text-white font-bold text-lg hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: result.color }}
            >
                Start New Memory
            </button>

             <button className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200">
                <span className="material-icons">add</span>
            </button>
        </div>
        <div className="w-1/3 h-1 bg-black mx-auto mt-6 rounded-full opacity-20"></div>
      </div>

      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes bounce-slow {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default SummaryView;