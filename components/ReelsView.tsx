import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music, UserPlus, Search, X, Send, Smile, ThumbsUp, Pin, Link as LinkIcon, Flag, Download, Bookmark, Copy, Users, Check, Mail } from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
}

interface TempHeart {
  id: number;
  x: number;
  y: number;
  angle: number;
}

interface Comment {
    id: string;
    username: string;
    text: string;
    avatar: string;
    time: string;
    likes: number;
    isLiked: boolean;
    isPinned?: boolean;
    replies?: Comment[];
}

// Mock Data for Share Targets
const MOCK_SHARE_USERS = [
    { id: 'u1', username: 'ahmed_ali', name: 'Ahmed Ali', avatar: 'https://picsum.photos/100/100?random=201', frequent: true },
    { id: 'u2', username: 'sara_xx', name: 'Sara', avatar: 'https://picsum.photos/100/100?random=202', frequent: true },
    { id: 'u3', username: 'best_friend', name: 'My Bestie', avatar: 'https://picsum.photos/100/100?random=203', frequent: true },
    { id: 'u4', username: 'work_mate', name: 'Khaled Work', avatar: 'https://picsum.photos/100/100?random=204', frequent: false },
    { id: 'u5', username: 'mom_love', name: 'Mom ❤️', avatar: 'https://picsum.photos/100/100?random=205', frequent: true },
    { id: 'u6', username: 'gym_bro', name: 'Gym Bro', avatar: 'https://picsum.photos/100/100?random=206', frequent: false },
    { id: 'u7', username: 'unknown_user', name: 'New Person', avatar: 'https://picsum.photos/100/100?random=207', frequent: false },
    { id: 'u8', username: 'travel_guide', name: 'Traveler', avatar: 'https://picsum.photos/100/100?random=208', frequent: false },
];

