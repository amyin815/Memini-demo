import React, { useState } from 'react';
import { AppView, Topic, ChatMessage } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import TopicSelection from './components/TopicSelection';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import { detectTopic } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [processing, setProcessing] = useState(false);

  const resetApp = () => {
    setChatHistory([]);
    setSelectedTopic(null);
    setCurrentView(AppView.WELCOME);
  };

  const handleFreeInput = async (text: string) => {
    setProcessing(true);
    const detectedTopic = await detectTopic(text);
    setSelectedTopic(detectedTopic);
    
    // Add the user's initial input to history
    setChatHistory([{
      id: Date.now().toString(),
      role: 'user',
      text: text
    }]);
    
    setProcessing(false);
    setCurrentView(AppView.CHAT);
  };

  const handlePhotoUpload = async (file: File, text: string) => {
    setProcessing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const detectedTopic = await detectTopic(text, base64String);
      setSelectedTopic(detectedTopic);

      // Add the photo message to history
      setChatHistory([{
        id: Date.now().toString(),
        role: 'user',
        text: text || "I'd like to talk about this photo.",
        image: base64String.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
      }]);
      
      setProcessing(false);
      setCurrentView(AppView.CHAT);
    };
    reader.readAsDataURL(file);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleTopicConfirm = () => {
    if (selectedTopic) {
      setCurrentView(AppView.CHAT);
    }
  };

  const handleEndSession = (history: ChatMessage[]) => {
    setChatHistory(history);
    setCurrentView(AppView.SUMMARY);
  };

  if (processing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
           <p className="text-gray-600 font-medium">Analyzing your memory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-200 min-h-screen font-sans">
      {currentView === AppView.WELCOME && (
        <WelcomeScreen 
          onStartFreeChat={handleFreeInput}
          onPhotoUpload={handlePhotoUpload}
          onGoToTopics={() => setCurrentView(AppView.TOPIC_SELECTION)}
        />
      )}

      {currentView === AppView.TOPIC_SELECTION && (
        <TopicSelection 
          userParams={{ name: "User" }}
          selectedTopic={selectedTopic}
          onSelect={handleTopicSelect}
          onNext={handleTopicConfirm}
        />
      )}

      {currentView === AppView.CHAT && selectedTopic && (
        <ChatInterface 
          topic={selectedTopic}
          initialHistory={chatHistory}
          onEndSession={handleEndSession}
        />
      )}

      {currentView === AppView.SUMMARY && (
        <SummaryView 
          history={chatHistory}
          onRestart={resetApp}
        />
      )}
    </div>
  );
};

export default App;