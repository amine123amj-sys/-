import React from 'react';
import { Story } from '../types';
import { Plus } from 'lucide-react';

interface StoryRailProps {
  stories: Story[];
  onOpenStory: (index: number) => void;
  onCreateStory: () => void;
}

const StoryRail: React.FC<StoryRailProps> = ({ stories, onOpenStory, onCreateStory }) => {
  return (
    <div className="w-full relative">
        <div className="flex space-x-4 space-x-reverse overflow-x-auto px-4 py-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {stories.map((story, index) => (
            <div 
                key={story.id} 
                className="snap-center flex flex-col items-center flex-shrink-0 space-y-2 cursor-pointer group"
                onClick={() => {
                    if (story.isUser && story.items.length === 0) {
                        onCreateStory();
                    } else {
                        onOpenStory(index);
                    }
                }}
            >
              <div className={`relative p-[3px] rounded-full transition-transform duration-300 group-hover:scale-105 ${
                  story.isUser && story.items.length === 0
                  ? 'bg-transparent border-2 border-dashed border-gray-600' // Empty state for user
                  : story.allViewed 
                    ? 'bg-gray-600' // Viewed state
                    : 'bg-gradient-to-tr from-[#0095f6] to-[#0033cc] shadow-[0_0_10px_rgba(0,149,246,0.5)]' // Active state (Blue Theme)
              }`}>
                <div className="p-[2px] bg-black rounded-full relative overflow-hidden">
                  <img 
                    src={story.avatar} 
                    alt={story.username} 
                    className="w-16 h-16 rounded-full object-cover transition-opacity group-hover:opacity-80"
                  />
                </div>
                
                {/* Plus Icon for current user (Add Story) */}
                {story.isUser && (
                   <div 
                        onClick={(e) => { e.stopPropagation(); onCreateStory(); }}
                        className="absolute bottom-0 right-0 bg-[#0095f6] rounded-full p-1 border-2 border-black hover:scale-110 transition-transform"
                   >
                       <Plus className="w-3 h-3 text-white" />
                   </div>
                )}
              </div>
              <span className="text-xs text-gray-300 font-medium tracking-wide max-w-[64px] truncate text-center">
                  {story.isUser ? 'قصتي' : story.username}
              </span>
            </div>
          ))}
          {/* Padding for end of scroll */}
          <div className="w-2 shrink-0"></div>
        </div>
    </div>
  );
};

export default StoryRail;