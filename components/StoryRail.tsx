import React from 'react';
import { Story } from '../types';
import { Plus } from 'lucide-react';

interface StoryRailProps {
  stories: Story[];
}

const StoryRail: React.FC<StoryRailProps> = ({ stories }) => {
  return (
    <div className="w-full relative">
        <div className="flex space-x-4 space-x-reverse overflow-x-auto px-4 py-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {stories.map((story) => (
            <div key={story.id} className="snap-center flex flex-col items-center flex-shrink-0 space-y-2 cursor-pointer group">
              <div className={`relative p-[3px] rounded-full transition-transform duration-300 group-hover:scale-105 ${
                  story.isUser 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gradient-to-tr from-[#0095f6] via-[#0066ff] to-[#121212] shadow-[0_0_15px_rgba(0,149,246,0.5)]'
              }`}>
                <div className="p-[2px] bg-black rounded-full relative overflow-hidden">
                  <img 
                    src={story.img} 
                    alt={story.name} 
                    className="w-16 h-16 rounded-full object-cover transition-opacity group-hover:opacity-80"
                  />
                </div>
                {/* Future Glow Effect - Blue Tint */}
                {!story.isUser && (
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                )}
                
                {/* Plus Icon for current user */}
                {story.isUser && (
                   <div className="absolute bottom-0 right-0 bg-[#0095f6] rounded-full p-0.5 border-2 border-black">
                       <Plus className="w-3 h-3 text-white" />
                   </div>
                )}
              </div>
              <span className="text-xs text-gray-300 font-medium tracking-wide max-w-[64px] truncate text-center">{story.name}</span>
            </div>
          ))}
          {/* Padding for end of scroll */}
          <div className="w-2 shrink-0"></div>
        </div>
    </div>
  );
};

export default StoryRail;