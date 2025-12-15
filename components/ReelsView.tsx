import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music, Link as LinkIcon, Send, Play, Check, X, Volume2, VolumeX, EyeOff, Search, Pin, Flag, Trash2, Copy, ChevronDown, ChevronUp, AlertCircle, AtSign, Smile, Reply, Mail, MessageSquare, Facebook, Twitter, Ghost, Linkedin, Plus } from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
  onLoadMore?: () => void;
}

// Enhanced Comment Interface
interface Comment {
    id: string;
    username: string;
    text: string;
    avatar: string;
    time: string;
    likes: number;
    isLiked: boolean;
    isPinned?: boolean;
    isOwner?: boolean; // If the comment author is the video creator
    replies?: Comment[];
}

interface HeartAnim {
    id: number;
    x: number;
    y: number;
    rotation: number;
}

// Custom Icon for Comment with 3 Dots
const MessageDots = ({ size, strokeWidth, className }: any) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth || 2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M8 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16 12h.01" />
    </svg>
);

// Emoji Data
const QUICK_EMOJIS = ["❤️", "😂", "😱", "👏", "🔥", "😭", "😍", "😡"];
const EMOJI_CATEGORIES = {
    "المشاعر": ["😂", "😍", "😭", "😡", "😱", "🥺", "😤", "😴"],
    "تفاعل": ["❤️", "🔥", "👏", "💯", "🙌", "✨", "🎉", "💩"],
    "فيديو": ["🎥", "🎶", "🎵", "📸", "⭐", "🎬", "🍿", "👀"],
    "عام": ["👍", "👎", "🤍", "💙", "😎", "🤔", "👋", "✅"]
};

// Mock users for search feature - Expanded list for scrolling demo
const INITIAL_SUGGESTED_USERS = [
  { id: 1, username: 'ali_gamer', name: 'Ali Hassan', avatar: 'https://picsum.photos/50/50?random=101', isFollowing: false },
  { id: 2, username: 'nour_beauty', name: 'Nour Style', avatar: 'https://picsum.photos/50/50?random=102', isFollowing: true },
  { id: 3, username: 'tech_master', name: 'Tech Reviewer', avatar: 'https://picsum.photos/50/50?random=103', isFollowing: false },
  { id: 4, username: 'chef_om', name: 'Chef Omar', avatar: 'https://picsum.photos/50/50?random=104', isFollowing: false },
  { id: 5, username: 'travel_jo', name: 'Jordan Travels', avatar: 'https://picsum.photos/50/50?random=105', isFollowing: false },
  { id: 6, username: 'sport_life', name: 'Captain Majed', avatar: 'https://picsum.photos/50/50?random=106', isFollowing: false },
  { id: 7, username: 'gamer_pro', name: 'Pro Gamer', avatar: 'https://picsum.photos/50/50?random=107', isFollowing: false },
  { id: 8, username: 'food_lover', name: 'Tasty Food', avatar: 'https://picsum.photos/50/50?random=108', isFollowing: false },
  { id: 9, username: 'music_dj', name: 'DJ Ahmed', avatar: 'https://picsum.photos/50/50?random=109', isFollowing: false },
  { id: 10, username: 'art_design', name: 'Design Hub', avatar: 'https://picsum.photos/50/50?random=110', isFollowing: false },
  { id: 11, username: 'funny_memes', name: 'Memes Daily', avatar: 'https://picsum.photos/50/50?random=111', isFollowing: false },
  { id: 12, username: 'news_24', name: 'News 24', avatar: 'https://picsum.photos/50/50?random=112', isFollowing: false },
];

