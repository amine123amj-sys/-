import React, { useRef, useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Music, 
  Link as LinkIcon, Send, Play, Check, X, Volume2, VolumeX, 
  EyeOff, Search, Pin, Flag, Trash2, Copy, ChevronDown, 
  ChevronUp, AlertCircle, AtSign, Smile, Reply, Mail, 
  MessageSquare, Plus, Disc, PlayCircle, Bookmark 
} from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
  onLoadMore?: () => void;
}

interface HeartAnim {
    id: number;
    x: number;
    y: number;
    rotation: number;
}

const MessageDots = ({ size, strokeWidth, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /></svg>
);

const ReelsView: React.FC<ReelsViewProps> = ({ reels, onLoadMore }) => {
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '');
  const [isMutedGlobal, setIsMutedGlobal] = useState(false);
  
  // Music Detail Page State
  const [selectedMusic, setSelectedMusic] = useState<Reel['music'] | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveReelId(entry.target.id);
                    const index = reels.findIndex(r => r.id === entry.target.id);
                    if (index === reels.length - 1 && onLoadMore) onLoadMore();
                }
            });
        },
        { threshold: 0.6 }
    );
    const elements = document.querySelectorAll('.reel-section');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels, onLoadMore]);

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="absolute top-4 left-0 right-0 z-40 flex justify-between items-center px-4 pointer-events-none">
          <button onClick={() => setIsMutedGlobal(!isMutedGlobal)} className="w-8 h-8 flex items-center justify-center pointer-events-auto text-white drop-shadow-md"><VolumeX className="w-6 h-6" /></button>
          <div className="flex justify-center items-center gap-4 text-white drop-shadow-md pointer-events-auto">
              <button className="text-sm font-bold opacity-50">أتابعهم</button>
              <div className="w-[1px] h-3 bg-white/40"></div>
              <button className="text-sm font-bold opacity-100">لك</button>
          </div>
          <div className="w-8"></div>
      </div>

      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-0">
        {reels.map((reel) => (
          <ReelItem 
            key={reel.id} 
            reel={reel} 
            isActive={activeReelId === reel.id && !selectedMusic} 
            isMuted={isMutedGlobal} 
            onOpenMusic={(m) => setSelectedMusic(m)}
          />
        ))}
      </div>

      {/* --- MUSIC DETAIL VIEW OVERLAY --- */}
      {selectedMusic && (
          <div className="absolute inset-0 z-[110] bg-black flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                   <button onClick={() => setSelectedMusic(null)} className="p-2"><ChevronDown className="w-8 h-8 rotate-90 text-white" /></button>
                   <span className="font-bold text-sm text-white">موسيقى</span>
                   <button className="p-2 bg-gray-800 rounded-full"><Share2 size={18} className="text-white" /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                  {/* Track Info Header */}
                  <div className="p-6 flex flex-col items-center text-center">
                      <div className="relative w-36 h-36 mb-5 group">
                          <img src={selectedMusic.cover} className="w-full h-full rounded-2xl object-cover shadow-2xl border border-gray-800" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors rounded-2xl">
                               <PlayCircle className="text-white w-14 h-14 drop-shadow-lg" />
                          </div>
                      </div>
                      <h2 className="text-2xl font-black mb-1 text-white">{selectedMusic.name}</h2>
                      <p className="text-[#0095f6] font-bold text-sm mb-6">@{selectedMusic.artist}</p>
                      
                      <div className="flex items-center gap-2 mb-8 text-gray-500 text-xs font-bold uppercase tracking-widest">
                          <Play size={10} className="fill-current" />
                          <span>{selectedMusic.usageCount} فيديو</span>
                      </div>

                      <div className="flex gap-3 w-full max-w-sm">
                          <button className="flex-1 py-3.5 bg-[#1a1a1a] rounded-2xl flex items-center justify-center gap-2 border border-gray-800 font-bold text-sm text-white hover:bg-gray-800 transition-colors">
                              <Bookmark size={18} /> حفظ
                          </button>
                          <button className="flex-1 py-3.5 bg-[#0095f6] rounded-2xl flex items-center justify-center gap-2 font-black text-sm text-white hover:bg-[#0085dd] transition-colors">
                              <Music size={18} /> استخدام
                          </button>
                      </div>
                  </div>

                  {/* Grid of Videos */}
                  <div className="px-1 grid grid-cols-3 gap-0.5 pb-20">
                      {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="aspect-[9/16] bg-gray-900 border border-black relative overflow-hidden group cursor-pointer">
                               <img src={`https://picsum.photos/400/700?random=${i + 200}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                               <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold text-white drop-shadow-md">
                                    <Play size={10} fill="white" stroke="none" /> {Math.floor(Math.random() * 900)}K
                               </div>
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <svg width="0" height="0" className="absolute"><defs><linearGradient id="blue-black-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4db5ff" /><stop offset="50%" stopColor="#0095f6" /><stop offset="100%" stopColor="#001a4d" /></linearGradient></defs></svg>
    </div>
  );
};

const ReelItem: React.FC<{ reel: Reel, isActive: boolean, isMuted: boolean, onOpenMusic: (m: any) => void }> = ({ reel, isActive, isMuted, onOpenMusic }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<HeartAnim[]>([]);
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isActive) videoRef.current?.play().catch(() => setIsPlaying(false));
    else videoRef.current?.pause();
  }, [isActive]);

  const handleInteraction = (e: React.MouseEvent) => {
    if (e.detail === 2) { // Double Tap
        if (!isLiked) { setIsLiked(true); setLikesCount(p => p + 1); }
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top, rotation: Math.random() * 40 - 20 };
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 800);
    } else if (e.detail === 1) { // Single Tap
        setIsPlaying(!isPlaying);
        if(isPlaying) videoRef.current?.pause(); else videoRef.current?.play();
    }
  };

  const musicInfo = reel.music || {
    id: 'm1',
    name: 'صوت أصلي - ' + reel.username,
    artist: reel.username,
    cover: reel.userAvatar,
    usageCount: '15.4K'
  };

  return (
    <div className="reel-section relative h-full w-full snap-start bg-black overflow-hidden" onClick={handleInteraction}>
      <video ref={videoRef} src={reel.videoUrl} className="h-full w-full object-cover" loop playsInline muted={isMuted} />
      
      {hearts.map(h => (
          <div key={h.id} className="absolute z-20 pointer-events-none animate-tiktok-heart" style={{ left: h.x, top: h.y, transform: `translate(-50%, -50%) rotate(${h.rotation}deg)` }}>
              <Heart className="w-20 h-20" fill="url(#blue-black-gradient)" stroke="none" />
          </div>
      ))}

      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
          <div className="flex justify-between items-end pointer-events-auto">
              <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2"><span className="font-black text-white text-lg drop-shadow-md">@{reel.username}</span></div>
                  <p className="text-sm text-white line-clamp-2 drop-shadow-md">{reel.description}</p>
                  
                  {/* --- CLICKABLE MUSIC TICKER --- */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); onOpenMusic(musicInfo); }}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 w-fit hover:bg-white/20 transition-all cursor-pointer group"
                  >
                      <Music size={12} className="text-white group-hover:scale-110 transition-transform animate-pulse" />
                      <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-[11px] font-bold text-white whitespace-nowrap">{musicInfo.name}</span>
                          <span className="text-[10px] text-gray-400">• {musicInfo.artist}</span>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col items-center gap-5">
                  <div className="w-12 h-12 rounded-full border-2 border-white mb-1 shadow-lg cursor-pointer transform hover:scale-110 transition-transform"><img src={reel.userAvatar} className="w-full h-full rounded-full object-cover" /></div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); setLikesCount(p => isLiked ? p-1 : p+1); }}>
                      <Heart size={30} strokeWidth={1.5} className={isLiked ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-white"} />
                      <span className="text-[11px] font-bold text-white drop-shadow-md">{likesCount}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <MessageDots size={30} className="text-white drop-shadow-md" />
                      <span className="text-[11px] font-bold text-white drop-shadow-md">{reel.comments}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <Reply size={30} className="text-white drop-shadow-md" style={{ transform: 'scaleX(-1)' }} />
                      <span className="text-[11px] font-bold text-white drop-shadow-md">{reel.shares}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-gray-700 p-1.5 animate-spin-slow bg-black/40 backdrop-blur-sm cursor-pointer">
                      <Disc size={22} className="text-gray-400" />
                  </div>
              </div>
          </div>
      </div>
      
      <style>{`
        @keyframes tiktokHeartAnim { 0% { opacity: 0; transform: scale(0); } 15% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: translateY(-120px) scale(1); } }
        .animate-tiktok-heart { animation: tiktokHeartAnim 0.8s ease-out forwards; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ReelsView;
