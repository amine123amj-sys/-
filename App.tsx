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
import { Tags, Video, MessageSquareText, X, ArrowRight, Clapperboard, PlusSquare, Search, MessageCircle, Edit } from 'lucide-react';

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
    shares: 12,
    category: 'nature',
    tags: ['صيف', 'بحر', 'طبيعة']
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
    isBoosted: true,
    category: 'travel',
    tags: ['سفر', 'جبال']
  },
  {
    id: '3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    username: 'مغامرات',
    userAvatar: 'https://picsum.photos/100/100?random=12',
    description: 'هل جربت هذا من قبل؟ 🔥🎸',
    likes: 5600,
    comments: 300,
    shares: 450,
    category: 'adventure',
    tags: ['مغامرة', 'اكشن']
  }
];

const DUMMY_STORIES: Story[] = [
  { id: 101, name: 'قصتي', img: 'https://picsum.photos/100/100?random=me', isUser: true },
  { id: 102, name: 'أحمد', img: 'https://picsum.photos/100/100?random=2', isUser: false },
  { id: 103, name: 'سارة', img: 'https://picsum.photos/100/100?random=3', isUser: false },
  { id: 104, name: 'علي', img: 'https://picsum.photos/100/100?random=4', isUser: false },
  { id: 105, name: 'نور', img: 'https://picsum.photos/100/100?random=5', isUser: false },
  { id: 106, name: 'تيك_تو', img: 'https://picsum.photos/100/100?random=6', isUser: false },
  { id: 107, name: 'جيمر', img: 'https://picsum.photos/100/100?random=7', isUser: false },
];

