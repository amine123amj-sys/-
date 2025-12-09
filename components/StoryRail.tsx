import React from 'react';

const DUMMY_STORIES = [
  { id: 1, name: 'قصتي', img: 'https://picsum.photos/100/100?random=1', isUser: true },
  { id: 2, name: 'أحمد', img: 'https://picsum.photos/100/100?random=2', isUser: false },
  { id: 3, name: 'سارة', img: 'https://picsum.photos/100/100?random=3', isUser: false },
  { id: 4, name: 'علي', img: 'https://picsum.photos/100/100?random=4', isUser: false },
  { id: 5, name: 'نور', img: 'https://picsum.photos/100/100?random=5', isUser: false },
  { id: 6, name: 'محمد', img: 'https://picsum.photos/100/100?random=6', isUser: false },
];

const StoryRail: React.FC = () => {
  return (
    <div className="flex space-x-4 space-x-reverse overflow-x-auto px-4 py-3 border-b border-ig-darkSec no-scrollbar">
      {DUMMY_STORIES.map((story) => (
        <div key={story.id} className="flex flex-col items-center flex-shrink-0 space-y-1">
          <div className={`p-[3px] rounded-full ${story.isUser ? 'bg-ig-darkSec' : 'bg-gradient-to-tr from-ig-gradientStart via-ig-gradientMid to-ig-gradientEnd'}`}>
            <div className="p-[2px] bg-black rounded-full">
              <img 
                src={story.img} 
                alt={story.name} 
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            {story.isUser && (
              <div className="absolute bottom-8 right-1 bg-blue-500 rounded-full p-0.5 border-2 border-black">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-300">{story.name}</span>
        </div>
      ))}
    </div>
  );
};

export default StoryRail;