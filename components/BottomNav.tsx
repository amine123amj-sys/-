
import React from 'react';
import { Home, Clapperboard, MessageCircle, Plus, User } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const isReels = activeTab === 'reels';
  
  // Dynamic styles based on the active tab
  const navStyle = isReels 
    ? 'bg-gradient-to-t from-black/90 via-black/40 to-transparent border-t-0' 
    : 'bg-black border-t border-ig-darkSec';

  const getIconClass = (tab: Tab) => 
    `w-7 h-7 transition-all duration-200 ${activeTab === tab ? 'scale-110 opacity-100' : 'opacity-70'} ${isReels ? 'text-white shadow-black drop-shadow-md' : 'text-white'}`;

  return (
    // Increased z-index to z-[70] to be above StoryViewer (z-[50])
    <div className={`fixed bottom-0 w-full flex justify-around items-center py-3 z-[70] px-2 pb-6 md:pb-4 transition-all duration-300 ${navStyle}`}>
      {/* 1. Home */}
      <button onClick={() => setActiveTab('home')} className="p-2 active:scale-90 transition-transform">
        <Home className={getIconClass('home')} fill={activeTab === 'home' ? "currentColor" : "none"} />
      </button>
      
      {/* 2. Explore (Messages) */}
      <button onClick={() => setActiveTab('explore')} className="p-2 active:scale-90 transition-transform">
        <MessageCircle className={getIconClass('explore')} fill={activeTab === 'explore' ? "currentColor" : "none"} />
      </button>

      {/* 3. Create Button (Custom Capsule Design) */}
      <button 
        onClick={() => setActiveTab('create')} 
        className="active:scale-95 transition-transform duration-200"
      >
         <div className="w-14 h-9 bg-gradient-to-r from-[#0095f6] to-[#0033cc] rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,149,246,0.6)] hover:shadow-[0_0_20px_rgba(0,149,246,0.8)] border border-white/20">
            <Plus className="w-6 h-6 text-white" strokeWidth={3} />
         </div>
      </button>
      
      {/* 4. Reels */}
      <button onClick={() => setActiveTab('reels')} className="p-2 active:scale-90 transition-transform">
        <Clapperboard className={getIconClass('reels')} fill={activeTab === 'reels' ? "currentColor" : "none"} />
      </button>
      
      {/* 5. Profile */}
      <button onClick={() => setActiveTab('profile')} className="p-2 active:scale-90 transition-transform">
        <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${activeTab === 'profile' ? 'border-white' : 'border-transparent'} ${isReels ? 'shadow-black drop-shadow-md' : ''}`}>
            <img src="https://picsum.photos/100/100?random=1" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </button>
    </div>
  );
};

export default BottomNav;
