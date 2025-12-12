import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import ChatWindow from './components/ChatWindow';
import StoryRail from './components/StoryRail';
import CreateVideo from './components/CreateVideo';
import ReelsView from './components/ReelsView';
import ProfileView from './components/ProfileView';
import AuthScreen from './components/AuthScreen';
import { Tab, ChatMode, Reel, Story, User } from './types';
import { STRINGS } from './constants';
import { Tags, Video, MessageSquareText, X, ArrowRight, Clapperboard, PlusSquare, Search, MessageCircle } from 'lucide-react';

// Using reliable Google sample videos to ensure playback works
const DUMMY_REELS: Reel[] = [
  {
    id: '1',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    username: 'بحر_الهدوء',
    userAvatar: 'https://picsum.photos/100/100?random=10',
    description: 'يوم جميل على الشاطئ 🌊 #صيف',
    likes: 1240,
    comments: 45,
    shares: 12
  },
  {
    id: '2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: 'طبيعة_ساحرة',
    userAvatar: 'https://picsum.photos/100/100?random=11',
    description: 'جمال الطبيعة الخلاب 🏔️',
    likes: 850,
    comments: 20,
    shares: 5,
    isBoosted: true
  },
  {
    id: '3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'مغامرات',
    userAvatar: 'https://picsum.photos/100/100?random=12',
    description: 'هل جربت هذا من قبل؟ 🔥🎸',
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInChat, setIsInChat] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  
  // Data State
  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS);
  const [stories, setStories] = useState<Story[]>(DUMMY_STORIES);

  // --- AUTH CHECK ON MOUNT ---
  useEffect(() => {
      const checkAuth = () => {
          const storedUser = localStorage.getItem('nel_user_session');
          if (storedUser) {
              try {
                  const parsedUser = JSON.parse(storedUser);
                  setCurrentUser(parsedUser);
                  // Update Stories with user avatar if exists
                  setStories(prev => {
                      const newStories = [...prev];
                      if(newStories.length > 0) {
                          newStories[0] = { ...newStories[0], img: parsedUser.avatar || newStories[0].img };
                      }
                      return newStories;
                  });
              } catch (e) {
                  console.error("Failed to parse user session");
              }
          }
          setIsLoadingAuth(false);
      };
      
      // Simulate splash screen delay
      setTimeout(checkAuth, 1000);
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      // Update Stories placeholder
      setStories(prev => {
        const newStories = [...prev];
        if(newStories.length > 0) {
            newStories[0] = { ...newStories[0], img: user.avatar };
        }
        return newStories;
    });
  };

  const handleLogout = () => {
      localStorage.removeItem('nel_user_session');
      setCurrentUser(null);
      setActiveTab('home');
  };

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
      const updatedStories = [...stories];
      updatedStories[0] = { ...updatedStories[0], ...newStory, isUser: true };
      setStories(updatedStories);
      setActiveTab('home');
  };

  // --- RENDER ---
  
  if (isLoadingAuth) {
      return (
          <div className="h-screen w-full bg-black flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <h1 className="font-logo text-6xl text-white mb-4 animate-pulse">{STRINGS.appName}</h1>
                  <div className="w-6 h-6 border-2 border-[#0095f6] border-t-transparent rounded-full animate-spin"></div>
              </div>
          </div>
      );
  }

  if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        if (isInChat) {
             return <ChatWindow onBack={() => setIsInChat(false)} interests={interests} mode={chatMode} />;
        }
        return (
          <div className="flex flex-col h-full bg-black text-white p-6 relative overflow-y-auto no-scrollbar pb-24">
            
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
                
                {/* Greeting */}
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-200">مرحباً، {currentUser.name.split(' ')[0]} 👋</h2>
                    <p className="text-gray-500 text-xs mt-1">هل أنت مستعد لمحادثة جديدة؟</p>
                </div>

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

                {/* BIG START BUTTON - ADVANCED & NO BORDER */}
                <button 
                    onClick={() => startChat(chatMode)}
                    className="group relative w-full h-20 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,100,224,0.4)] transition-all active:scale-95 touch-manipulation hover:shadow-[0_20px_50px_-10px_rgba(0,149,246,0.6)]"
                >
                    {/* Advanced Gradient Background - No Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0044cc] to-[#0095f6]"></div>
                    
                    {/* Subtle Top Highlight for 3D Depth (Glass effect) */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Texture & Shine Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
                    <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine skew-x-12 transition-all duration-1000"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
                        <span className="text-2xl font-black text-white tracking-wide uppercase drop-shadow-lg group-hover:scale-105 transition-transform">
                            {STRINGS.startChat}
                        </span>
                        <div className="bg-white/5 p-2 rounded-full backdrop-blur-md group-hover:bg-white group-hover:text-[#0095f6] transition-colors duration-300">
                             <ArrowRight className="w-6 h-6 text-white group-hover:text-[#0095f6] group-hover:translate-x-1 transition-transform" />
                        </div>
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
      case 'explore': 
        return (
          <div className="flex flex-col h-full bg-black pb-20">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold">الرسائل</h2>
                  <MessageCircle className="w-6 h-6" />
              </div>
              <StoryRail stories={stories} />
              <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
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
        return <ProfileView currentUser={currentUser} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white font-sans mx-auto overflow-hidden relative">
        <div className="absolute inset-0 w-full h-full">
            {renderContent()}
        </div>
        
        {/* Navigation Bar - Absolute positioned at bottom */}
        {/* Only hide in active Chat or Create Camera mode to allow full screen */}
        {!isInChat && activeTab !== 'create' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
    </div>
  );
};

export default App;