const ReelsView: React.FC<ReelsViewProps> = ({ reels }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        { threshold: 0.6 } // Video must be 60% visible to become active
    );

    const elements = document.querySelectorAll('.reel-section');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  return (
    <div className="relative h-full w-full bg-black">
      {/* Header Overlay */}
      <div className="absolute top-0 w-full z-30 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <h2 className="font-bold text-2xl font-logo tracking-wider text-white pointer-events-auto">NeL</h2>
          <button 
              onClick={() => setIsSearchOpen(true)}
              className="pointer-events-auto p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-white/10 transition-colors"
          >
              <Search className="w-6 h-6 text-white" />
          </button>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
              <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                  <Search className="w-5 h-5 text-gray-500" />
                  <input 
                      type="text" 
                      placeholder="بحث عن أشخاص..." 
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button onClick={() => setIsSearchOpen(false)}>
                      <X className="w-6 h-6 text-white" />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  {searchQuery ? (
                       <div className="space-y-4">
                           {[1, 2, 3].map(i => (
                               <div key={i} className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                       <img src={`https://picsum.photos/50/50?random=${i+50}`} className="w-full h-full object-cover" />
                                   </div>
                                   <div className="flex-1">
                                       <h4 className="font-bold text-sm text-white">user_result_{i}</h4>
                                       <p className="text-xs text-gray-400">Name {i}</p>
                                   </div>
                                   <button className="text-xs bg-[#0095f6] text-white px-3 py-1.5 rounded-lg font-semibold">متابعة</button>
                               </div>
                           ))}
                       </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                          <Search className="w-12 h-12 mb-2 opacity-20" />
                          <p className="text-sm">ابدأ الكتابة للبحث</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Reels Scroll Container - h-screen to fill entire viewport behind nav */}
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16">
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hearts, setHearts] = useState<TempHeart[]>([]);
  
  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Share State
  const [showShare, setShowShare] = useState(false);
  const [shareCount, setShareCount] = useState(reel.shares);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [shareSearch, setShareSearch] = useState('');
  const [sentUsers, setSentUsers] = useState<string[]>([]); // Track users who we sent the video to
  
  const [comments, setComments] = useState<Comment[]>([
      { 
          id: '1', 
          username: 'sara_cool', 
          text: 'واو! فيديو رائع 😍', 
          avatar: 'https://picsum.photos/50/50?random=1', 
          time: '2د', 
          likes: 12,
          isLiked: false,
          isPinned: true
      },
      { 
          id: '2', 
          username: 'ahmed_99', 
          text: 'هههههههه 😂 المكان ده فين؟', 
          avatar: 'https://picsum.photos/50/50?random=2', 
          time: '5د', 
          likes: 4,
          isLiked: false,
          replies: [
              {
                  id: '2-1',
                  username: 'travel_lover',
                  text: 'أعتقد في مصر',
                  avatar: 'https://picsum.photos/50/50?random=3',
                  time: '1د',
                  likes: 2,
                  isLiked: false
              }
          ]
      },
      { 
          id: '3', 
          username: 'travel_lover', 
          text: 'المكان جميل جداً، وين هذا؟', 
          avatar: 'https://picsum.photos/50/50?random=3', 
          time: '10د', 
          likes: 8,
          isLiked: true
      },
  ]);

  const lastClickTime = useRef<number>(0);
  const clickTimeoutRef = useRef<any>(null);

  // Sync play state with visibility
  useEffect(() => {
    if (isActive) {
        // Try to play if active
        videoRef.current?.play().catch(() => {
            // Autoplay might be blocked
            setIsPlaying(false);
        });
        setIsPlaying(true);
    } else {
        // Pause if not active
        videoRef.current?.pause();
        setIsPlaying(false);
    }
  }, [isActive]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (showComments || showShare) return;

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showComments || showShare) return;

    const now = Date.now();
    const timeDiff = now - lastClickTime.current;

    if (timeDiff < 300) {
        // --- DOUBLE CLICK (LIKE) ---
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newHeart: TempHeart = {
                id: Date.now(),
                x,
                y,
                angle: Math.random() * 30 - 15
            };
            setHearts(prev => [...prev, newHeart]);
            if (!isLiked) {
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }

            setTimeout(() => {
                setHearts(prev => prev.filter(h => h.id !== newHeart.id));
            }, 800);
        }
    } else {
        // --- SINGLE CLICK (TOGGLE PLAY - DELAYED) ---
        if (clickTimeoutRef.current) {
             clearTimeout(clickTimeoutRef.current);
        }
        
        clickTimeoutRef.current = setTimeout(() => {
            togglePlay();
            clickTimeoutRef.current = null;
        }, 300);
    }
    
    lastClickTime.current = now;
  };

  const handleAddComment = () => {
      if (!newComment.trim()) return;
      const comment: Comment = {
          id: Date.now().toString(),
          username: 'أنت',
          text: newComment,
          avatar: 'https://picsum.photos/50/50?random=me',
          time: 'الآن',
          likes: 0,
          isLiked: false
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
      setComments(prev => prev.map(c => {
          if(c.id === commentId) {
              return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
          }
          if(c.replies) {
              return {
                  ...c,
                  replies: c.replies.map(r => {
                      if(r.id === commentId) {
                          return { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 };
                      }
                      return r;
                  })
              }
          }
          return c;
      }));
  };

  const handleReply = (username: string) => {
      setNewComment(`@${username} `);
      inputRef.current?.focus();
  };

  // --- SHARE FUNCTIONS ---
  const handleCopyLink = () => {
      const link = `https://nel.app/v/${reel.id}`;
      navigator.clipboard.writeText(link);
      setToastMessage('تم نسخ الرابط');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setShareCount(prev => prev + 1);
      setShowShare(false);
  };

  const handleExternalShare = async (platform: string) => {
      const text = `شاهد هذا الفيديو على NeL: ${reel.description}`;
      const url = `https://nel.app/v/${reel.id}`;
      let shareUrl = '';

      // Handle Native Share (More)
      if (platform === 'system') {
          if (navigator.share) {
              try {
                  await navigator.share({
                      title: 'NeL Video',
                      text: text,
                      url: url,
                  });
                  setShareCount(prev => prev + 1);
              } catch (err) {
                  console.error('Share failed', err);
              }
          } else {
              handleCopyLink();
          }
          setShowShare(false);
          return;
      }

      switch(platform) {
          case 'whatsapp':
              shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
              break;
          case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
              break;
          case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              break;
          case 'sms':
              shareUrl = `sms:?body=${encodeURIComponent(text + ' ' + url)}`;
              break;
          case 'telegram':
              shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
              break;
           case 'reddit':
              shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
              break;
      }
      
      if(shareUrl) window.open(shareUrl, '_blank');
      setShareCount(prev => prev + 1);
      setShowShare(false);
  };

  const handleSendToUser = (userId: string) => {
      if (sentUsers.includes(userId)) return;
      
      // Simulate API call
      setSentUsers(prev => [...prev, userId]);
      // Show toast optionally
  };

  const filteredShareUsers = MOCK_SHARE_USERS.filter(u => 
      u.username.toLowerCase().includes(shareSearch.toLowerCase()) || 
      u.name.toLowerCase().includes(shareSearch.toLowerCase())
  ).sort((a, b) => (b.frequent ? 1 : 0) - (a.frequent ? 1 : 0)); // Sort frequents first

  return (
    <div 
        ref={containerRef}
        id={reel.id}
        className="reel-section relative h-full w-full snap-start flex items-center justify-center bg-[#121212] border-b border-gray-900 overflow-hidden select-none"
        onClick={handleInteraction}
    >
      {/* Video Content */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover pointer-events-none"
        loop
        playsInline
        muted={false} 
      />

      {/* Floating Hearts Animation */}
      {hearts.map((heart) => (
        <div
            key={heart.id}
            className="absolute pointer-events-none z-40"
            style={{
                left: heart.x,
                top: heart.y,
                transform: `translate(-50%, -50%) rotate(${heart.angle}deg)`
            }}
        >
            <Heart 
                className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg animate-ping-once" 
                strokeWidth={0}
            />
        </div>
      ))}
      <style>{`
        @keyframes popUpFade {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -150%) scale(1.2); opacity: 0; }
        }
        .animate-ping-once {
            animation: popUpFade 0.8s ease-out forwards;
        }
        .animate-check {
            animation: checkBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes checkBounce {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Play Icon Overlay */}
      {!isPlaying && !showComments && !showShare && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
            </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
              {toastMessage}
          </div>
      )}

      {/* Boosted Tag */}
      {reel.isBoosted && (
        <div className="absolute top-16 right-4 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg z-20 flex flex-col items-end">
          <span>مروج</span>
          <span className="text-[9px] font-normal text-gray-700">تم تفعيل الانتشار 🚀</span>
        </div>
      )}

      {/* --- COMMENTS SHEET --- */}
      {showComments && (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
        >
            <div 
                className="bg-[#121212] w-full h-[75%] rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative border-t border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Pull Indicator */}
                <div className="w-full flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-center p-3 border-b border-gray-800 relative">
                    <span className="font-bold text-sm text-white">التعليقات</span>
                    <button 
                        onClick={() => setShowComments(false)}
                        className="absolute right-4 p-1 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                    {comments.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 opacity-50">
                            <MessageCircle className="w-12 h-12 mb-2" />
                            <p className="text-sm">لا توجد تعليقات بعد.</p>
                            <p className="text-xs">كن أول من يعلق!</p>
                        </div>
                    )}

                    {comments.map((comment) => (
                        <div key={comment.id} className="flex flex-col gap-3">
                             {/* Main Comment */}
                             <div className="flex gap-3">
                                 <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 border border-gray-800">
                                     <img src={comment.avatar} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1 space-y-0.5">
                                     <div className="flex items-center gap-2">
                                         <span className="text-xs font-bold text-gray-200">
                                            {comment.username}
                                            {comment.isPinned && <Pin className="w-3 h-3 inline-block ml-1 text-gray-400 rotate-45" />}
                                         </span>
                                         <span className="text-[10px] text-gray-500">{comment.time}</span>
                                     </div>
                                     <p className="text-sm text-white leading-snug whitespace-pre-wrap">{comment.text}</p>
                                     <div className="flex items-center gap-4 mt-1">
                                         <button 
                                            onClick={() => handleReply(comment.username)}
                                            className="text-[11px] text-gray-400 font-semibold hover:text-gray-200"
                                         >
                                            رد
                                         </button>
                                         {comment.likes > 0 && (
                                            <span className="text-[11px] text-gray-500 font-medium">{comment.likes} تسجيل إعجاب</span>
                                         )}
                                     </div>
                                 </div>
                                 <div className="flex flex-col items-center gap-1 pt-1">
                                     <button onClick={() => handleLikeComment(comment.id)}>
                                        <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-gray-300'}`} />
                                     </button>
                                 </div>
                             </div>

                             {/* Replies (Nested) */}
                             {comment.replies && comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3 pr-11">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 border border-gray-800">
                                        <img src={reply.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-200">{reply.username}</span>
                                            <span className="text-[10px] text-gray-500">{reply.time}</span>
                                        </div>
                                        <p className="text-sm text-white leading-snug">
                                            <span className="text-blue-400">@{comment.username}</span> {reply.text}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <button 
                                                onClick={() => handleReply(reply.username)}
                                                className="text-[11px] text-gray-400 font-semibold hover:text-gray-200"
                                            >
                                                رد
                                            </button>
                                            {reply.likes > 0 && (
                                                <span className="text-[11px] text-gray-500 font-medium">{reply.likes} تسجيل إعجاب</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <button onClick={() => handleLikeComment(reply.id)}>
                                            <Heart className={`w-3.5 h-3.5 ${reply.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-gray-300'}`} />
                                        </button>
                                    </div>
                                </div>
                             ))}
                        </div>
                    ))}
                    <div className="h-4"></div>
                </div>

                {/* Input Area (Sticky Bottom) */}
                <div className="p-3 border-t border-gray-800 bg-[#121212] flex items-center gap-3 sticky bottom-0 z-50 w-full shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-700">
                         <img src="https://picsum.photos/50/50?random=me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 bg-[#262626] rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-gray-500 transition-colors">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder={`أضف تعليقاً...`}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-400 dir-auto"
                            autoComplete="off"
                        />
                        <button className="ml-2 text-gray-400 hover:text-white"><Smile className="w-5 h-5" /></button>
                    </div>
                    {newComment.trim() ? (
                        <button 
                            onClick={handleAddComment}
                            className="text-[#0095f6] font-bold text-sm hover:text-blue-400 transition-colors px-2"
                        >
                            نشر
                        </button>
                    ) : (
                         <div className="flex gap-1 text-2xl">
                             <span className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setNewComment(prev => prev + '❤️')}>❤️</span>
                             <span className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setNewComment(prev => prev + '🙌')}>🙌</span>
                         </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- SHARE SHEET (NEW FEATURE - ADVANCED) --- */}
      {showShare && (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
        >
            <div 
                className="bg-[#262626] w-full rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative border-t border-gray-700 max-h-[85%]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-500 rounded-full"></div>
                </div>

                {/* Header with Search */}
                <div className="px-4 pb-4 border-b border-gray-700/50">
                    <div className="relative">
                        <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="بحث عن أشخاص..."
                            value={shareSearch}
                            onChange={(e) => setShareSearch(e.target.value)}
                            className="w-full bg-[#121212] rounded-lg py-2 pr-10 pl-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600 transition-all"
                        />
                    </div>
                </div>

                {/* Direct Share (People Grid) */}
                <div className="flex-1 overflow-y-auto min-h-[200px] p-2">
                    <div className="grid grid-cols-1 gap-1">
                        {filteredShareUsers.map((user) => {
                            const isSent = sentUsers.includes(user.id);
                            return (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group" onClick={() => handleSendToUser(user.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={user.avatar} className="w-11 h-11 rounded-full object-cover border border-gray-700" />
                                            {user.frequent && (
                                                <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5 border-2 border-[#262626]">
                                                    <Heart className="w-2 h-2 fill-black text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">{user.name}</span>
                                            <span className="text-xs text-gray-400">@{user.username}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 transform ${
                                            isSent 
                                            ? 'bg-transparent text-gray-400 flex items-center gap-1 border border-gray-700' 
                                            : 'bg-[#0095f6] text-white hover:bg-[#0085dd] active:scale-95'
                                        }`}
                                    >
                                        {isSent ? (
                                            <>
                                                <Check className="w-4 h-4 animate-check" />
                                                تم الإرسال
                                            </>
                                        ) : (
                                            'إرسال'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                        
                        {filteredShareUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">لا يوجد نتائج</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apps Carousel (Famous Apps) */}
                <div className="border-t border-gray-700/50 p-4 pb-6 bg-[#1f1f1f]">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        <ShareAppButton icon={<Copy />} label="نسخ الرابط" color="bg-gray-600" onClick={handleCopyLink} />
                        <ShareAppButton icon={<MessageCircle className="fill-white" />} label="واتساب" color="bg-[#25D366]" onClick={() => handleExternalShare('whatsapp')} />
                        
                        {/* Instagram (Gradient) */}
                        <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-shrink-0" onClick={() => handleExternalShare('system')}>
                             <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                             </div>
                             <span className="text-[10px] text-gray-300">Instagram</span>
                        </div>

                        {/* Snapchat (Yellow) */}
                        <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-shrink-0" onClick={() => handleExternalShare('system')}>
                             <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-[#FFFC00]">
                                 <div className="text-black font-bold">👻</div> 
                             </div>
                             <span className="text-[10px] text-gray-300">Snapchat</span>
                        </div>

                        {/* Facebook (Blue) */}
                        <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-shrink-0" onClick={() => handleExternalShare('facebook')}>
                             <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-[#1877F2]">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9.99992 11.2917V13.7501H12.4583V20.7501H15.4166V13.7501H17.7083L17.9999 11.2917H15.4166V9.6251C15.4166 8.95843 15.75 8.29176 16.9166 8.29176H17.9583V5.91676C17.9583 5.91676 16.9583 5.7501 16.0416 5.7501C14.0833 5.7501 12.7916 6.95843 12.7916 9.1251V11.2917H9.99992Z"></path></svg>
                             </div>
                             <span className="text-[10px] text-gray-300">Facebook</span>
                        </div>

                        <ShareAppButton icon={<Send className="-rotate-45" />} label="Telegram" color="bg-[#0088cc]" onClick={() => handleExternalShare('telegram')} />
                        <ShareAppButton icon={<Mail />} label="SMS" color="bg-blue-500" onClick={() => handleExternalShare('sms')} />
                        <ShareAppButton icon={<Share2 />} label="المزيد" color="bg-gray-600" onClick={() => handleExternalShare('system')} />
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* Overlay UI (Hidden when comments/share are open) */}
      {!showComments && !showShare && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none pb-20">
            <div className="flex justify-between items-end pb-4 md:pb-4 pointer-events-auto">
            
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
                    <button onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); if(!isLiked) setLikesCount(p => p+1); else setLikesCount(p => p-1); }} className="active:scale-90 transition-transform">
                        <Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} strokeWidth={1.5} />
                    </button>
                    <span className="text-xs font-medium text-white">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center space-y-1">
                    <button 
                        className="active:scale-90 transition-transform" 
                        onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                    >
                        <MessageCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </button>
                    <span className="text-xs font-medium text-white">{reel.comments + comments.length}</span>
                </div>

                {/* Share Button (Trigger) */}
                <div className="flex flex-col items-center space-y-1">
                    <button className="active:scale-90 transition-transform" onClick={(e) => { e.stopPropagation(); setShowShare(true); }}>
                        <Share2 className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </button>
                    <span className="text-xs font-medium text-white">{shareCount}</span>
                </div>

                <button onClick={(e) => { e.stopPropagation(); setShowShare(true); }}>
                    <MoreHorizontal className="w-8 h-8 text-white" strokeWidth={1.5} />
                </button>

                <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden animate-spin-slow-reverse">
                    <img src={reel.userAvatar} className="w-full h-full object-cover" />
                </div>
            </div>

            </div>
        </div>
      )}
    </div>
  );
};

// Helper Components for Share Sheet
const ShareAppButton = ({ icon, label, color, onClick }: any) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform flex-shrink-0" onClick={onClick}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${color}`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className="text-[10px] text-gray-300">{label}</span>
    </div>
);

const ShareActionButton = ({ icon, label, isDestructive = false }: any) => (
    <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform min-w-[60px]">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isDestructive ? 'border-red-900 bg-red-900/20 text-red-500' : 'border-gray-600 bg-gray-800 text-white'}`}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`text-[10px] ${isDestructive ? 'text-red-500' : 'text-gray-400'}`}>{label}</span>
    </div>
);

export default ReelsView;