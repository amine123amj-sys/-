import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { STRINGS } from '../constants';

const TopBar: React.FC = () => {
  return (
    <div className="sticky top-0 w-full bg-black z-50 flex justify-between items-center px-4 py-3 border-b border-ig-darkSec">
      <h1 className="font-logo text-3xl mt-2 select-none">{STRINGS.appName}</h1>
      <div className="flex space-x-6 space-x-reverse items-center">
        <Heart className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer" />
        <div className="relative">
             <MessageCircle className="w-6 h-6 hover:scale-110 transition-transform cursor-pointer" />
             <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">3</div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;