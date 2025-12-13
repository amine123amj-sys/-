import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music, Link as LinkIcon, Send, Play, Check, X } from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
}

interface Comment {
    id: string;
    username: string;
    text: string;
    avatar: string;
    time: string;
    likes: number;
    isLiked: boolean;
}

interface HeartAnim {
    id: number;
    x: number;
    y: number;
    rotation: number;
}

const ReelsView: React.FC<ReelsViewProps> = ({ reels }) => {
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '');

  // Handle Scroll / Visibility to play only active video
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveReelId(entry.target.id);
                }
            });
        },
        { threshold: 0.6 }
    );

    const elements = document.querySelectorAll('.reel-section');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Defined Gradient for Reuse with brighter start for glow effect */}
      <svg width="0" height="0" className="absolute">
        <defs>
            <linearGradient id="blue-black-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4db5ff" /> {/* Brighter Blue start */}
                <stop offset="50%" stopColor="#0095f6" /> {/* Main Brand Blue */}
                <stop offset="100%" stopColor="#001a4d" /> {/* Deep Dark Blue/Black end */}
            </linearGradient>
            
            {/* Glow Filter */}
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
      </svg>

      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-0">
        {reels.map((reel) => (
          <ReelItem key={reel.id} reel={reel} isActive={activeReelId === reel.id} />
        ))}
      </div>
    </div>
  );
};

const ReelItem: React.FC<{ reel: Reel, isActive: boolean }> = ({ reel, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<any>(null); // Ref for single click timeout
  
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<HeartAnim[]>([]); // Array for TikTok-style hearts
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
      { id: '1', username: 'sara_cool', text: 'واو! فيديو رائع 😍', avatar: 'https://picsum.photos/50/50?random=1', time: '2د', likes: 12, isLiked: false },
      { id: '2', username: 'ahmed_99', text: 'المكان ده فين؟ 🔥', avatar: 'https://picsum.photos/50/50?random=2', time: '5د', likes: 4, isLiked: false },
  ]);

  // Share State
  const [showShare, setShowShare] = useState(false);
  const [shareCount, setShareCount] = useState(reel.shares);
  const [sentUsers, setSentUsers] = useState<number[]>([]); // Track simulated internal sends
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastClickTime = useRef<number>(0);

  // Sync play state with visibility
  useEffect(() => {
    if (isActive) {
        videoRef.current?.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
    } else {
        videoRef.current?.pause();
        setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    // We handle custom double tap logic because we want the coordinates
    const now = Date.now();
    const timeDiff = now - lastClickTime.current;

    if (timeDiff < 300) {
        // --- DOUBLE TAP DETECTED ---
        
        // 1. Cancel the pending single click action (Toggle Play)
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }

        // 2. Perform Like Action
        if (!isLiked) {
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        }

        // 3. Add a floating heart at the exact click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newHeart: HeartAnim = {
            id: Date.now(),
            x,
            y,
            rotation: Math.random() * 50 - 25 // Random rotation between -25deg and 25deg
        };

        setHearts(prev => [...prev, newHeart]);

        // Remove the heart after the animation completes (800ms)
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 800);

    } else {
        // --- SINGLE TAP DETECTED ---
        // We delay the action slightly to see if a second tap comes in
        clickTimeoutRef.current = setTimeout(() => {
            togglePlay();
            clickTimeoutRef.current = null;
        }, 300);
    }
    lastClickTime.current = now;
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(`https://nel.app/v/${reel.id}`);
      setShareCount(prev => prev + 1);
      setShowShare(false);
      showToast('تم نسخ الرابط');
  };

  const handleNativeShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Watch ${reel.username}'s video on NeL`,
                  text: reel.description,
                  url: `https://nel.app/v/${reel.id}`
              });
              setShareCount(prev => prev + 1);
              setShowShare(false);
          } catch (err) {
              console.log('Error sharing', err);
          }
      } else {
          handleCopyLink();
      }
  };

  const toggleSendToUser = (id: number) => {
      if (sentUsers.includes(id)) {
          setSentUsers(prev => prev.filter(uid => uid !== id));
      } else {
          setSentUsers(prev => [...prev, id]);
          // Simulate share count increment only on first send
          if (!sentUsers.includes(id)) {
              setShareCount(prev => prev + 1);
          }
      }
  };

  return (
    <div 
        ref={containerRef}
        id={reel.id}
        className="reel-section relative h-full w-full snap-start bg-black overflow-hidden select-none"
        onClick={handleInteraction}
    >
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={false} 
      />

      {/* --- Toast Notification --- */}
      {toastMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-full backdrop-blur-md z-50 animate-in fade-in zoom-in duration-200">
              <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
      )}

      {/* --- TikTok Style Flying Hearts --- */}
      {hearts.map(heart => (
          <div 
            key={heart.id}
            className="absolute z-20 pointer-events-none"
            style={{ 
                left: heart.x, 
                top: heart.y,
            }}
          >
              <div 
                className="animate-tiktok-heart origin-center"
                style={{ transform: `translate(-50%, -50%) rotate(${heart.rotation}deg)` }}
              >
                 {/* Strong Glow Effect for floating heart */}
                 <Heart 
                    className="w-24 h-24" 
                    fill="url(#blue-black-gradient)" 
                    stroke="none"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(0, 149, 246, 0.9))' }}
                 />
              </div>
          </div>
      ))}

      {/* Play/Pause Overlay Button - Modified with Blue Glow */}
      {!isPlaying && !showComments && !showShare && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/10">
            <div className="relative group">
                <div className="absolute -inset-4 bg-[#0095f6]/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(0,149,246,0.5)] animate-in fade-in zoom-in duration-200">
                     <Play className="w-8 h-8 text-white fill-white ml-1 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                </div>
            </div>
        </div>
      )}

      {/* --- OVERLAY UI --- */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none">
          <div className="flex justify-between items-end pointer-events-auto">
              
              <div className="flex flex-col space-y-3 max-w-[80%] mb-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                       <img src={reel.userAvatar} className="w-9 h-9 rounded-full border border-white" />
                       <span className="font-bold text-white text-sm shadow-black drop-shadow-md">{reel.username}</span>
                       <button className="bg-transparent border border-white/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">متابعة</button>
                  </div>
                  <p className="text-sm text-white leading-tight drop-shadow-md line-clamp-2">
                      {reel.description} <span className="font-bold">#explore #nel</span>
                  </p>
                  <div className="flex items-center gap-2 text-white text-xs">
                       <Music className="w-3 h-3" />
                       <span>صوت أصلي - {reel.username}</span>
                  </div>
              </div>

              <div className="flex flex-col items-center space-y-5 pb-2">
                  {/* Blue/Black Gradient Like Button with Glow */}
                  <div 
                    className="flex flex-col items-center gap-1 cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); setLikesCount(p => isLiked ? p-1 : p+1); }}
                  >
                        <Heart 
                            size={28} 
                            strokeWidth={1.5}
                            className={`transition-all duration-300 ${isLiked ? "scale-110 drop-shadow-[0_0_12px_rgba(0,149,246,1)]" : "text-white"}`}
                            fill={isLiked ? "url(#blue-black-gradient)" : "transparent"}
                            stroke={isLiked ? "none" : "currentColor"}
                        />
                        <span className="text-xs font-medium text-white">{likesCount}</span>
                  </div>

                  <ActionBtn 
                      icon={<MessageCircle className="text-white" />} 
                      text={reel.comments} 
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowComments(true); }} 
                  />
                  <ActionBtn 
                      icon={<Share2 className="text-white" />} 
                      text={shareCount} 
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowShare(true); }} 
                  />
                  <button className="text-white"><MoreHorizontal /></button>
                  <div className="w-7 h-7 rounded border border-white overflow-hidden mt-2">
                      <img src={reel.userAvatar} className="w-full h-full object-cover" />
                  </div>
              </div>
          </div>
      </div>

      {showComments && (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50"
            onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
        >
            <div 
                className="bg-[#1c1c1c] w-full h-[60%] rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center p-2"><div className="w-10 h-1 bg-gray-500 rounded-full"></div></div>
                <div className="text-center font-bold text-sm text-white pb-2 border-b border-gray-700">التعليقات</div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <img src={c.avatar} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-300">{c.username}</span>
                                    <span className="text-[10px] text-gray-500">{c.time}</span>
                                </div>
                                <p className="text-sm text-white">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-gray-700 flex gap-2">
                    <input 
                        className="flex-1 bg-black rounded-full px-4 text-sm text-white outline-none" 
                        placeholder="أضف تعليقاً..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button className="text-blue-500 font-bold text-sm px-2">نشر</button>
                </div>
            </div>
        </div>
      )}

      {showShare && (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60"
            onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
        >
            <div 
                className="bg-[#1c1c1c] w-full rounded-t-2xl p-4 flex flex-col animate-in slide-in-from-bottom duration-300 gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center"><div className="w-10 h-1 bg-gray-500 rounded-full"></div></div>
                
                {/* Internal Messaging */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                    {[1,2,3,4,5].map(i => {
                        const isSent = sentUsers.includes(i);
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSendToUser(i); }}>
                                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative">
                                    <img src={`https://picsum.photos/50/50?random=${i+200}`} className={`w-full h-full object-cover transition-opacity ${isSent ? 'opacity-50' : ''}`} />
                                    {isSent && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-300 truncate w-full text-center">User {i}</span>
                                <button 
                                    className={`text-[10px] px-3 py-1 rounded-full transition-all duration-300 font-bold ${
                                        isSent ? 'bg-gray-700 text-gray-400' : 'bg-[#0095f6] text-white hover:bg-[#0085dd]'
                                    }`}
                                >
                                    {isSent ? 'تم الإرسال' : 'إرسال'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="h-px bg-gray-700"></div>

                {/* External Actions */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-1">
                    <ShareOption icon={<LinkIcon />} label="نسخ الرابط" onClick={handleCopyLink} />
                    <ShareOption icon={<Send className="-rotate-45" />} label="Telegram" onClick={() => { window.open(`https://t.me/share/url?url=https://nel.app/v/${reel.id}`, '_blank'); }} />
                    <ShareOption icon={<MessageCircle />} label="WhatsApp" onClick={() => { window.open(`https://wa.me/?text=Check this video: https://nel.app/v/${reel.id}`, '_blank'); }} />
                    <ShareOption icon={<Share2 />} label="المزيد" onClick={handleNativeShare} />
                </div>
            </div>
        </div>
      )}
      
      {/* --- CSS Animations for Hearts --- */}
      <style>{`
        @keyframes tiktokHeartAnim {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          30% { transform: translate(-50%, -50%) scale(0.9); }
          45% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -100px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -150px) scale(0.8); }
        }
        .animate-tiktok-heart {
            animation: tiktokHeartAnim 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const ActionBtn = ({ icon, text, onClick }: any) => (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
        {React.cloneElement(icon, { size: 28, strokeWidth: 1.5 })}
        <span className="text-xs font-medium text-white">{text}</span>
    </div>
);

const ShareOption = ({ icon, label, onClick }: any) => (
    <div className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group" onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white border border-gray-700 group-hover:bg-gray-700 transition-colors">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className="text-[10px] text-gray-400">{label}</span>
    </div>
);

export default ReelsView;