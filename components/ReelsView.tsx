import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music, UserPlus } from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
}

const ReelsView: React.FC<ReelsViewProps> = ({ reels }) => {
  return (
    <div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {reels.map((reel) => (
        <ReelItem key={reel.id} reel={reel} />
      ))}
    </div>
  );
};

const ReelItem: React.FC<{ reel: Reel }> = ({ reel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto play/pause based on visibility could be added here using IntersectionObserver
  // For simplicity, we just autoplay loop

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative h-full w-full snap-start flex items-center justify-center bg-[#121212] border-b border-gray-900">
      {/* Video Content */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        loop
        autoPlay
        playsInline
        muted // Muted by default for browser policy
        onClick={togglePlay}
      />

      {/* Play Icon Overlay (if paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
            </div>
        </div>
      )}

      {/* Boosted/Sponsored Tag */}
      {reel.isBoosted && (
        <div className="absolute top-4 right-4 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg z-20 flex flex-col items-end">
          <span>مروج</span>
          <span className="text-[9px] font-normal text-gray-700">تم تفعيل الانتشار 🚀</span>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none">
        <div className="flex justify-between items-end pb-16 md:pb-4 pointer-events-auto">
          
          {/* Left Side: Info */}
          <div className="flex flex-col space-y-3 max-w-[80%]">
            <div className="flex items-center space-x-2 space-x-reverse">
                <div className="relative">
                    <img src={reel.userAvatar} alt={reel.username} className="w-10 h-10 rounded-full border-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-0.5">
                        <UserPlus className="w-3 h-3 text-white" />
                    </div>
                </div>
                <span className="font-bold text-white text-sm shadow-black drop-shadow-md">{reel.username}</span>
                <button className="text-white border border-white/50 px-2 py-0.5 rounded-md text-xs backdrop-blur-sm">متابعة</button>
            </div>
            
            <p className="text-sm text-white leading-tight drop-shadow-md">
                {reel.description} 
                <span className="text-gray-300 font-bold mx-1">#اكسبلور #ترند</span>
            </p>

            <div className="flex items-center space-x-2 space-x-reverse text-white text-xs">
                <Music className="w-3 h-3 animate-spin-slow" />
                <div className="overflow-hidden w-32">
                    <span className="whitespace-nowrap animate-marquee">صوت أصلي - {reel.username}</span>
                </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-col items-center space-y-5">
            <div className="flex flex-col items-center space-y-1">
                <button onClick={() => setIsLiked(!isLiked)} className="active:scale-90 transition-transform">
                    <Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} strokeWidth={1.5} />
                </button>
                <span className="text-xs font-medium text-white">{reel.likes + (isLiked ? 1 : 0)}</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
                <button className="active:scale-90 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
                </button>
                <span className="text-xs font-medium text-white">{reel.comments}</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
                <button className="active:scale-90 transition-transform">
                    <Share2 className="w-8 h-8 text-white" strokeWidth={1.5} />
                </button>
                <span className="text-xs font-medium text-white">{reel.shares}</span>
            </div>

            <button>
                <MoreHorizontal className="w-8 h-8 text-white" strokeWidth={1.5} />
            </button>

            <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden animate-spin-slow-reverse">
                 <img src={reel.userAvatar} className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReelsView;