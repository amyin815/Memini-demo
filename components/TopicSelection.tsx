import React from 'react';
import { Topic, TOPICS_LIST } from '../types';

interface TopicSelectionProps {
  onSelect: (topic: Topic) => void;
  selectedTopic: Topic | null;
  onNext: () => void;
  userParams: { name: string };
}

const TopicSelection: React.FC<TopicSelectionProps> = ({ onSelect, selectedTopic, onNext, userParams }) => {
  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pt-12 bg-white">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Good Morning</h1>
          <p className="text-sm text-gray-500">{userParams.name}</p>
        </div>
        <div className="flex items-center text-blue-500 font-bold text-xl tracking-tight">
          <span className="bg-blue-500 text-white px-1 rounded mr-1 text-sm">m</span>
          memini
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col items-center">
        <p className="text-gray-600 text-center mb-8 mt-4 font-medium">
          Please select from the following topics you wish to discuss today:
        </p>

        <div className="w-full space-y-4">
          {TOPICS_LIST.map((topic) => (
            <button
              key={topic}
              onClick={() => onSelect(topic)}
              className={`w-full py-4 px-6 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border
                ${selectedTopic === topic 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-md transform scale-105' 
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-8 pb-12 bg-white sticky bottom-0">
        <button
          disabled={!selectedTopic}
          onClick={onNext}
          className={`w-full py-4 rounded-full font-bold text-lg transition-colors
            ${selectedTopic 
              ? 'bg-gray-300 text-gray-800 hover:bg-gray-400 cursor-pointer' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Next
        </button>
        {/* Home Indicator line simulation */}
        <div className="w-1/3 h-1 bg-black mx-auto mt-6 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default TopicSelection;