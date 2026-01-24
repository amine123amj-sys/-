
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import ChatWindow from './components/ChatWindow';
import StoryRail from './components/StoryRail';
import CreateVideo from './components/CreateVideo';
import ReelsView from './components/ReelsView';
import ProfileView from './components/ProfileView';
import AuthScreen from './components/AuthScreen';
import StoryViewer from './components/StoryViewer';
import { Tab, ChatMode, Reel, Story, User, StoryItem } from './types';
import { STRINGS } from './constants';
import { Tags, Video, MessageSquareText, X, ArrowRight, Clapperboard, PlusSquare, Search, MessageCircle, Edit, ChevronDown, User as UserIcon, Heart, Share2, Grid } from 'lucide-react';

const DUMMY_REELS: any[] = [
  {
    id: 'live_1',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    username: 'سارة_لايف',
    userAvatar: 'https://picsum.photos/100/100?random=99',
    description: 'دردشة ومسابقات وجوائز! 🎁 تعالوا',
    likes: 0,
    comments: 0,
    shares: 0,
    category: 'live',
    isLive: true,
    liveViewers: 4500
  },
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
    boostConfig: {
      budget: '10',
      duration: '1',
      target: 'auto'
    },
    category: 'travel',
    tags: ['سفر', 'جبال']
  }
];

