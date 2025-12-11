import React from 'react';
import { Story } from '../types';
import { Plus } from 'lucide-react';

interface StoryRailProps {
  stories: Story[];
}

const StoryRail: React.FC<StoryRailProps> = ({ stories }) => {
  return (
    <div className="flex space-x-4 space-x-reverse overflow-x-auto px-4 py-3 border-b border-ig-darkSec no-scrollbar">
      {/* User Add Story Button (Always first if not in list, logic handled by parent usually, but styling here) */}
      
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center flex-shrink-0 space-y-1 cursor-pointer">
          <div className={`p-[3px] rounded-full ${story.isUser ? 'bg-ig-darkSec' : 'bg-gradient-to-tr from-ig-gradientStart via-ig-gradientMid to-ig-gradientEnd'}`}>
            <div className="p-[2px] bg-black rounded-full relative">
              <img 
                src={story.img} 
                alt={story.name} 
                className="w-16 h-16 rounded-full object-cover"
              />
              {/* Only show the blue plus if it's the user and they have no active story, 
                  but here we assume 'isUser' means an active story. 
                  If we wanted an 'Add' button it would be separate. 
                  Let's assume the first item is always the user. */}
            </div>
             {/* If it was an "Add Story" placeholder, we would render a plus icon here */}
          </div>
          <span className="text-xs text-gray-300">{story.name}</span>
        </div>
      ))}
    </div>
  );
};

export default StoryRail;