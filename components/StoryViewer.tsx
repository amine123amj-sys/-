import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story, StoryItem } from '../types';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryIndex, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');
  
  const activeStory = stories[currentStoryIndex];
  const activeItem = activeStory?.items[currentItemIndex];
  
  const intervalRef = useRef<any>(null);

  // Reset item index when switching users
  useEffect(() => {
    setCurrentItemIndex(0);
    setProgress(0);
  }, [currentStoryIndex]);

  // Handle Progress and Auto-Navigation
  useEffect(() => {
    if (!activeItem || isPaused) return;

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
  }, [activeItem, currentItemIndex, currentStoryIndex, isPaused]);

  const handleNextItem = () => {
    if (currentItemIndex < activeStory.items.length - 1) {
      // Next Item in same story
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // Next User Story
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
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
        setCurrentStoryIndex(prev => prev - 1);
      } else {
        // Stay on first item of first user or close? 
        // Instagram usually stays or goes back to feed. Let's restart item.
        setProgress(0); 
      }
    }
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const sendReaction = (emoji: string) => {
    // Logic to send reaction would go here
    console.log(`Reacted with ${emoji} to story ${activeItem?.id}`);
    // Show some visual feedback
  };

  if (!activeStory || !activeItem) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
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
                    <button className="text-white"><MoreHorizontal /></button>
                    <button onClick={onClose} className="text-white"><X className="w-6 h-6" /></button>
                </div>
            </div>
        </div>

        {/* Bottom Interaction Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent z-20">
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
                 <button className="p-2 text-white"><Send className="w-6 h-6 -rotate-45 mb-1" /></button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;