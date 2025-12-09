import React from 'react';
import { Home, Search, PlusSquare, Clapperboard, User } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const getIconClass = (tab: Tab) => `w-7 h-7 transition-all duration-200 ${activeTab === tab ? 'scale-110' : 'opacity-70'}`;

  return (
    <div className="fixed bottom-0 w-full bg-black border-t border-ig-darkSec flex justify-around items-center py-3 z-50 px-2 pb-5 md:pb-3">
      <button onClick={() => setActiveTab('home')}>
        {activeTab === 'home' ? 
           <Home className="w-7 h-7 fill-white text-white" /> : 
           <Home className="w-7 h-7 text-white" />
        }
      </button>
      
      <button onClick={() => setActiveTab('explore')}>
        <Search className={`${getIconClass('explore')} ${activeTab === 'explore' ? 'stroke-[3px]' : ''}`} />
      </button>
      
      <button onClick={() => setActiveTab('create')}>
        <PlusSquare className={`${getIconClass('create')} ${activeTab === 'create' ? 'stroke-[3px]' : ''}`} />
      </button>
      
      <button onClick={() => setActiveTab('reels')}>
        <Clapperboard className={`${getIconClass('reels')} ${activeTab === 'reels' ? 'fill-white stroke-white' : ''}`} />
      </button>
      
      <button onClick={() => setActiveTab('profile')}>
        <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${activeTab === 'profile' ? 'border-white' : 'border-transparent'}`}>
            <img src="https://picsum.photos/100/100?random=1" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </button>
    </div>
  );
};

export default BottomNav;