const ReelsView: React.FC<ReelsViewProps> = ({ reels, onLoadMore }) => {
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');
  const [isMutedGlobal, setIsMutedGlobal] = useState(false); // Global mute state
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState(INITIAL_SUGGESTED_USERS);

  // Toggle Follow Logic for Search List
  const toggleFollowUser = (userId: number) => {
    setSuggestedUsers(prev => prev.map(user => 
        user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
  };

  // Filter users based on search
  const filteredUsers = suggestedUsers.filter(u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Scroll / Visibility to play only active video
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveReelId(entry.target.id);
                    // Check if it's the last reel to trigger load more
                    const index = reels.findIndex(r => r.id === entry.target.id);
                    if (index === reels.length - 1 && onLoadMore) {
                        onLoadMore();
                    }
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
      {/* Top Header Layer */}
      <div className="absolute top-4 left-0 right-0 z-40 flex justify-between items-center px-4 pointer-events-none">
          {/* Mute Button (Left Side - formerly empty div) */}
          <button 
            onClick={() => setIsMutedGlobal(!isMutedGlobal)}
            className="w-8 h-8 flex items-center justify-center pointer-events-auto text-white drop-shadow-md hover:scale-110 transition-transform"
          >
              {isMutedGlobal ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          {/* Center Tabs */}
          <div className="flex justify-center items-center gap-4 text-white drop-shadow-md pointer-events-auto">
              <button 
                onClick={() => setFeedType('following')}
                className={`text-sm font-bold transition-opacity ${feedType === 'following' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
              >
                  أتابعهم
              </button>
              <div className="w-[1px] h-3 bg-white/40"></div>
              <button 
                onClick={() => setFeedType('foryou')}
                className={`text-sm font-bold transition-opacity ${feedType === 'foryou' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'}`}
              >
                  لك (For You)
              </button>
          </div>

          {/* Search Button (Right Side) */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-8 h-8 flex items-center justify-center pointer-events-auto text-white drop-shadow-md hover:scale-110 transition-transform"
          >
              <Search className="w-6 h-6" />
          </button>
      </div>

      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-[100] bg-[#121212] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Search Header */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-800 bg-black/80 backdrop-blur-md">
                <div className="flex-1 bg-[#262626] rounded-xl flex items-center px-3 py-2 gap-2 transition-all focus-within:ring-1 focus-within:ring-gray-600">
                     <Search className="w-4 h-4 text-gray-400" />
                     <input 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن أشخاص..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-400"
                     />
                     {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
                </div>
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white font-semibold text-sm">إلغاء</button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 mb-2">مقترحات لك</h3>
                {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <img src={user.avatar} className="w-12 h-12 rounded-full border border-gray-800 object-cover" />
                            <div>
                                <h4 className="font-bold text-sm text-white">{user.username}</h4>
                                <p className="text-xs text-gray-400">{user.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleFollowUser(user.id)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                user.isFollowing 
                                ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-800' 
                                : 'bg-[#0095f6] text-white hover:bg-[#0085dd] border border-transparent'
                            }`}
                        >
                            {user.isFollowing ? 'تتابع' : 'متابعة'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Defined Gradient for Reuse */}
      <svg width="0" height="0" className="absolute">
        <defs>
            <linearGradient id="blue-black-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4db5ff" />
                <stop offset="50%" stopColor="#0095f6" />
                <stop offset="100%" stopColor="#001a4d" />
            </linearGradient>
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
          <ReelItem 
            key={reel.id} 
            reel={reel} 
            isActive={activeReelId === reel.id} 
            isMuted={isMutedGlobal}
            toggleMute={() => setIsMutedGlobal(!isMutedGlobal)}
            isSearchOpen={isSearchOpen}
            suggestedUsers={INITIAL_SUGGESTED_USERS}
          />
        ))}
        {/* Loading Indicator at bottom */}
        <div className="snap-start h-20 w-full flex items-center justify-center bg-black">
             <div className="w-6 h-6 border-2 border-[#0095f6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

interface ReelItemProps {
    reel: Reel;
    isActive: boolean;
    isMuted: boolean;
    toggleMute: () => void;
    isSearchOpen: boolean;
    suggestedUsers: any[];
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, isMuted, toggleMute, isSearchOpen, suggestedUsers }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeoutRef = useRef<any>(null); // Ref for single click timeout
  
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<HeartAnim[]>([]); // Array for TikTok-style hearts
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHidden, setIsHidden] = useState(false); // For "Not Interested" feature
  const [isFollowing, setIsFollowing] = useState(false); // Local Follow State for Reel User

  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Description State
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // Initial Comments with Threading & Pinning
  const [comments, setComments] = useState<Comment[]>([
      { 
          id: '1', 
          username: reel.username, 
          text: 'شكراً لكم على المشاهدة! رابط الدعم في البايو 👇', 
          avatar: reel.userAvatar, 
          time: '1ي', 
          likes: 450, 
          isLiked: false, 
          isPinned: true, 
          isOwner: true 
      },
      { 
          id: '2', 
          username: 'sara_cool', 
          text: 'واو! فيديو رائع 😍', 
          avatar: 'https://picsum.photos/50/50?random=1', 
          time: '2د', 
          likes: 12, 
          isLiked: false,
          replies: [
              {
                  id: '2-1',
                  username: reel.username,
                  text: 'شكراً سارة! ❤️',
                  avatar: reel.userAvatar,
                  time: '1د',
                  likes: 5,
                  isLiked: false,
                  isOwner: true
              }
          ]
      },
      { 
          id: '3', 
          username: 'ahmed_99', 
          text: 'المكان ده فين؟ 🔥', 
          avatar: 'https://picsum.photos/50/50?random=2', 
          time: '5د', 
          likes: 4, 
          isLiked: false 
      },
      { id: '4', username: 'user_1', text: 'amazing!', avatar: 'https://picsum.photos/50/50?random=10', time: '1h', likes: 1, isLiked: false },
      { id: '5', username: 'user_2', text: 'nice video', avatar: 'https://picsum.photos/50/50?random=11', time: '2h', likes: 0, isLiked: false },
      { id: '6', username: 'user_3', text: 'love it', avatar: 'https://picsum.photos/50/50?random=12', time: '3h', likes: 2, isLiked: false },
  ]);

  // Share State
  const [showShare, setShowShare] = useState(false);
  const [shareCount, setShareCount] = useState(reel.shares);
  const [sentUsers, setSentUsers] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shareSearch, setShareSearch] = useState('');

  // More Options State
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Comment Options State (Long Press / More)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const lastClickTime = useRef<number>(0);

  // Sync play state with visibility
  useEffect(() => {
    // We pause only if search is open.
    if (isSearchOpen) {
        videoRef.current?.pause();
        setIsPlaying(false);
        return;
    }

    if (isActive && !isHidden) {
        videoRef.current?.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
    } else {
        videoRef.current?.pause();
        setIsPlaying(false);
    }
  }, [isActive, isHidden, isSearchOpen]);

  // Handle Progress Update
  const handleTimeUpdate = () => {
      if (videoRef.current) {
          const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setProgress(percentage);
      }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime.current;

    if (timeDiff < 300) {
        // --- DOUBLE TAP ---
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }

        if (!isLiked) {
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newHeart: HeartAnim = {
            id: Date.now(),
            x,
            y,
            rotation: Math.random() * 50 - 25
        };

        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 800);

    } else {
        // --- SINGLE TAP ---
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

  // --- COMMENTS LOGIC ---

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const newMsg: Comment = {
        id: Date.now().toString(),
        username: 'مستخدم_جديد',
        text: newComment,
        avatar: 'https://picsum.photos/50/50?random=me',
        time: 'الآن',
        likes: 0,
        isLiked: false,
        replies: []
    };

    if (replyingTo) {
        setComments(prev => prev.map(c => {
            if (c.id === replyingTo.id) {
                setExpandedReplies(s => new Set(s).add(c.id));
                return { ...c, replies: [...(c.replies || []), newMsg] };
            }
            return c;
        }));
        setReplyingTo(null);
    } else {
        setComments(prev => [newMsg, ...prev]);
    }
    setNewComment('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  const toggleCommentLike = (commentId: string, isReply = false, parentId?: string) => {
      setComments(prev => prev.map(c => {
          if (isReply && parentId && c.id === parentId && c.replies) {
              return {
                  ...c,
                  replies: c.replies.map(r => {
                      if (r.id === commentId) {
                          return { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 };
                      }
                      return r;
                  })
              };
          }
          if (c.id === commentId) {
              return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
          }
          return c;
      }));
  };

  const togglePinComment = (commentId: string) => {
      setComments(prev => prev.map(c => {
          if (c.id === commentId) return { ...c, isPinned: !c.isPinned };
          return c;
      }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)));
      setSelectedComment(null);
  };

  const handleDeleteComment = (commentId: string) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setSelectedComment(null);
  };

  const toggleReplies = (commentId: string) => {
      const newSet = new Set(expandedReplies);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      setExpandedReplies(newSet);
  };

  // --- SHARE LOGIC ---
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
          // Simulate sending toast only on adding
          if (!sentUsers.includes(id)) {
              setShareCount(prev => prev + 1);
              showToast('تم الإرسال');
          }
      }
  };

  const filteredShareUsers = suggestedUsers.filter(u => 
      u.username.toLowerCase().includes(shareSearch.toLowerCase()) || 
      u.name.toLowerCase().includes(shareSearch.toLowerCase())
  );

  const handleNotInterested = () => {
      setIsHidden(true);
      setShowMoreOptions(false);
  };

  if (isHidden) {
      return (
          <div className="reel-section h-full w-full snap-start bg-black flex flex-col items-center justify-center space-y-4">
              <EyeOff className="w-12 h-12 text-gray-500" />
              <p className="text-gray-400 font-medium">تم إخفاء الفيديو</p>
              <button onClick={() => setIsHidden(false)} className="text-[#0095f6] text-sm font-bold">تراجع</button>
          </div>
      );
  }

  // --- Subcomponent for Single Comment Row ---
  const CommentRow: React.FC<{ comment: Comment, isReply?: boolean, parentId?: string }> = ({ comment, isReply = false, parentId }) => (
      <div 
        className={`flex gap-3 py-3 animate-in slide-in-from-bottom-2 duration-300 ${isReply ? 'ml-10' : ''} ${selectedComment?.id === comment.id ? 'bg-gray-800/30 rounded-lg -mx-2 px-2' : ''} ${comment.isPinned ? 'bg-[#0095f6]/10 rounded-lg -mx-2 px-2 border-l-2 border-[#0095f6]' : ''}`}
        onContextMenu={(e) => { e.preventDefault(); setSelectedComment(comment); }}
        onClick={() => { if(selectedComment) setSelectedComment(null); }}
      >
          <img src={comment.avatar} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 border border-gray-800" />
          <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${comment.isOwner ? 'text-[#0095f6]' : 'text-gray-300'}`}>{comment.username}</span>
                {comment.isOwner && <span className="text-[10px] bg-[#0095f6]/20 text-[#0095f6] px-1 rounded">المنشئ</span>}
                {comment.isPinned && (
                    <div className="flex items-center gap-0.5 bg-[#0095f6]/20 px-1.5 py-0.5 rounded text-[10px] text-[#0095f6] font-medium ml-auto">
                        <Pin className="w-2.5 h-2.5" fill="currentColor" />
                        <span>مثبت</span>
                    </div>
                )}
              </div>
              
              <p className="text-sm text-gray-100 leading-snug mt-1 break-words">
                  {comment.text}
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                  <span className="text-[11px] text-gray-500">{comment.time}</span>
                  <button onClick={() => setReplyingTo(isReply && parentId ? (comments.find(c => c.id === parentId) || comment) : comment)} className="text-[11px] font-semibold text-gray-400 hover:text-white transition-colors">رد</button>
              </div>

              {/* View Replies Button */}
              {!isReply && comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2">
                      <button 
                        onClick={() => toggleReplies(comment.id)} 
                        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-300 relative group"
                      >
                          <div className="w-6 h-0.5 bg-gray-600 absolute -right-8 top-1/2"></div>
                          <span>{expandedReplies.has(comment.id) ? 'إخفاء الردود' : `عرض ${comment.replies.length} ردود`}</span>
                          {expandedReplies.has(comment.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedReplies.has(comment.id) && (
                          <div className="mt-2 space-y-3 pl-0">
                              {comment.replies.map(reply => (
                                  <CommentRow key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
          
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
              <button onClick={() => toggleCommentLike(comment.id, isReply, parentId)} className="active:scale-90 transition-transform p-1">
                  <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </button>
              <span className="text-[10px] text-gray-500">{comment.likes}</span>
          </div>
      </div>
  );

  return (
    <div 
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
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* --- Progress Bar --- */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600/50 z-20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
      </div>

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
                 <Heart 
                    className="w-24 h-24" 
                    fill="url(#blue-black-gradient)" 
                    stroke="none"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(0, 149, 246, 0.9))' }}
                 />
              </div>
          </div>
      ))}

      {/* Play/Pause Overlay */}
      {!isPlaying && !showComments && !showShare && !showMoreOptions && !isSearchOpen && (
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
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none">
          <div className="flex justify-between items-end pointer-events-auto">
              
              {/* Bottom Left: Username, Follow Button, Description */}
              <div className="flex flex-col space-y-3 max-w-[80%] mb-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                       {/* AVATAR REMOVED FROM HERE */}
                       <span className="font-bold text-white text-lg shadow-black drop-shadow-md">{reel.username}</span>
                       <button 
                            onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); }}
                            className={`border transition-all duration-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-sm ${
                                isFollowing 
                                ? 'bg-white border-white text-black font-bold' 
                                : 'bg-transparent border-white/60 text-white hover:bg-white/20'
                            }`}
                       >
                           {isFollowing ? 'تتابع' : 'متابعة'}
                       </button>
                  </div>
                  
                  <div className="space-y-1">
                      <div className="relative">
                          <p className={`text-sm text-white leading-tight drop-shadow-md ${isDescExpanded ? '' : 'line-clamp-1'}`}>
                              {reel.description}
                          </p>
                          {!isDescExpanded && (
                              <button
                                  onClick={(e) => { e.stopPropagation(); setIsDescExpanded(true); }}
                                  className="text-gray-400 font-semibold text-xs mt-0.5 hover:text-white"
                              >
                                  ... المزيد
                              </button>
                          )}
                      </div>
                      
                      {isDescExpanded && reel.tags && reel.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 animate-in fade-in">
                              {reel.tags.map((tag, i) => (
                                  <span key={i} className="text-xs font-bold text-white drop-shadow-md">#{tag}</span>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Audio Info Removed as requested */}
              </div>

              {/* Right Sidebar: Avatar, Like, Comment, Share */}
              <div className="flex flex-col items-center space-y-3 pb-2">
                  
                  {/* --- AVATAR MOVED HERE (Above Like Button) --- */}
                  <div className="relative mb-1 cursor-pointer transition-transform hover:scale-110">
                     <img src={reel.userAvatar} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg" />
                  </div>

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
                      icon={<MessageDots className="text-white" />} 
                      text={reel.comments} 
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowComments(true); }} 
                  />
                  <ActionBtn 
                      icon={<Reply className="text-white" style={{ transform: 'scaleX(-1)' }} />} 
                      text={shareCount} 
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowShare(true); }} 
                  />
                  <button className="text-white" onClick={(e) => { e.stopPropagation(); setShowMoreOptions(true); }}>
                      <MoreHorizontal />
                  </button>
                  
                  <div className="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden mt-2 animate-spin-slow-cw">
                      <img src={reel.userAvatar} className="w-full h-full object-cover" />
                  </div>
              </div>
          </div>
      </div>

      {/* --- MORE OPTIONS MENU (Global Video Options) --- */}
      {showMoreOptions && (
          <div 
             className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60"
             onClick={(e) => { e.stopPropagation(); setShowMoreOptions(false); }}
          >
              <div className="bg-[#1c1c1c] w-full rounded-t-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                   <div className="w-10 h-1 bg-gray-500 rounded-full mx-auto mb-2"></div>
                   <button onClick={handleNotInterested} className="flex items-center gap-3 p-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-left">
                       <div className="bg-gray-800 p-2 rounded-full"><EyeOff className="w-5 h-5 text-white" /></div>
                       <p className="font-bold text-sm text-white">غير مهتم</p>
                   </button>
                   <button className="flex items-center gap-3 p-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-left">
                       <div className="bg-gray-800 p-2 rounded-full"><Share2 className="w-5 h-5 text-white" /></div>
                       <p className="font-bold text-sm text-white">إبلاغ</p>
                   </button>
                   <button className="flex items-center gap-3 p-3 w-full hover:bg-gray-800 rounded-xl transition-colors text-left">
                       <div className="bg-gray-800 p-2 rounded-full"><LinkIcon className="w-5 h-5 text-white" /></div>
                       <p className="font-bold text-sm text-white">نسخ الرابط</p>
                   </button>
              </div>
          </div>
      )}

      {/* --- COMMENT OPTIONS MENU (Single Comment) --- */}
      {selectedComment && (
          <div 
             className="absolute inset-0 z-[120] flex flex-col justify-end bg-black/60"
             onClick={(e) => { e.stopPropagation(); setSelectedComment(null); }}
          >
              <div className="bg-[#262626] w-full rounded-t-2xl p-4 flex flex-col gap-1 animate-in slide-in-from-bottom duration-300 pb-8" onClick={e => e.stopPropagation()}>
                   <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4"></div>
                   
                   <p className="text-center text-xs text-gray-400 mb-4">{selectedComment.username}: "{selectedComment.text.substring(0, 30)}..."</p>

                   <button className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors">
                       <Send className="w-5 h-5 text-white rotate-[-45deg]" />
                       <span className="font-semibold text-sm text-white">رد بفيديو</span>
                   </button>

                   <button onClick={() => { setReplyingTo(selectedComment); setSelectedComment(null); }} className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors">
                       <MessageCircle className="w-5 h-5 text-white" />
                       <span className="font-semibold text-sm text-white">رد</span>
                   </button>

                   <button onClick={() => { navigator.clipboard.writeText(selectedComment.text); setSelectedComment(null); }} className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors">
                       <Copy className="w-5 h-5 text-white" />
                       <span className="font-semibold text-sm text-white">نسخ</span>
                   </button>

                   <button onClick={() => togglePinComment(selectedComment.id)} className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors">
                       <Pin className="w-5 h-5 text-white" />
                       <span className="font-semibold text-sm text-white">{selectedComment.isPinned ? 'إلغاء التثبيت' : 'تثبيت التعليق'}</span>
                   </button>

                   <div className="h-px bg-gray-700 my-1"></div>

                   <button className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors text-red-500">
                       <Flag className="w-5 h-5" />
                       <span className="font-semibold text-sm">إبلاغ</span>
                   </button>

                   <button onClick={() => handleDeleteComment(selectedComment.id)} className="flex items-center gap-3 p-3 w-full hover:bg-gray-700 rounded-xl transition-colors text-red-500">
                       <Trash2 className="w-5 h-5" />
                       <span className="font-semibold text-sm">حذف</span>
                   </button>
              </div>
          </div>
      )}

      {/* --- COMMENTS BOTTOM SHEET (Full Height Overlay) --- */}
      {showComments && (
        <div 
            className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60"
            onClick={(e) => { e.stopPropagation(); setShowComments(false); setReplyingTo(null); }}
        >
            <div 
                className="bg-[#1c1c1c] w-full h-[85vh] rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl shadow-black ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex justify-center items-center py-4 border-b border-[#262626]">
                    <div className="absolute left-4 font-bold text-xs text-white bg-[#262626] border border-gray-700 px-2 py-1 rounded-md">
                        {comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)} تعليقاً
                    </div>
                    <span className="font-bold text-sm text-white">التعليقات</span>
                    <button onClick={() => setShowComments(false)} className="absolute right-4 p-1 hover:bg-gray-800 rounded-full">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                
                {/* Scrollable Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#121212]">
                    {comments.map(c => (
                        <CommentRow key={c.id} comment={c} />
                    ))}
                    {/* Add padding at bottom so last comment isn't hidden by input */}
                    <div className="h-40"></div> 
                </div>

                {/* Input Area Group - Fixed at Bottom of Sheet */}
                <div className="flex flex-col bg-[#1c1c1c] border-t border-[#262626] safe-area-pb z-20">
                    
                    {/* Quick Emoji Bar (Always Visible above Input) */}
                    {!showEmojiPicker && (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-2 border-b border-[#262626]/50">
                            {QUICK_EMOJIS.map(e => (
                                <button 
                                    key={e} 
                                    onClick={() => addEmoji(e)} 
                                    className="text-2xl hover:scale-125 transition-transform active:scale-95"
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Replying Context Banner */}
                    {replyingTo && (
                        <div className="flex justify-between items-center text-xs text-gray-400 py-1 px-3 bg-[#262626]">
                            <span className="flex items-center gap-1">
                                الرد على <span className="font-bold text-white">@{replyingTo.username}</span>
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                        </div>
                    )}
                    
                    {/* Input Field */}
                    <div className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#2a2a2a] rounded-full px-4 py-1 flex items-center gap-2 transition-all focus-within:ring-1 focus-within:ring-gray-500 focus-within:bg-[#333]">
                                <input 
                                    autoFocus={!!replyingTo}
                                    className="flex-1 bg-transparent text-sm text-white outline-none py-2.5 placeholder-gray-500 dir-rtl" 
                                    placeholder={replyingTo ? `الرد على ${replyingTo.username}...` : "أضف تعليقاً لطيفاً..."}
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <div className="flex items-center gap-3 text-gray-400">
                                    <button className="hover:text-white transition-colors"><AtSign className="w-5 h-5" /></button>
                                    <button 
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`transition-colors ${showEmojiPicker ? 'text-[#0095f6]' : 'hover:text-white'}`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSendComment}
                                disabled={!newComment.trim()}
                                className={`p-2.5 rounded-full transition-all shadow-lg ${newComment.trim() ? 'bg-[#0095f6] text-white hover:bg-[#0085dd] scale-100' : 'bg-[#2a2a2a] text-gray-500 scale-95'}`}
                            >
                                <Send className={`w-5 h-5 rtl:rotate-180 ${newComment.trim() ? 'ml-0.5' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Full Emoji Picker Panel */}
                    {showEmojiPicker && (
                        <div className="h-64 overflow-y-auto p-4 bg-[#1c1c1c] border-t border-[#262626] animate-in slide-in-from-bottom duration-200">
                            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                                <div key={category} className="mb-4">
                                    <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider sticky top-0 bg-[#1c1c1c] py-1">{category}</h4>
                                    <div className="grid grid-cols-8 gap-1">
                                        {emojis.map(e => (
                                            <button 
                                                key={e} 
                                                onClick={() => addEmoji(e)} 
                                                className="text-2xl p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- SHARE MENU --- */}
      {showShare && (
        <div 
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60"
            onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
        >
            <div 
                className="bg-[#1c1c1c] w-full rounded-t-2xl p-4 flex flex-col animate-in slide-in-from-bottom duration-300 gap-4 max-h-[70vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center"><div className="w-10 h-1 bg-gray-500 rounded-full"></div></div>

                {/* Search in Share Sheet */}
                <div className="relative">
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        value={shareSearch}
                        onChange={(e) => setShareSearch(e.target.value)}
                        placeholder="بحث عن أشخاص..."
                        className="w-full bg-[#262626] rounded-xl py-2 pr-9 pl-3 text-sm text-white placeholder-gray-400 outline-none focus:bg-[#333] transition-colors"
                    />
                </div>
                
                {/* External Actions - MOVED TO TOP */}
                <div className="flex gap-6 overflow-x-auto no-scrollbar px-1 pb-2 pt-2 border-b border-gray-800">
                    <ShareOption icon={<LinkIcon />} label="نسخ الرابط" onClick={handleCopyLink} />
                    <ShareOption 
                        icon={<MessageCircle className="text-white fill-[#0095f6]" />} 
                        label="Messenger" 
                        bgColor="bg-[#0095f6]"
                        onClick={() => { window.open(`fb-messenger://share?link=https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                     <ShareOption 
                        icon={<MessageCircle className="text-white fill-[#25D366]" />} 
                        label="WhatsApp" 
                        bgColor="bg-[#25D366]"
                        onClick={() => { window.open(`https://wa.me/?text=Check this video: https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                    <ShareOption 
                        icon={<Ghost className="text-white fill-transparent" />} 
                        label="Snapchat" 
                        bgColor="bg-[#FFFC00]"
                        iconColor="text-black"
                        onClick={() => { }} 
                    />
                    <ShareOption 
                        icon={<Facebook className="text-white fill-white" />} 
                        label="Facebook" 
                        bgColor="bg-[#1877F2]"
                        onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                     <ShareOption 
                        icon={<Twitter className="text-white fill-white" />} 
                        label="X" 
                        bgColor="bg-black"
                        onClick={() => { window.open(`https://twitter.com/intent/tweet?url=https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                     <ShareOption 
                        icon={<Linkedin className="text-white fill-white" />} 
                        label="LinkedIn" 
                        bgColor="bg-[#0077b5]"
                        onClick={() => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                    <ShareOption 
                        icon={<Send className="text-white fill-white -rotate-45 mb-1 mr-1" />} 
                        label="Telegram" 
                        bgColor="bg-[#229ED9]"
                        onClick={() => { window.open(`https://t.me/share/url?url=https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                    <ShareOption 
                        icon={<MessageSquare className="text-white fill-white" />} 
                        label="SMS" 
                        bgColor="bg-[#4CD964]"
                        onClick={() => { window.open(`sms:?body=Check this video: https://nel.app/v/${reel.id}`, '_blank'); }} 
                    />
                    <ShareOption icon={<Share2 />} label="المزيد" onClick={handleNativeShare} />
                </div>

                {/* Internal User List (UPDATED: Vertical Grid) - MOVED TO BOTTOM */}
                <div className="grid grid-cols-4 gap-4 overflow-y-auto no-scrollbar max-h-[250px] py-2 px-1">
                    {filteredShareUsers.length > 0 ? filteredShareUsers.map(user => {
                        const isSent = sentUsers.includes(user.id);
                        return (
                            <div key={user.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleSendToUser(user.id); }}>
                                <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden border border-gray-600 relative group-hover:scale-105 transition-transform">
                                    <img src={user.avatar} className={`w-full h-full object-cover transition-opacity ${isSent ? 'opacity-50' : ''}`} />
                                    {isSent && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-300 truncate w-full text-center">{user.name.split(' ')[0]}</span>
                                <button 
                                    className={`text-[10px] px-3 py-1 rounded-full transition-all duration-300 font-bold w-full ${
                                        isSent ? 'bg-gray-700 text-gray-400' : 'bg-[#0095f6] text-white hover:bg-[#0085dd]'
                                    }`}
                                >
                                    {isSent ? 'تم' : 'إرسال'}
                                </button>
                            </div>
                        );
                    }) : (
                        <div className="col-span-4 text-center text-xs text-gray-500 py-2">لا يوجد مستخدمين</div>
                    )}
                </div>

            </div>
        </div>
      )}
      
      {/* --- CSS Animations for Hearts & Spin --- */}
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
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        .animate-spin-slow-cw {
             animation: spin 5s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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

const ShareOption = ({ icon, label, onClick, bgColor, iconColor }: any) => (
    <div className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group" onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-gray-700 transition-transform active:scale-95 ${bgColor ? bgColor : 'bg-gray-800'}`}>
            {React.cloneElement(icon, { size: 24, className: iconColor || 'text-white' })}
        </div>
        <span className="text-[10px] text-gray-400">{label}</span>
    </div>
);

const AtSignIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
const SmileIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

export default ReelsView;