import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import ChatWindow from './components/ChatWindow';
import StoryRail from './components/StoryRail';
import CreateVideo from './components/CreateVideo';
import ReelsView from './components/ReelsView';
import { Tab, ChatMode, Reel, Story } from './types';
import { STRINGS } from './constants';
import { Tags, Video, MessageSquareText, X, ArrowRight, Clapperboard, PlusSquare, Search, User, MessageCircle } from 'lucide-react';

const DUMMY_REELS: Reel[] = [
  {
    id: '1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    username: 'بحر_الهدوء',
    userAvatar: 'https://picsum.photos/100/100?random=10',
    description: 'يوم جميل على الشاطئ 🌊 #صيف',
    likes: 1240,
    comments: 45,
    shares: 12
  },
  {
    id: '2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    username: 'طبيعة_ساحرة',
    userAvatar: 'https://picsum.photos/100/100?random=11',
    description: 'جمال الربيع 🌸',
    likes: 850,
    comments: 20,
    shares: 5,
    isBoosted: true
  },
  {
    id: '3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cheering-crowd-loud-at-a-concert-460-large.mp4',
    username: 'موسيقى_لايف',
    userAvatar: 'https://picsum.photos/100/100?random=12',
    description: 'أجواء الحفلة لا توصف! 🔥🎸',
    likes: 5600,
    comments: 300,
    shares: 450
  }
];

const DUMMY_STORIES: Story[] = [
  { id: 101, name: 'قصتي', img: 'https://picsum.photos/100/100?random=me', isUser: true },
  { id: 102, name: 'أحمد', img: 'https://picsum.photos/100/100?random=2', isUser: false },
  { id: 103, name: 'سارة', img: 'https://picsum.photos/100/100?random=3', isUser: false },
  { id: 104, name: 'علي', img: 'https://picsum.photos/100/100?random=4', isUser: false },
  { id: 105, name: 'نور', img: 'https://picsum.photos/100/100?random=5', isUser: false },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInChat, setIsInChat] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  
  // Data State
  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS);
  const [stories, setStories] = useState<Story[]>(DUMMY_STORIES);

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

  const handlePublishReel = (newReel: Reel) => {
      setReels(prev => [newReel, ...prev]);
      setActiveTab('reels');
  };

  const handlePublishStory = (newStory: Story) => {
      // Logic: Update the user's story or add it if not exists. 
      // For this demo, we assume the first item is the user placeholder and we update it/add to it.
      // But simplest visualization is just ensuring "My Story" is active or adding next to it.
      // Let's just update the first item to indicate active story
      const updatedStories = [...stories];
      updatedStories[0] = { ...updatedStories[0], ...newStory, isUser: true };
      setStories(updatedStories);
      setActiveTab('home');
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
      case 'reels':
        return <ReelsView reels={reels} />;
      case 'create':
        return <CreateVideo onClose={() => setActiveTab('home')} onPublishReel={handlePublishReel} onPublishStory={handlePublishStory} />;
      case 'explore': // This is essentially the "Inbox" logic now based on icons
        return (
          <div className="flex flex-col h-full bg-black">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">الرسائل</h2>
                  <MessageCircle className="w-6 h-6" />
              </div>
              <StoryRail stories={stories} />
              <div className="flex-1 overflow-y-auto">
                 {[1,2,3,4,5].map(i => (
                     <div key={i} className="flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer">
                        <img src={`https://picsum.photos/50/50?random=${i}`} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">مستخدم {i}</h4>
                            <p className="text-xs text-gray-400">مرحبا، هل أنت موجود؟</p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     </div>
                 ))}
              </div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 font-light space-y-4">
              <User className="w-16 h-16 opacity-50" />
              <p className="text-xl">الملف الشخصي</p>
              <p className="text-sm opacity-60">تعديل بياناتك</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans mx-auto max-w-md md:max-w-full h-screen flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-hidden relative">
            {renderContent()}
        </div>
        {/* Hide Bottom Nav when in Chat or Create Mode */}
        {!isInChat && activeTab !== 'create' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
    </div>
  );
};

export default App;