const INITIAL_STORIES: Story[] = [
  { 
      id: 'me', 
      username: 'قصتي', 
      avatar: 'https://picsum.photos/100/100?random=me', 
      isUser: true, 
      items: [], // Empty initially
      allViewed: false 
  },
  { 
      id: '102', 
      username: 'أحمد', 
      avatar: 'https://picsum.photos/100/100?random=2', 
      isUser: false, 
      allViewed: false,
      items: [
          { id: 's1', type: 'image', url: 'https://picsum.photos/500/900?random=s1', timestamp: Date.now() - 3600000, duration: 5 }
      ]
  },
  { 
      id: '103', 
      username: 'سارة', 
      avatar: 'https://picsum.photos/100/100?random=3', 
      isUser: false, 
      allViewed: false,
      items: [
          { id: 's2', type: 'text', content: 'صباح الخير جميعاً ☀️', background: 'linear-gradient(to right, #f12711, #f5af19)', timestamp: Date.now() - 7200000, duration: 5 },
          { id: 's3', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', timestamp: Date.now() - 7100000, duration: 10 }
      ]
  },
  { 
      id: '104', 
      username: 'علي', 
      avatar: 'https://picsum.photos/100/100?random=4', 
      isUser: false, 
      allViewed: true,
      items: [
           { id: 's4', type: 'image', url: 'https://picsum.photos/500/900?random=s4', timestamp: Date.now() - 10000000, duration: 5 }
      ]
  },
];

const MOCK_CHAT_USERS_DATA = [
    { id: 1, name: 'أحمد محمد', username: 'ahmed_m', msg: 'هلا، كيف الحال؟', time: 'الآن', active: true, unread: true, avatar: 'https://picsum.photos/100/100?random=200' },
    { id: 2, name: 'سارة', username: 'sara_art', msg: 'شكراً على المشاركة 🙏', time: '2د', active: false, unread: false, avatar: 'https://picsum.photos/100/100?random=201' },
    { id: 3, name: 'محمد علي', username: 'mo_ali', msg: 'أرسل لي الملف', time: '1س', active: true, unread: true, avatar: 'https://picsum.photos/100/100?random=202' },
    { id: 4, name: 'نور', username: 'nour_design', msg: 'فكرة ممتازة!', time: 'أمس', active: false, unread: false, avatar: 'https://picsum.photos/100/100?random=203' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInChat, setIsInChat] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false); 
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterestInput, setCurrentInterestInput] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  // تحويل مستخدمي الدردشة إلى حالة لحذف النقطة الزرقاء عند الضغط
  const [chatUsers, setChatUsers] = useState(MOCK_CHAT_USERS_DATA);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const [viewingStrangerProfile, setViewingStrangerProfile] = useState<any>(null);

  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  useEffect(() => {
      const checkAuth = () => {
          const storedUser = localStorage.getItem('nel_user_session');
          if (storedUser) {
              try {
                  const parsedUser = JSON.parse(storedUser);
                  setCurrentUser(parsedUser);
                  setStories(prev => {
                      const newStories = [...prev];
                      if(newStories.length > 0) {
                          newStories[0] = { ...newStories[0], avatar: parsedUser.avatar || newStories[0].avatar };
                      }
                      return newStories;
                  });
              } catch (e) {
                  console.error("Failed to parse user session");
              }
          }
          setIsLoadingAuth(false);
      };
      
      setTimeout(checkAuth, 1000);
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setStories(prev => {
        const newStories = [...prev];
        if(newStories.length > 0) {
            newStories[0] = { ...newStories[0], avatar: user.avatar };
        }
        return newStories;
    });
  };

  const handleLogout = () => {
      localStorage.removeItem('nel_user_session');
      setCurrentUser(null);
      setActiveTab('home');
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      localStorage.setItem('nel_user_session', JSON.stringify(updatedUser));
      
      setStories(prev => {
          const newStories = [...prev];
          if (newStories.length > 0 && newStories[0].isUser) {
              newStories[0] = { ...newStories[0], avatar: updatedUser.avatar };
          }
          return newStories;
      });
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
      setSelectedFriend(null);
      setIsInChat(true);
  };

  const openDirectChat = (user: any) => {
      // تعديل حالة المستخدم لإزالة النقطة الزرقاء
      setChatUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? { ...u, unread: false } : u)
      );
      setSelectedFriend(user);
      setChatMode('text');
      setIsInChat(true);
  };

  const handlePublishReel = (newReel: Reel) => {
      setReels(prev => [newReel, ...prev]);
      setActiveTab('reels');
  };

  const handlePublishStory = (newStoryItem: StoryItem) => {
      setStories(prev => {
          const updatedStories = [...prev];
          const userStoryIndex = updatedStories.findIndex(s => s.isUser);
          if (userStoryIndex !== -1) {
              updatedStories[userStoryIndex] = {
                  ...updatedStories[userStoryIndex],
                  items: [newStoryItem, ...updatedStories[userStoryIndex].items],
                  allViewed: false
              };
          }
          return updatedStories;
      });
      setShowStoryCreator(false);
  };

  const handleQuickPublishStory = () => {
      const quickItem: StoryItem = {
          id: Date.now(),
          type: 'image',
          url: `https://picsum.photos/500/900?random=${Date.now()}`,
          timestamp: Date.now(),
          duration: 5,
          viewers: 0
      };
      handlePublishStory(quickItem);
  };

  const handleStoryViewed = (storyId: string | number) => {
      setStories(prev => prev.map(s => {
          if (s.id === storyId && !s.allViewed) {
              return { ...s, allViewed: true };
          }
          return s;
      }));
  };

  const renderPublicProfile = () => {
      if (!viewingStrangerProfile) return null;
      return (
          <div className="absolute inset-0 z-[80] bg-black animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="flex items-center p-4 border-b border-gray-900">
                  <button onClick={() => setViewingStrangerProfile(null)} className="p-2"><ArrowRight className="w-6 h-6 text-white rtl:rotate-0 ltr:rotate-180" /></button>
                  <h3 className="flex-1 text-center font-bold text-white">{viewingStrangerProfile.username}</h3>
                  <div className="w-10"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#0095f6] to-[#0033cc] mb-4">
                      <img src={viewingStrangerProfile.avatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-1">{viewingStrangerProfile.name}</h2>
                  <p className="text-gray-400 text-sm mb-6">@{viewingStrangerProfile.username}</p>
                  
                  <div className="flex w-full justify-around mb-8 border-y border-gray-900 py-4">
                      <div className="text-center"><p className="font-bold text-white">1.2k</p><p className="text-[10px] text-gray-500 uppercase">متابعين</p></div>
                      <div className="text-center"><p className="font-bold text-white">340</p><p className="text-[10px] text-gray-500 uppercase">يتابع</p></div>
                      <div className="text-center"><p className="font-bold text-white">56</p><p className="text-[10px] text-gray-500 uppercase">فيديو</p></div>
                  </div>

                  <div className="w-full space-y-4">
                      <button className="w-full bg-[#0095f6] text-white py-3 rounded-xl font-bold">متابعة</button>
                      <button onClick={() => setViewingStrangerProfile(null)} className="w-full bg-[#262626] text-white py-3 rounded-xl font-bold">إرسال رسالة</button>
                  </div>

                  <div className="w-full mt-8">
                       <h4 className="font-bold text-sm text-gray-500 mb-4 border-b border-gray-900 pb-2 flex items-center gap-2"><Grid className="w-4 h-4" /> المنشورات</h4>
                       <div className="grid grid-cols-3 gap-1">
                           {[...Array(9)].map((_, i) => (
                               <div key={i} className="aspect-[3/4] bg-gray-900 rounded overflow-hidden">
                                   <img src={`https://picsum.photos/200/300?random=${i+50}`} className="w-full h-full object-cover opacity-60" />
                               </div>
                           ))}
                       </div>
                  </div>
              </div>
          </div>
      );
  };
  
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

  if (isInChat) {
      return (
        <div className="h-full w-full relative">
            <ChatWindow 
                onBack={() => { setIsInChat(false); setSelectedFriend(null); }} 
                interests={interests} 
                mode={chatMode} 
                targetUser={selectedFriend}
                onViewProfile={(u) => setViewingStrangerProfile(u)}
            />
            {renderPublicProfile()}
        </div>
      );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col h-full bg-black text-white relative overflow-y-auto no-scrollbar pb-24">
            
            <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 py-3">
                 <h1 className="text-3xl font-logo text-white select-none">
                    {STRINGS.appName}
                 </h1>
                 <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border border-gray-800">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                         <span className="text-[10px] font-bold text-gray-400">24K</span>
                     </div>
                     <button onClick={() => setActiveTab('explore')} className="hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6 hover:text-[#0095f6] transition-colors cursor-pointer" />
                     </button>
                 </div>
            </div>

            <div className="mt-2 border-b border-gray-900 pb-2">
                <StoryRail 
                    stories={stories} 
                    onOpenStory={(index) => setViewingStoryIndex(index)}
                    onCreateStory={handleQuickPublishStory} // تم التعديل للنشر الفوري
                />
            </div>

            <div className="flex-1 w-full max-w-sm mx-auto flex flex-col justify-center space-y-8 p-6">
                <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        مرحباً، {currentUser.name.split(' ')[0]}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">ابدأ محادثة عشوائية مع أشخاص من حول العالم</p>
                </div>

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

                <button 
                    onClick={() => startChat(chatMode)}
                    className="group relative w-full h-20 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,100,224,0.4)] transition-all active:scale-95 touch-manipulation hover:shadow-[0_20px_50px_-10px_rgba(0,149,246,0.6)] animate-in slide-in-from-bottom-10 duration-1000"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0044cc] to-[#0095f6]"></div>
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
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
        return <ReelsView reels={reels} onLoadMore={() => {}} onToggleFullScreen={(full) => setIsFullScreen(full)} />;
      case 'create':
        return <CreateVideo onClose={() => setActiveTab('home')} onPublishReel={handlePublishReel} onPublishStory={handlePublishStory} />;
      case 'explore': 
        const filteredUsers = chatUsers.filter(u => 
            u.name.toLowerCase().includes(messageSearchQuery.toLowerCase()) || 
            u.username.toLowerCase().includes(messageSearchQuery.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full bg-black pb-20">
              <div className="px-4 pb-4 pt-4 sticky top-0 bg-black z-20 border-b border-gray-900/50">
                  <div className="bg-[#262626] rounded-xl flex items-center px-3 py-2 gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input 
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        placeholder="بحث" 
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-400"
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                 <h3 className="px-4 text-sm font-bold text-white mb-2 pt-2">الرسائل</h3>
                 {filteredUsers.map(user => (
                     <div 
                        key={user.id} 
                        onClick={() => openDirectChat(user)}
                        className="flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer active:bg-gray-800 transition-colors"
                     >
                        <div className="relative">
                            <img src={user.avatar} className="w-14 h-14 rounded-full object-cover border border-gray-800" />
                            {user.active && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-medium text-white text-sm ${user.unread ? 'font-black' : ''}`}>{user.name}</h4>
                            <div className="flex items-center gap-2">
                                <p className={`text-sm truncate max-w-[200px] ${user.unread ? 'text-white font-bold' : 'text-gray-400'}`}>
                                    {user.msg}
                                </p>
                                <span className="text-gray-500 text-xs">• {user.time}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {user.unread && (
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                            )}
                            <div className="bg-[#262626] p-2 rounded-full">
                                <Video className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                     </div>
                 ))}
              </div>
          </div>
        );
      case 'profile':
        return <ProfileView currentUser={currentUser} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white font-sans mx-auto overflow-hidden relative">
        <div className="absolute inset-0 w-full h-full">
            {renderContent()}
        </div>
        
        {viewingStoryIndex !== null && (
            <StoryViewer 
                stories={stories} 
                initialStoryIndex={viewingStoryIndex} 
                onClose={() => setViewingStoryIndex(null)} 
                onStoryViewed={handleStoryViewed}
            />
        )}

        {showStoryCreator && (
            <div className="absolute inset-0 z-[60]">
                <CreateVideo 
                    onClose={() => setShowStoryCreator(false)} 
                    onPublishReel={handlePublishReel} 
                    onPublishStory={handlePublishStory}
                    initialMode="STORY"
                />
            </div>
        )}
        
        {!isInChat && !selectedFriend && activeTab !== 'create' && !showStoryCreator && !isFullScreen && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
    </div>
  );
};

export default App;
