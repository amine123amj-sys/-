
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Search, Check, RotateCcw } from 'lucide-react';
import { Story, StoryItem } from '../types';

// Mock users for share functionality
const SHARE_USERS = [
  { id: 1, username: 'ali_gamer', name: 'Ali Hassan', avatar: 'https://picsum.photos/50/50?random=101' },
  { id: 2, username: 'nour_beauty', name: 'Nour Style', avatar: 'https://picsum.photos/50/50?random=102' },
  { id: 3, username: 'tech_master', name: 'Tech Reviewer', avatar: 'https://picsum.photos/50/50?random=103' },
  { id: 4, username: 'chef_om', name: 'Chef Omar', avatar: 'https://picsum.photos/50/50?random=104' },
  { id: 5, username: 'travel_jo', name: 'Jordan Travels', avatar: 'https://picsum.photos/50/50?random=105' },
  { id: 6, username: 'sport_life', name: 'Captain Majed', avatar: 'https://picsum.photos/50/50?random=106' },
];

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onStoryViewed: (storyId: string | number) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryIndex, onClose, onStoryViewed }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');
  
  // Share State
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareSearch, setShareSearch] = useState('');
  const [sentUsers, setSentUsers] = useState<number[]>([]);

  const activeStory = stories[currentStoryIndex];
  const activeItem = activeStory?.items[currentItemIndex];
  
  const intervalRef = useRef<any>(null);

  // Mark story as viewed when it becomes active
  useEffect(() => {
    if (activeStory && !activeStory.allViewed) {
        onStoryViewed(activeStory.id);
    }
  }, [currentStoryIndex, activeStory, onStoryViewed]);

  // Handle Progress and Auto-Navigation
  useEffect(() => {
    if (!activeItem || isPaused || showShareSheet) return;

    const step = 100 / (activeItem.duration * 20); // 50ms interval
    
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextItem();
          return 0;
        }
        return prev + step;
      });
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [activeItem, currentItemIndex, currentStoryIndex, isPaused, showShareSheet]);

  const handleNextItem = () => {
    if (currentItemIndex < activeStory.items.length - 1) {
      // Next Item in same story
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Next User Story
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
        setCurrentItemIndex(0); // Start from beginning of next story
        setProgress(0);
      } else {
        onClose(); // End of all stories
      }
    }
  };

  const handlePrevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Prev User Story
      if (currentStoryIndex > 0) {
        const prevIndex = currentStoryIndex - 1;
        setCurrentStoryIndex(prevIndex);
        // Start from BEGINNING of previous story to allow re-watching
        setCurrentItemIndex(0);
        setProgress(0); 
      } else {
        // Restart current story if at first item
        setCurrentItemIndex(0);
        setProgress(0);
      }
    }
  };

  const restartStory = () => {
      setCurrentItemIndex(0);
      setProgress(0);
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const sendReaction = (emoji: string) => {
    console.log(`Reacted with ${emoji} to story ${activeItem?.id}`);
  };

  const toggleSendToUser = (id: number) => {
      if (sentUsers.includes(id)) {
          setSentUsers(prev => prev.filter(uid => uid !== id));
      } else {
          setSentUsers(prev => [...prev, id]);
      }
  };

  if (!activeStory || !activeItem) return null;

  return (
    // Adjusted Z-index to 50 so BottomNav (z-70) can sit on top
    <div className="fixed inset-0 z-[50] bg-black flex flex-col pb-20"> 
      {/* Background Blur (optional aesthetic) */}
      <div className="absolute inset-0 bg-gray-900">
          {activeItem.type === 'image' && <img src={activeItem.url} className="w-full h-full object-cover opacity-50 blur-xl" />}
      </div>

      {/* Main Content Container */}
      <div 
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media */}
        {activeItem.type === 'image' && (
            <img src={activeItem.url} className="w-full h-full object-contain bg-black" alt="story" />
        )}
        {activeItem.type === 'video' && (
            <video 
                src={activeItem.url} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline 
                muted
                onEnded={handleNextItem} 
            />
        )}
        {activeItem.type === 'text' && (
            <div 
                className="w-full h-full flex items-center justify-center p-8 text-center"
                style={{ background: activeItem.background || 'linear-gradient(45deg, #FF0099, #493240)' }}
            >
                <p className="text-white font-bold text-3xl font-logo leading-relaxed">{activeItem.content}</p>
            </div>
        )}

        {/* Tap Navigation Zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrevItem(); }}></div>
        <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNextItem(); }}></div>

        {/* Top Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/60 to-transparent pt-6">
            {/* Progress Bars */}
            <div className="flex gap-1 mb-3">
                {activeStory.items.map((item, idx) => (
                    <div key={item.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{ 
                                width: idx < currentItemIndex ? '100%' : idx === currentItemIndex ? `${progress}%` : '0%' 
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Header Info */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src={activeStory.avatar} className="w-8 h-8 rounded-full border border-white/50" />
                    <span className="text-white font-semibold text-sm shadow-black drop-shadow-md">{activeStory.username}</span>
                    <span className="text-white/70 text-xs">{Math.floor((Date.now() - activeItem.timestamp) / 3600000)}h</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); restartStory(); }} className="text-white bg-black/20 rounded-full p-1 backdrop-blur-sm hover:bg-black/40"><RotateCcw className="w-5 h-5" /></button>
                    <button onClick={onClose} className="text-white bg-black/20 rounded-full p-1 backdrop-blur-sm hover:bg-black/40"><X className="w-6 h-6" /></button>
                </div>
            </div>
        </div>

        {/* Bottom Interaction Overlay - Moved up slightly to clear Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-4 bg-gradient-to-t from-black/80 to-transparent z-20">
             {/* Quick Reactions (If not user's story) */}
             {!activeStory.isUser && (
                <div className="flex justify-center gap-6 mb-4">
                    {['😂', '😮', '😍', '😢', '👏', '🔥'].map(emoji => (
                        <button 
                            key={emoji} 
                            onClick={(e) => { e.stopPropagation(); sendReaction(emoji); }}
                            className="text-3xl hover:scale-125 transition-transform active:scale-95"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
             )}

             <div className="flex items-center gap-3">
                 {!activeStory.isUser ? (
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="إرسال رسالة..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onFocus={() => setIsPaused(true)}
                            onBlur={() => setIsPaused(false)}
                            className="w-full bg-transparent border border-white/40 rounded-full py-2.5 px-4 text-white placeholder-white/70 text-sm focus:border-white outline-none backdrop-blur-md"
                        />
                         {message && (
                             <button className="absolute left-2 top-1/2 -translate-y-1/2 text-[#0095f6] font-bold text-sm">إرسال</button>
                         )}
                    </div>
                 ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 text-white/80 py-2 bg-white/10 rounded-full backdrop-blur-md">
                        <span className="text-xs font-bold">👀 {activeItem.viewers || 0} مشاهدة</span>
                    </div>
                 )}
                 
                 <button className="p-2 text-white"><Heart className="w-6 h-6" /></button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setShowShareSheet(true); }}
                    className="p-2 text-white"
                 >
                    <Send className="w-6 h-6 -rotate-45 mb-1" />
                 </button>
             </div>
        </div>

      </div>

      {/* SHARE SHEET OVERLAY */}
      {showShareSheet && (
          <div 
              className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/60 pb-20"
              onClick={(e) => { e.stopPropagation(); setShowShareSheet(false); }}
          >
              <div 
                  className="bg-[#1c1c1c] w-full rounded-t-2xl p-4 flex flex-col animate-in slide-in-from-bottom duration-300 gap-4 max-h-[60vh]"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex justify-center"><div className="w-10 h-1 bg-gray-500 rounded-full"></div></div>
                  <div className="text-center font-bold text-white mb-2">إرسال إلى</div>

                  {/* Search */}
                  <div className="relative">
                      <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                          type="text"
                          value={shareSearch}
                          onChange={(e) => setShareSearch(e.target.value)}
                          placeholder="بحث..."
                          className="w-full bg-[#262626] rounded-xl py-2 pr-9 pl-3 text-sm text-white placeholder-gray-400 outline-none"
                      />
                  </div>

                  {/* Users Grid */}
                  <div className="grid grid-cols-4 gap-4 overflow-y-auto no-scrollbar py-2 px-1">
                      {SHARE_USERS.filter(u => u.name.includes(shareSearch) || u.username.includes(shareSearch)).map(user => {
                          const isSent = sentUsers.includes(user.id);
                          return (
                              <div key={user.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => toggleSendToUser(user.id)}>
                                  <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative group-hover:scale-105 transition-transform">
                                      <img src={user.avatar} className={`w-full h-full object-cover transition-opacity ${isSent ? 'opacity-50' : ''}`} />
                                      {isSent && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                              <Check className="w-6 h-6 text-white" />
                                          </div>
                                      )}
                                  </div>
                                  <span className="text-[10px] text-gray-300 truncate w-full text-center">{user.name.split(' ')[0]}</span>
                                  <button 
                                      className={`text-[10px] px-3 py-1 rounded-full transition-all duration-300 font-bold w-full ${
                                          isSent ? 'bg-gray-700 text-gray-400' : 'bg-[#0095f6] text-white hover:bg-[#0085dd]'
                                      }`}
                                  >
                                      {isSent ? 'تم' : 'إرسال'}
                                  </button>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default StoryViewer;