const MOCK_CHAT_USERS = [
    { id: 1, name: 'أحمد محمد', username: 'ahmed_m', msg: 'هلا، كيف الحال؟', time: 'الآن', active: true, avatar: 'https://picsum.photos/100/100?random=200' },
    { id: 2, name: 'سارة', username: 'sara_art', msg: 'شكراً على المشاركة 🙏', time: '2د', active: false, avatar: 'https://picsum.photos/100/100?random=201' },
    { id: 3, name: 'Khaled Gamer', username: 'khaled_g', msg: 'شفت الفيديو الجديد؟', time: '1س', active: true, avatar: 'https://picsum.photos/100/100?random=202' },
    { id: 4, name: 'Unknown User', username: 'user_992', msg: 'مرحبا', time: '5س', active: false, avatar: 'https://picsum.photos/100/100?random=203' },
    { id: 5, name: 'نور الهدى', username: 'noor_life', msg: '❤️ أحببت صورتك', time: '1ي', active: false, avatar: 'https://picsum.photos/100/100?random=204' },
    { id: 6, name: 'Mohamed Ali', username: 'mo_h', msg: 'تم الإرسال', time: '1ي', active: false, avatar: 'https://picsum.photos/100/100?random=205' },
    { id: 7, name: 'Designer X', username: 'design_pro', msg: 'أرسل لي التفاصيل', time: '2ي', active: true, avatar: 'https://picsum.photos/100/100?random=206' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInChat, setIsInChat] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  
  // Search State for Messages
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

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

  // Simulate Recommendation Algorithm (Lazy Loading)
  const handleLoadMoreReels = () => {
      // Create random reels to simulate infinite scroll
      const randomVideos = [
          'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      ];
      
      const newReels: Reel[] = Array.from({ length: 3 }).map((_, i) => ({
          id: `new_${Date.now()}_${i}`,
          videoUrl: randomVideos[Math.floor(Math.random() * randomVideos.length)],
          username: `user_${Math.floor(Math.random() * 1000)}`,
          userAvatar: `https://picsum.photos/100/100?random=${Date.now() + i}`,
          description: 'فيديو مقترح لك 🌟 #foryou',
          likes: Math.floor(Math.random() * 5000),
          comments: Math.floor(Math.random() * 200),
          shares: Math.floor(Math.random() * 100),
          category: 'random',
          tags: ['foryou', 'viral']
      }));

      // Simulate network delay
      setTimeout(() => {
          setReels(prev => [...prev, ...newReels]);
      }, 1000);
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
          <div className="flex flex-col h-full bg-black text-white relative overflow-y-auto no-scrollbar pb-24">
            
            {/* --- Instagram Style Header --- */}
            <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 py-3">
                 <h1 className="text-3xl font-logo text-white select-none">
                    {STRINGS.appName}
                 </h1>
                 <div className="flex items-center gap-4">
                     {/* Future Online Count Badge */}
                     <div className="flex items-center gap-1.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border border-gray-800">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                         <span className="text-[10px] font-bold text-gray-400">24K</span>
                     </div>
                     <MessageCircle className="w-6 h-6 hover:text-[#0095f6] transition-colors cursor-pointer" />
                 </div>
            </div>

            {/* --- STORIES RAIL (Added here for Instagram feel) --- */}
            <div className="mt-2 border-b border-gray-900 pb-2">
                <StoryRail stories={stories} />
            </div>

            {/* Main Action Container */}
            <div className="flex-1 w-full max-w-sm mx-auto flex flex-col justify-center space-y-8 p-6">
                
                {/* Greeting */}
                <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        مرحباً، {currentUser.name.split(' ')[0]}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">ابدأ محادثة عشوائية مع أشخاص من حول العالم</p>
                </div>

                {/* Interests Section */}
                <div className="space-y-2 animate-in slide-in-from-bottom-6 duration-700">
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
                <div className="bg-[#1c1c1c] p-1.5 rounded-2xl flex border border-gray-800 relative animate-in slide-in-from-bottom-8 duration-700">
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
                    className="group relative w-full h-20 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,100,224,0.4)] transition-all active:scale-95 touch-manipulation hover:shadow-[0_20px_50px_-10px_rgba(0,149,246,0.6)] animate-in slide-in-from-bottom-10 duration-1000"
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
          </div>
        );
      case 'reels':
        return <ReelsView reels={reels} onLoadMore={handleLoadMoreReels} />;
      case 'create':
        return <CreateVideo onClose={() => setActiveTab('home')} onPublishReel={handlePublishReel} onPublishStory={handlePublishStory} />;
      case 'explore': 
        // If a friend is selected, show their chat window
        if (selectedFriend) {
            return (
                <ChatWindow 
                    onBack={() => setSelectedFriend(null)} 
                    interests={[]} 
                    mode="text" 
                    targetUser={selectedFriend}
                />
            );
        }

        const filteredUsers = MOCK_CHAT_USERS.filter(u => 
            u.name.toLowerCase().includes(messageSearchQuery.toLowerCase()) || 
            u.username.toLowerCase().includes(messageSearchQuery.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full bg-black pb-20">
              <div className="p-4 flex justify-between items-center sticky top-0 bg-black z-20">
                  <h2 className="text-xl font-bold">{currentUser.username}</h2>
                  <Edit className="w-6 h-6" />
              </div>
              
              {/* Search Bar */}
              <div className="px-4 pb-4 sticky top-14 bg-black z-20">
                  <div className="bg-[#262626] rounded-xl flex items-center px-3 py-2 gap-2 transition-all focus-within:ring-1 focus-within:ring-gray-600">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input 
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        placeholder="بحث" 
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-400"
                      />
                      {messageSearchQuery && (
                          <button onClick={() => setMessageSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>
                      )}
                  </div>
              </div>

              <div className="mb-2">
                 <h3 className="px-4 text-sm font-bold text-gray-300 mb-2">الأصدقاء المقربون</h3>
                 <StoryRail stories={stories} />
              </div>

              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-800">
                  <span className="font-bold text-sm">الرسائل</span>
                  <span className="text-[#0095f6] text-sm font-semibold cursor-pointer">الطلبات</span>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                 {filteredUsers.length > 0 ? (
                     filteredUsers.map(user => (
                         <div 
                            key={user.id} 
                            onClick={() => setSelectedFriend(user)}
                            className="flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer active:bg-gray-800 transition-colors"
                         >
                            <div className="relative">
                                <img src={user.avatar} className="w-14 h-14 rounded-full border border-gray-800" />
                                {user.active && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">{user.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                    <p className={`${user.active ? 'text-white font-medium' : ''} truncate max-w-[150px]`}>{user.msg}</p>
                                    <span>·</span>
                                    <span>{user.time}</span>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-white"><MessageCircle className="w-5 h-5 opacity-50" /></button>
                         </div>
                     ))
                 ) : (
                     <div className="flex flex-col items-center justify-center py-10 text-gray-500 opacity-70">
                         <Search className="w-10 h-10 mb-2" />
                         <p className="text-sm">لا توجد نتائج لـ "{messageSearchQuery}"</p>
                     </div>
                 )}
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
        {!isInChat && !selectedFriend && activeTab !== 'create' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
    </div>
  );
};

export default App;