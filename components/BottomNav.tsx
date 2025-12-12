import React from 'react';
import { Home, Search, PlusSquare, Clapperboard, User } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const isReels = activeTab === 'reels';
  
  // Dynamic styles based on the active tab
  // If Reels: Transparent gradient background, no border
  // If Others: Solid black background, top border
  const navStyle = isReels 
    ? 'bg-gradient-to-t from-black/90 via-black/40 to-transparent border-t-0' 
    : 'bg-black border-t border-ig-darkSec';

  const getIconClass = (tab: Tab) => 
    `w-7 h-7 transition-all duration-200 ${activeTab === tab ? 'scale-110' : 'opacity-70'} ${isReels ? 'text-white shadow-black drop-shadow-md' : 'text-white'}`;

  return (
    <div className={`fixed bottom-0 w-full flex justify-around items-center py-4 z-50 px-2 pb-6 md:pb-4 transition-all duration-300 ${navStyle}`}>
      {/* 1. Home (Official Chat Interface) */}
      <button onClick={() => setActiveTab('home')} className="p-2 active:scale-90 transition-transform">
        {activeTab === 'home' ? 
           <Home className={`w-7 h-7 fill-white text-white ${isReels ? 'drop-shadow-md' : ''}`} /> : 
           <Home className={getIconClass('home')} />
        }
      </button>
      
      {/* 2. Explore (Search) */}
      <button onClick={() => setActiveTab('explore')} className="p-2 active:scale-90 transition-transform">
        <Search className={`${getIconClass('explore')} ${activeTab === 'explore' ? 'stroke-[3px]' : ''}`} />
      </button>

      {/* 3. Create (Create Videos) - Center Button */}
      <button onClick={() => setActiveTab('create')} className="active:scale-90 transition-transform">
        <PlusSquare className={`${getIconClass('create')} ${activeTab === 'create' ? 'stroke-[3px]' : ''}`} />
      </button>
      
      {/* 4. Reels (Watch Videos) */}
      <button onClick={() => setActiveTab('reels')} className="p-2 active:scale-90 transition-transform">
        <Clapperboard className={`${getIconClass('reels')} ${activeTab === 'reels' ? 'fill-white stroke-white' : ''}`} />
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