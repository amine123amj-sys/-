import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import ChatWindow from './components/ChatWindow';
import { Tab, ChatMode } from './types';
import { STRINGS } from './constants';
import { Tags, Video, MessageSquareText, X, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInChat, setIsInChat] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('text');

  const addInterest = () => {
    if (currentInterestInput.trim() && !interests.includes(currentInterestInput.trim())) {
        setInterests([...interests, currentInterestInput.trim()]);
        setCurrentInterestInput('');
    }
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          addInterest();
      }
  };

  const removeInterest = (interest: string) => {
      setInterests(interests.filter(i => i !== interest));
  };

  const startChat = (mode: ChatMode) => {
      setChatMode(mode);
      setIsInChat(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        if (isInChat) {
             return <ChatWindow onBack={() => setIsInChat(false)} interests={interests} mode={chatMode} />;
        }
        return (
          <div className="flex flex-col h-full bg-black text-white p-6 relative overflow-y-auto no-scrollbar">
            
            {/* Header: Logo & Online Count */}
            <div className="flex flex-col items-center mt-8 mb-10 animate-fadeIn">
                 <h1 className="text-6xl font-logo text-white mb-4 drop-shadow-lg">
                    {STRINGS.appName}
                 </h1>
                 
                 <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-gray-800 shadow-sm">
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                     </span>
                     <span className="text-xs font-mono text-gray-300 font-medium">24,103 {STRINGS.onlineUsers}</span>
                 </div>
            </div>

            {/* Main Action Container */}
            <div className="flex-1 w-full max-w-sm mx-auto flex flex-col justify-center space-y-8 pb-10">
                
                {/* Interests Section */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 flex items-center gap-1">
                        <Tags className="w-3 h-3" />
                        {STRINGS.interestsLabel}
                    </label>
                    <div className="bg-[#1c1c1c] border border-gray-800 rounded-xl p-3 min-h-[52px] flex flex-wrap gap-2 transition-all focus-within:border-gray-600 focus-within:bg-[#222]">
                        {interests.map((tag, idx) => (
                            <span key={idx} className="bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/30 text-xs px-2 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                                {tag}
                                <button onClick={() => removeInterest(tag)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                        <input 
                            type="text"
                            value={currentInterestInput}
                            onChange={(e) => setCurrentInterestInput(e.target.value)}
                            onKeyDown={handleInterestKeyDown}
                            placeholder={interests.length === 0 ? STRINGS.addInterestPlaceholder : ''}
                            className="bg-transparent border-none outline-none text-sm text-white flex-1 min-w-[100px] h-7 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Mode Toggle Switch */}
                <div className="bg-[#1c1c1c] p-1.5 rounded-2xl flex border border-gray-800 relative">
                    <button 
                        onClick={() => setChatMode('text')}
                        className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${chatMode === 'text' ? 'bg-white text-black shadow-md scale-[1.02]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <MessageSquareText className="w-4 h-4" />
                        {STRINGS.textChat}
                    </button>
                    <button 
                        onClick={() => setChatMode('video')}
                        className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${chatMode === 'video' ? 'bg-white text-black shadow-md scale-[1.02]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Video className="w-4 h-4" />
                        {STRINGS.videoChat}
                    </button>
                </div>

                {/* BIG START BUTTON */}
                <button 
                    onClick={() => startChat(chatMode)}
                    className="group relative w-full h-20 rounded-2xl overflow-hidden shadow-lg transition-transform active:scale-95 touch-manipulation"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-ig-gradientStart via-ig-gradientMid to-ig-gradientEnd animate-pulse group-hover:animate-none transition-all"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center gap-3">
                        <span className="text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">
                            {STRINGS.startChat}
                        </span>
                        <ArrowRight className="w-7 h-7 text-white drop-shadow-md group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

            </div>

            {/* Disclaimer Footer */}
            <div className="mt-auto text-center px-4 pb-4 opacity-40 hover:opacity-80 transition-opacity">
                <p className="text-[10px] text-gray-400 leading-tight">
                    By using {STRINGS.appName}, you accept our Terms of Service. 
                    <br/>
                    Please be respectful to others.
                </p>
            </div>

          </div>
        );
      case 'explore':
        return <div className="flex items-center justify-center h-full text-gray-500 font-light">Explore Feature Coming Soon</div>;
      case 'create':
        return <div className="flex items-center justify-center h-full text-gray-500 font-light">Create Feature Coming Soon</div>;
      case 'reels':
        return <div className="flex items-center justify-center h-full text-gray-500 font-light">Reels Feature Coming Soon</div>;
      case 'profile':
        return <div className="flex items-center justify-center h-full text-gray-500 font-light">Profile Feature Coming Soon</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans mx-auto max-w-md md:max-w-md md:border-x md:border-ig-darkSec shadow-2xl relative overflow-hidden">
      
      <main className="h-full h-screen w-full">
        {renderContent()}
      </main>

      {!isInChat && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default App;