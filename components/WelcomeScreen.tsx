import React, { useState, useRef } from 'react';

interface WelcomeScreenProps {
  onStartFreeChat: (text: string) => void;
  onPhotoUpload: (file: File, text: string) => void;
  onGoToTopics: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartFreeChat, onPhotoUpload, onGoToTopics }) => {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onStartFreeChat(inputText);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      // Optional: Ask for description context or just send immediate
      onPhotoUpload(e.target.files[0], inputText);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-green-50 min-h-screen p-6 pt-12 shadow-2xl relative">
      <div className="flex justify-end mb-8">
         <div className="flex items-center text-blue-500 font-bold text-xl tracking-tight">
          <span className="bg-blue-500 text-white px-1 rounded mr-1 text-sm">m</span>
          memini
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </div>

        {/* Free Input Area */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-green-100">
          <h3 className="font-semibold text-gray-700 mb-3">Share a thought...</h3>
          <form onSubmit={handleTextSubmit}>
            <textarea
              className="w-full bg-gray-50 rounded-xl p-3 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 mb-4 resize-none"
              rows={3}
              placeholder="I was just thinking about..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex space-x-2">
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="flex-1 bg-green-400 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-green-500 transition"
              >
                Start Chatting
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-14 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-200 transition border border-gray-200"
                title="Upload Photo"
              >
                <span className="material-icons">add_a_photo</span>
              </button>
            </div>
            {isUploading && <p className="text-xs text-green-600 mt-2 text-center">Processing image...</p>}
          </form>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-green-50 text-gray-500">Or</span>
          </div>
        </div>

        {/* Structured Path */}
        <button
          onClick={onGoToTopics}
          className="w-full bg-white border border-green-200 text-green-700 font-bold py-4 rounded-3xl shadow-md hover:shadow-lg hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          <span className="material-icons">list_alt</span>
          Choose a Topic
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;