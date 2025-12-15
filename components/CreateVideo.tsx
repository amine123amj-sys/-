import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Music, RotateCcw, Zap, Timer, 
  ChevronDown, Type, Smile, 
  Palette, ArrowRight, Wand2,
  Radio, MessageCircle, Heart, MoreHorizontal, Gift, Swords, Trophy, Flame, UserPlus, Share2,
  Users, Mic, MicOff, Video as VideoIcon, VideoOff, Skull, ShieldAlert, BadgeCheck, Send, Image as ImageIcon, ZapOff, Play, Pause, Trash2
} from 'lucide-react';
import { Reel, Story, StoryItem } from '../types';

interface CreateVideoProps {
  onClose: () => void;
  onPublishReel: (reel: Reel) => void;
  onPublishStory: (storyItem: StoryItem) => void;
  initialMode?: 'MENU' | 'STORY'; 
}

type MainStep = 'MENU' | 'CAPTURE' | 'EDIT' | 'PUBLISH_SETUP' | 'LIVE_SETUP' | 'LIVE_ACTIVE';
type Mode = 'VIDEO' | 'LIVE' | 'STORY';
type Privacy = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
type PKState = 'IDLE' | 'SEARCHING' | 'BATTLE' | 'PUNISHMENT' | 'ENDED';

// --- CONFIGURATION ---
interface GiftItem {
    id: string;
    name: string;
    icon: string;
    cost: number;
    type: 'basic' | 'medium' | 'legendary';
    animationDuration: number;
    scorePoints: number; 
}

const LIVE_GIFTS: GiftItem[] = [
    { id: 'rose', name: 'وردة', icon: '🌹', cost: 1, type: 'basic', animationDuration: 1500, scorePoints: 10 },
    { id: 'heart', name: 'قلب', icon: '❤️', cost: 5, type: 'basic', animationDuration: 1500, scorePoints: 50 },
    { id: 'panda', name: 'باندا', icon: '🐼', cost: 20, type: 'basic', animationDuration: 2000, scorePoints: 200 },
    { id: 'money_gun', name: 'مسدس مال', icon: '💸', cost: 100, type: 'medium', animationDuration: 3000, scorePoints: 1000 },
    { id: 'dragon', name: 'تنين', icon: '🐉', cost: 1000, type: 'legendary', animationDuration: 5000, scorePoints: 10000 },
    { id: 'planet', name: 'كوكب', icon: '🪐', cost: 5000, type: 'legendary', animationDuration: 6000, scorePoints: 50000 },
];

const FILTERS = [
  { name: 'طبيعي', value: 'none', color: '#fff' },
  { name: 'ذهبي', value: 'sepia(30%) saturate(140%) contrast(110%) brightness(110%)', color: '#fbbf24' }, // Golden Hour
  { name: 'محيط', value: 'sepia(20%) hue-rotate(180deg) saturate(120%) brightness(110%)', color: '#38bdf8' }, // Ocean
  { name: 'غابة', value: 'sepia(25%) hue-rotate(60deg) saturate(90%) contrast(110%)', color: '#22c55e' }, // Forest
  { name: 'أبيض وأسود', value: 'grayscale(100%)', color: '#333' },
  { name: 'درامي', value: 'grayscale(100%) contrast(150%)', color: '#000' }, // Mono High
  { name: 'دافئ', value: 'sepia(50%) contrast(100%)', color: '#f59e0b' },
  { name: 'ساطع', value: 'brightness(130%) contrast(110%)', color: '#fef08a' },
  { name: 'باستيل', value: 'contrast(80%) brightness(120%) saturate(80%)', color: '#f9a8d4' }, // Pastel
  { name: 'سينمائي', value: 'contrast(120%) saturate(90%) brightness(90%) sepia(10%)', color: '#3b82f6' },
  { name: 'فيلم قديم', value: 'sepia(50%) contrast(120%) brightness(80%) grayscale(20%)', color: '#78350f' }, // Retro Film
  { name: 'سايبر', value: 'contrast(130%) saturate(200%) hue-rotate(-10deg)', color: '#d946ef' }, // Cyber
  { name: 'نيون', value: 'hue-rotate(90deg) contrast(150%)', color: '#8b5cf6' },
  { name: 'غليتش', value: 'hue-rotate(180deg) invert(10%)', color: '#10b981' },
  { name: 'حالم', value: 'blur(0.5px) brightness(110%) saturate(120%)', color: '#fcd34d' }, // Dreamy
];

const MUSIC_TRACKS = [
    { id: '1', name: 'موسيقى هادئة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', name: 'إيقاع سريع', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '3', name: 'بيانو كلاسيكي', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '4', name: 'شعبي', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

const COLORS = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

const STICKERS = ["😂", "❤️", "🔥", "😍", "🎉", "👍", "👎", "👀", "👻", "💀", "💩", "🌟", "🍕", "🍔", "⚽", "🚗", "✈️", "🚀"];

interface OverlayItem {
    id: string;
    type: 'text' | 'sticker';
    content: string;
    x: number;
    y: number;
    color?: string;
    scale: number;
}

interface FloatingHeart {
    id: number;
    offset: number;
    color: string;
}

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    isSystem?: boolean;
    color?: string;
}

interface Guest {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    status: 'REQUESTING' | 'ACTIVE';
}

const CreateVideo: React.FC<CreateVideoProps> = ({ onClose, onPublishReel, onPublishStory, initialMode = 'MENU' }) => {
  // Navigation
  const [step, setStep] = useState<MainStep>(initialMode === 'STORY' ? 'CAPTURE' : 'MENU');
  const [mode, setMode] = useState<Mode>(initialMode === 'STORY' ? 'STORY' : 'VIDEO');
  
  // Media
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Capture
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Controls State
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Effects & Filters
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);

  // --- EDITING STATE ---
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<{name: string, url: string} | null>(null);
  
  // Tool Panels
  const [activeTool, setActiveTool] = useState<'none' | 'text' | 'sticker' | 'music'>('none');
  
  // Text Tool State
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  
  // Dragging State
  const dragItem = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Publish
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('PUBLIC');
  const [isPublishing, setIsPublishing] = useState(false);

  // --- LIVE & ALGORITHM STATE ---
  const [liveTitle, setLiveTitle] = useState('');
  const [liveCategory, setLiveCategory] = useState('عام');
  const [liveViewers, setLiveViewers] = useState(0);
  const [liveLikes, setLiveLikes] = useState(0);
  const [diamonds, setDiamonds] = useState(0); 
  
  // Engagement Simulation
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [viewerBoost, setViewerBoost] = useState(false); 
  const [commentInput, setCommentInput] = useState(''); // User Input
  
  // Gifts
  const [userCoins, setUserCoins] = useState(5000);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [activeGiftAnim, setActiveGiftAnim] = useState<GiftItem | null>(null);
  const [giftCombo, setGiftCombo] = useState(0);

  // Tapping
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  
  // --- PK BATTLE SYSTEM ---
  const [pkState, setPkState] = useState<PKState>('IDLE');
  const [pkTimer, setPkTimer] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pkMultiplier, setPkMultiplier] = useState(false); // x2 Points
  const [pkPunishment, setPkPunishment] = useState<string | null>(null); // Loser punishment

  // --- GUEST / MULTI-LIVE SYSTEM ---
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestPanel, setShowGuestPanel] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  // --- CAMERA LOGIC ---
  useEffect(() => {
    if (step !== 'CAPTURE' && step !== 'LIVE_ACTIVE' && step !== 'LIVE_SETUP') {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        return;
    }

    let isMounted = true;
    const startCamera = async () => {
      setIsMockMode(false);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("No API");
        
        let stream;
        try {
            // First try with desired facing mode, but without 'advanced' initially
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode }, 
                audio: true 
            });
        } catch (err) {
            // If that fails, try simpler constraints
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
        }
        
        if (isMounted && stream) {
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            // Apply flash/torch constraint AFTER stream is established
            // This prevents "Requested device not found" errors during init
            if (facingMode === 'environment' && isFlashOn) {
                setTimeout(() => applyFlash(true), 500);
            }
        }
      } catch (e) {
         console.error("Camera Error:", e);
         if (isMounted) setIsMockMode(true);
      }
    };
    startCamera();
    return () => { isMounted = false; if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, [facingMode, step]); // Re-run when facingMode changes (Flip)

  // --- AUDIO LOGIC ---
  useEffect(() => {
      if (selectedMusic && step === 'EDIT') {
          if (audioRef.current) {
              audioRef.current.src = selectedMusic.url;
              audioRef.current.play().catch(e => console.log('Autoplay blocked'));
              audioRef.current.loop = true;
          }
      } else {
          if (audioRef.current) {
              audioRef.current.pause();
          }
      }
  }, [selectedMusic, step]);

  // --- RECORDING TIMER ---
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      const limit = mode === 'STORY' ? 15 : 60; 
      const tick = 100 / (limit * 10);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { stopRecording(); return 100; }
          return prev + tick;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, mode]);

  // --- AUTO SCROLL CHAT ---
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [liveMessages]);

  // --- TIKTOK LIVE ALGORITHM SIMULATION ---
  useEffect(() => {
    if (step !== 'LIVE_ACTIVE') return;

    // 1. Viewer Fluctuation Logic
    const viewerInterval = setInterval(() => {
        setLiveViewers(current => {
            let change = Math.floor(Math.random() * 5) - 2; 
            if (myScore > opponentScore && pkState === 'BATTLE') change += 8; // Winning PK attracts more
            if (viewerBoost) change += 15; // "Share" or "Gift" boost
            let next = current + change;
            return next < 1 ? 1 : next;
        });
    }, 2000);

    // 2. Chat & Guest Request Simulation
    const chatInterval = setInterval(() => {
        const randomNames = ["أحمد", "سارة", "Ali", "User123", "Nour", "Jo", "Gamer", "Hassan", "Maha"];
        const randomMsgs = ["منور", "الصوت واضح", "هلا", "🔥", "❤️❤️", "share live please", "كم عمرك؟", "احكم عليه!", "كبسوا يا جماعة"];
        
        // Simulating Guest Requests randomly
        if (Math.random() > 0.95 && guests.filter(g => g.status === 'REQUESTING').length < 3) {
             const guestName = randomNames[Math.floor(Math.random() * randomNames.length)];
             setGuests(prev => [...prev, {
                 id: Date.now().toString(),
                 name: guestName,
                 avatar: `https://picsum.photos/50/50?random=${Date.now()}`,
                 isMuted: false,
                 status: 'REQUESTING'
             }]);
             setLiveMessages(prev => [...prev.slice(-15), { id: Date.now().toString(), user: '', text: `🔔 ${guestName} طلب الانضمام كضيف`, isSystem: true, color: 'text-yellow-400' }]);
        }

        const eventType = Math.random();
        const user = randomNames[Math.floor(Math.random() * randomNames.length)];

        let newMsg: ChatMessage | null = null;
        if (eventType > 0.9) {
            // Join
            newMsg = { id: Date.now().toString(), user: '', text: `${user} انضم للايف`, isSystem: true };
        } else if (eventType > 0.8) {
            // Like (invisible boost)
            setLiveLikes(p => p + 10);
        } else {
             newMsg = { id: Date.now().toString(), user, text: randomMsgs[Math.floor(Math.random() * randomMsgs.length)] };
        }

        if (newMsg) {
            setLiveMessages(prev => [...prev.slice(-15), newMsg!]); 
        }

    }, 1500);

    return () => {
        clearInterval(viewerInterval);
        clearInterval(chatInterval);
    };
  }, [step, pkState, myScore, viewerBoost, guests]);

  // --- PK BATTLE LOGIC ---
  useEffect(() => {
      let interval: any;
      if (pkState === 'BATTLE' && pkTimer > 0) {
          // Check for Multiplier (Last 30s)
          if (pkTimer === 30 && !pkMultiplier) {
              setPkMultiplier(true);
              setLiveMessages(prev => [...prev, { id: Date.now().toString(), user: 'System', text: '🔥 x2 POINTS ACTIVATED! 🔥', isSystem: true, color: 'text-orange-500 font-black text-lg' }]);
          }

          interval = setInterval(() => {
              setPkTimer(t => t - 1);
              // Opponent Bot Logic
              if (Math.random() > 0.5) {
                  let points = Math.floor(Math.random() * 50);
                  if (pkTimer <= 30) points *= 2; // Opponent also gets multiplier
                  setOpponentScore(s => s + points);
              }
          }, 1000);
      } else if (pkState === 'BATTLE' && pkTimer === 0) {
          setPkState('PUNISHMENT');
          setPkMultiplier(false);
          
          const win = myScore > opponentScore;
          if (!win) {
              setPkPunishment('clown'); // Apply clown filter if lost
          }

          setLiveMessages(prev => [...prev, {
              id: Date.now().toString(), 
              user: 'System', 
              text: win ? '🎉 مبروك! لقد فزت في الجولة' : '😢 خسرت الجولة! وقت العقاب 🤡',
              isSystem: true,
              color: win ? 'text-green-400' : 'text-red-500 font-bold'
          }]);

          // Punishment Duration (10s)
          setTimeout(() => {
              setPkState('ENDED');
              setPkPunishment(null);
              setTimeout(() => {
                  setPkState('IDLE');
                  setMyScore(0);
                  setOpponentScore(0);
              }, 2000);
          }, 10000);
      }
      return () => clearInterval(interval);
  }, [pkState, pkTimer, pkMultiplier]);


  // --- ACTIONS ---

  const applyFlash = (enable: boolean) => {
    if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        try {
            // Try to set Torch constraint
            const constraints = { advanced: [{ torch: enable }] } as any;
            track.applyConstraints(constraints).catch(e => console.log('Flash not supported on this track', e));
        } catch (e) {
            // Ignore error if torch is not supported
        }
    }
  };

  const toggleFlash = () => {
      const newState = !isFlashOn;
      setIsFlashOn(newState);
      // If we are on environment camera, try real flash
      if (facingMode === 'environment' && !isMockMode) {
          applyFlash(newState);
      }
      // If front camera or mock, we just use the state to show a white overlay (simulated flash)
  };

  const toggleTimer = () => {
      if (timerDuration === 0) setTimerDuration(3);
      else if (timerDuration === 3) setTimerDuration(10);
      else setTimerDuration(0);
  };

  const startCountdownAndRecord = () => {
      let count = timerDuration;
      setCountdown(count);
      
      const interval = setInterval(() => {
          count--;
          if (count <= 0) {
              clearInterval(interval);
              setCountdown(null);
              startRecording();
          } else {
              setCountdown(count);
          }
      }, 1000);
  };

  const handleCaptureClick = () => {
      if (mode === 'VIDEO') {
          if (isRecording) {
              stopRecording();
          } else {
              if (timerDuration > 0) {
                  startCountdownAndRecord();
              } else {
                  startRecording(); 
              }
          }
      } else if (mode === 'STORY') {
          captureImage();
      }
  };

  const startRecording = () => { setIsRecording(true); setMediaType('video'); };
  const stopRecording = () => { setIsRecording(false); setMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4'); setStep('EDIT'); };
  const captureImage = () => { setMediaType('image'); setMediaUrl(`https://picsum.photos/500/900?random=${Date.now()}`); setStep('EDIT'); };

  // Gallery Select
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        setStep('EDIT');
    }
  };

  // --- EDITING LOGIC (Text, Stickers, Dragging) ---

  const addTextOverlay = () => {
      if (!textInput.trim()) return;
      const newOverlay: OverlayItem = {
          id: Date.now().toString(),
          type: 'text',
          content: textInput,
          x: 50, // center percent
          y: 50,
          color: textColor,
          scale: 1
      };
      setOverlays(prev => [...prev, newOverlay]);
      setTextInput('');
      setActiveTool('none');
  };

  const addStickerOverlay = (emoji: string) => {
      const newOverlay: OverlayItem = {
          id: Date.now().toString(),
          type: 'sticker',
          content: emoji,
          x: 50,
          y: 50,
          scale: 1.5
      };
      setOverlays(prev => [...prev, newOverlay]);
      setActiveTool('none');
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
      if (activeTool !== 'none') return; // Don't drag if tool is open
      dragItem.current = id;
      setActiveOverlayId(id);
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      if (editContainerRef.current) {
         // Calculate offset? For simplicity, we just snap to center of touch
         // Or implement full delta logic. Let's do simple relative movement.
      }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragItem.current || !editContainerRef.current) return;
      
      const rect = editContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      setOverlays(prev => prev.map(o => o.id === dragItem.current ? { ...o, x, y } : o));
  };

  const handleDragEnd = () => {
      dragItem.current = null;
  };

  const removeActiveOverlay = () => {
      if (activeOverlayId) {
          setOverlays(prev => prev.filter(o => o.id !== activeOverlayId));
          setActiveOverlayId(null);
      }
  };

  // --- PUBLISH ---

  const handlePublish = () => {
      setIsPublishing(true);
      setTimeout(() => {
          if (mode === 'STORY') {
              onPublishStory({ id: Date.now(), type: mediaType, url: mediaUrl!, timestamp: Date.now(), duration: 5 });
          } else {
              onPublishReel({ id: Date.now().toString(), videoUrl: mediaUrl!, username: 'me', userAvatar: '', description: caption, likes: 0, comments: 0, shares: 0, category: privacy === 'PUBLIC' ? 'public' : 'private' });
          }
          setIsPublishing(false); onClose();
      }, 1500);
  };

  const startLive = () => {
      setIsPublishing(true);
      setTimeout(() => {
          setIsPublishing(false);
          setStep('LIVE_ACTIVE');
          setLiveViewers(24); 
          setViewerBoost(true);
          setTimeout(() => setViewerBoost(false), 5000);
      }, 1500);
  };

  const startPK = () => {
      if (pkState !== 'IDLE') return;
      setPkState('SEARCHING');
      // Simulate matching
      setTimeout(() => {
          setPkState('BATTLE');
          setPkTimer(180); // 3 Minutes Battle
          setMyScore(0);
          setOpponentScore(0);
          setPkMultiplier(false);
          setLiveMessages(prev => [...prev, { id: Date.now().toString(), user: 'System', text: '⚔️ بدأت الجولة! كبس وادعم للفوز', isSystem: true, color: 'text-blue-400' }]);
      }, 3000);
  };

  const notifyFriends = () => {
      setViewerBoost(true);
      setLiveViewers(prev => prev + 15);
      setLiveMessages(prev => [...prev, { id: Date.now().toString(), user: 'System', text: '📢 تم استدعاء 15 صديقاً للدعم!', isSystem: true, color: 'text-green-400' }]);
      setTimeout(() => setViewerBoost(false), 5000);
  };

  const handleTapLike = () => {
      setLiveLikes(prev => prev + 1);
      const newHeart: FloatingHeart = {
          id: Date.now() + Math.random(),
          offset: Math.random() * 40 - 20,
          color: ['#FF0000', '#E91E63', '#9C27B0', '#FF5722', '#FFC107'][Math.floor(Math.random() * 5)]
      };
      setFloatingHearts(prev => [...prev, newHeart]);
      setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id)), 1000);

      if (pkState === 'BATTLE') {
          let points = 3;
          if (pkMultiplier) points *= 2;
          setMyScore(prev => prev + points);
      }
      
      if (liveLikes > 0 && liveLikes % 50 === 0) {
           setViewerBoost(true);
           setTimeout(() => setViewerBoost(false), 3000);
      }
  };

  const handleSendComment = () => {
      if (!commentInput.trim()) return;
      
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: 'أنت',
          text: commentInput.trim(),
          color: 'text-white'
      };
      
      setLiveMessages(prev => [...prev, newMsg]);
      setCommentInput('');
      setLiveLikes(prev => prev + 1); // Engagement boost
  };

  const sendGift = (gift: GiftItem) => {
      if (userCoins >= gift.cost) {
          setUserCoins(prev => prev - gift.cost);
          setDiamonds(prev => prev + (gift.cost * 10)); 
          
          setActiveGiftAnim(gift);
          setGiftCombo(prev => prev + 1);
          setTimeout(() => setActiveGiftAnim(null), gift.animationDuration);

          if (pkState === 'BATTLE') {
              let points = gift.scorePoints;
              if (pkMultiplier) points *= 2;
              setMyScore(prev => prev + points);
          }

          setLiveViewers(prev => prev + Math.floor(gift.scorePoints / 2)); 
          setViewerBoost(true);
          setTimeout(() => setViewerBoost(false), 8000);

          setLiveMessages(prev => [...prev, {
              id: Date.now().toString(),
              user: 'أنت',
              text: `أرسل ${gift.name} x1`,
              color: 'text-pink-400 font-bold'
          }]);

          if (gift.type === 'legendary') setShowGiftPanel(false);
      } else {
          alert('لا يوجد رصيد كافي');
      }
  };

  const acceptGuest = (guestId: string) => {
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, status: 'ACTIVE' } : g));
      setLiveMessages(prev => [...prev, { id: Date.now().toString(), user: 'System', text: '🎤 انضم ضيف جديد للمنصة', isSystem: true, color: 'text-blue-400' }]);
  };

  const declineGuest = (guestId: string) => {
      setGuests(prev => prev.filter(g => g.id !== guestId));
  };

  // --- RENDER HELPERS ---
  const renderCamera = () => (
      <div className={`relative bg-gray-900 w-full h-full overflow-hidden`}>
          {isMockMode ? (
              <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4" 
                autoPlay loop muted 
                className={`w-full h-full object-cover opacity-80 ${pkPunishment === 'clown' ? 'grayscale contrast-125' : ''}`} 
                style={{ filter: selectedFilter !== 'none' ? selectedFilter : undefined }}
              />
          ) : (
              <video 
                ref={videoRef} 
                autoPlay playsInline muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''} ${pkPunishment === 'clown' ? 'sepia hue-rotate-180' : ''}`} 
                style={{ filter: selectedFilter !== 'none' ? selectedFilter : undefined }}
              />
          )}
          
          {/* Simulated Flash Overlay (For front camera or mock) */}
          {isFlashOn && (
              <div className="absolute inset-0 bg-white/30 pointer-events-none mix-blend-overlay z-[5]"></div>
          )}

          {/* Punishment Overlay */}
          {pkPunishment === 'clown' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-[150px] animate-bounce drop-shadow-2xl">🤡</div>
              </div>
          )}
      </div>
  );

  // === UI: VERTICAL MENU ===
  if (step === 'MENU') {
      return (
          <div className="h-full w-full bg-black/95 backdrop-blur-xl flex flex-col relative animate-in fade-in duration-300">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full z-10"><X className="text-white" /></button>
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                  <h2 className="text-white font-bold text-2xl mb-4">ماذا تريد أن تنشر؟</h2>
                  <MenuCard title="فيديو" subtitle="تسجيل، تعديل، ونشر" icon={<ClapperboardIcon />} color="from-purple-500 to-pink-500" onClick={() => { setMode('VIDEO'); setStep('CAPTURE'); }} />
                  <MenuCard title="بث مباشر (Live)" subtitle="تفاعل مع المتابعين الآن" icon={<Radio className="w-8 h-8 text-white" />} color="from-red-500 to-orange-500" onClick={() => { setMode('LIVE'); setStep('LIVE_SETUP'); }} />
                  <MenuCard title="قصة (Story)" subtitle="تختفي بعد 24 ساعة" icon={<HistoryIcon />} color="from-blue-500 to-cyan-500" onClick={() => { setMode('STORY'); setStep('CAPTURE'); }} />
              </div>
          </div>
      );
  }

  // === UI: CAPTURE ===
  if (step === 'CAPTURE') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col">
              <div className="absolute inset-0">{renderCamera()}</div>
              
              {/* Countdown Overlay */}
              {countdown !== null && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                      <div className="text-[150px] font-black text-white drop-shadow-2xl animate-ping">{countdown}</div>
                  </div>
              )}

              {/* Hidden Gallery Input */}
              <input 
                  type="file" 
                  ref={galleryInputRef} 
                  onChange={handleGallerySelect} 
                  accept="image/*,video/*" 
                  className="hidden" 
              />

              <div className="absolute top-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
                  <button onClick={() => setStep('MENU')}><X className="text-white w-8 h-8" /></button>
                  {mode === 'VIDEO' && (
                      <div className="flex flex-col gap-4 bg-black/40 p-2 rounded-full backdrop-blur-md">
                          <ToolIcon 
                            icon={<RotateCcw />} 
                            label="قلب" 
                            onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} 
                          />
                          <ToolIcon 
                            icon={isFlashOn ? <Zap className="text-yellow-400 fill-yellow-400" /> : <ZapOff />} 
                            label="فلاش" 
                            onClick={toggleFlash}
                            active={isFlashOn}
                          />
                          <ToolIcon 
                            icon={<Timer />} 
                            label={timerDuration > 0 ? `${timerDuration}s` : "مؤقت"} 
                            onClick={toggleTimer}
                            active={timerDuration > 0}
                          />
                      </div>
                  )}
              </div>
              {isRecording && <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-800 z-20"><div className="h-full bg-red-500 transition-all duration-100" style={{ width: `${progress}%` }}></div></div>}
              
              {/* Effects Panel */}
              {showEffectsPanel && (
                  <div className="absolute bottom-28 w-full px-4 overflow-x-auto no-scrollbar z-20 animate-in slide-in-from-bottom duration-200">
                      <div className="flex gap-2">
                          <button onClick={() => setSelectedFilter('none')} className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${selectedFilter === 'none' ? 'border-[#0095f6]' : 'border-white'}`}>
                              <div className="w-full h-full bg-gray-500 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></div>
                          </button>
                          {FILTERS.slice(1).map(f => (
                              <button key={f.name} onClick={() => setSelectedFilter(f.value)} className="flex flex-col items-center gap-1">
                                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 overflow-hidden ${selectedFilter === f.value ? 'border-[#0095f6]' : 'border-white'}`}>
                                      <div className="w-full h-full" style={{ background: f.color }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">{f.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              <div className="absolute bottom-0 w-full pb-10 pt-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end z-10">
                  <div className="flex gap-4 mb-6 text-sm font-bold">
                      <span className={`transition-colors ${mode === 'VIDEO' ? 'text-white bg-white/20 px-3 py-1 rounded-full' : 'text-gray-400'}`}>فيديو</span>
                      <span className={`transition-colors ${mode === 'STORY' ? 'text-white bg-white/20 px-3 py-1 rounded-full' : 'text-gray-400'}`}>قصة</span>
                  </div>
                  <div className="flex items-center w-full justify-around px-8">
                      {/* Gallery Button */}
                      <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => galleryInputRef.current?.click()}>
                          <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-800 flex items-center justify-center overflow-hidden">
                             <ImageIcon className="w-5 h-5 text-white" />
                          </div>
                      </div>

                      {/* Capture Button */}
                      <button 
                        onMouseDown={() => { if(mode === 'VIDEO' && timerDuration === 0) startRecording(); }} 
                        onMouseUp={() => { if(mode === 'VIDEO' && timerDuration === 0) stopRecording(); }} 
                        onClick={handleCaptureClick} 
                        className={`relative transition-all duration-200 ${isRecording ? 'scale-110' : 'hover:scale-105'}`}
                      >
                          <div className={`rounded-full border-[4px] border-white flex items-center justify-center ${mode === 'VIDEO' ? 'w-20 h-20' : 'w-18 h-18'}`}>
                               <div className={`rounded-full transition-all duration-200 ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : mode === 'VIDEO' ? 'w-16 h-16 bg-red-500' : 'w-14 h-14 bg-white'}`}></div>
                          </div>
                      </button>

                      {/* Effects Button */}
                      <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowEffectsPanel(!showEffectsPanel)}>
                          <div className={`w-8 h-8 rounded-full border border-white/50 bg-white/10 flex items-center justify-center transition-colors ${showEffectsPanel ? 'bg-yellow-500 text-black border-yellow-500' : ''}`}>
                              <Wand2 className="w-4 h-4 text-white" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // === UI: EDIT ===
  if (step === 'EDIT') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col">
              <audio ref={audioRef} className="hidden" />
              
              {/* Media Container */}
              <div 
                  ref={editContainerRef}
                  className="flex-1 relative m-4 rounded-xl overflow-hidden border border-gray-800 bg-[#121212] touch-none"
                  onMouseDown={(e) => activeOverlayId && handleDragStart(e, activeOverlayId)}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onTouchStart={(e) => activeOverlayId && handleDragStart(e, activeOverlayId)}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
              >
                   {mediaType === 'video' ? (
                       <video 
                            src={mediaUrl!} 
                            autoPlay 
                            loop 
                            muted={!!selectedMusic} // Mute original audio if music is selected
                            className="w-full h-full object-contain pointer-events-none"
                            style={{ filter: selectedFilter !== 'none' ? selectedFilter : undefined }}
                       />
                   ) : (
                       <img 
                            src={mediaUrl!} 
                            className="w-full h-full object-contain pointer-events-none"
                            style={{ filter: selectedFilter !== 'none' ? selectedFilter : undefined }}
                       />
                   )}
                   
                   {/* OVERLAYS RENDER */}
                   {overlays.map(overlay => (
                       <div 
                          key={overlay.id}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none ${activeOverlayId === overlay.id ? 'z-50' : 'z-10'}`}
                          style={{ left: `${overlay.x}%`, top: `${overlay.y}%` }}
                          onMouseDown={(e) => handleDragStart(e, overlay.id)}
                          onTouchStart={(e) => handleDragStart(e, overlay.id)}
                       >
                           {overlay.type === 'text' ? (
                               <p 
                                  className="font-bold text-2xl drop-shadow-md text-center px-4 py-2 rounded-lg" 
                                  style={{ color: overlay.color, textShadow: '0 2px 4px rgba(0,0,0,0.5)', backgroundColor: activeOverlayId === overlay.id ? 'rgba(255,255,255,0.2)' : 'transparent' }}
                               >
                                   {overlay.content}
                               </p>
                           ) : (
                               <div 
                                  className="text-6xl drop-shadow-md"
                                  style={{ transform: `scale(${overlay.scale})`, border: activeOverlayId === overlay.id ? '2px dashed white' : 'none', borderRadius: '8px', padding: '4px' }}
                               >
                                   {overlay.content}
                               </div>
                           )}
                       </div>
                   ))}

                   {/* Main Tools (Right Side) */}
                   <div className="absolute top-4 right-4 flex flex-col gap-4 z-40">
                       <ToolIcon icon={<Type />} label="نص" onClick={() => setActiveTool('text')} />
                       <ToolIcon icon={<Smile />} label="ملصق" onClick={() => setActiveTool('sticker')} />
                       <ToolIcon icon={<Music />} label="صوت" onClick={() => setActiveTool('music')} active={!!selectedMusic} />
                   </div>
                   
                   <button onClick={() => setStep('CAPTURE')} className="absolute top-4 left-4 p-2 bg-black/40 rounded-full text-white z-40"><X /></button>

                   {/* Delete Zone (Only Visible Dragging) */}
                   {activeOverlayId && (
                       <button onClick={removeActiveOverlay} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/80 p-3 rounded-full text-white animate-in slide-in-from-bottom z-50">
                           <Trash2 className="w-6 h-6" />
                       </button>
                   )}
              </div>

              {/* Next Button / Publish */}
              <div className="px-6 pb-6 pt-2 flex justify-between items-center bg-black">
                  {selectedMusic && (
                      <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full text-xs text-white max-w-[150px]">
                          <Music className="w-3 h-3" />
                          <span className="truncate">{selectedMusic.name}</span>
                          <button onClick={() => setSelectedMusic(null)}><X className="w-3 h-3 text-gray-400 hover:text-white" /></button>
                      </div>
                  )}
                  <button onClick={() => mode === 'STORY' ? handlePublish() : setStep('PUBLISH_SETUP')} disabled={isPublishing} className="bg-[#0095f6] hover:bg-[#0085dd] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ml-auto">
                      {isPublishing ? 'جاري النشر...' : mode === 'STORY' ? 'نشر قصتي' : 'التالي'} {!isPublishing && <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
                  </button>
              </div>

              {/* === TOOL OVERLAYS === */}
              
              {/* 1. TEXT TOOL */}
              {activeTool === 'text' && (
                  <div className="absolute inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center animate-in fade-in">
                      <div className="absolute top-4 right-4 flex gap-4">
                          <button onClick={addTextOverlay} className="font-bold text-white text-lg">تم</button>
                      </div>
                      <input 
                          autoFocus
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="اكتب شيئاً..."
                          className="bg-transparent border-none outline-none text-center text-3xl font-bold w-full max-w-sm px-4 placeholder-gray-500"
                          style={{ color: textColor }}
                      />
                      <div className="absolute bottom-10 flex gap-3 overflow-x-auto max-w-full px-4 no-scrollbar">
                          {COLORS.map(c => (
                              <button 
                                key={c} 
                                onClick={() => setTextColor(c)} 
                                className={`w-8 h-8 rounded-full border-2 ${textColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                          ))}
                      </div>
                  </div>
              )}

              {/* 2. STICKER TOOL */}
              {activeTool === 'sticker' && (
                  <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/50" onClick={() => setActiveTool('none')}>
                      <div className="bg-[#1c1c1c] h-[50vh] rounded-t-2xl p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-white font-bold">ملصقات</h3>
                               <button onClick={() => setActiveTool('none')}><X className="text-gray-400" /></button>
                           </div>
                           <div className="grid grid-cols-5 gap-4 text-4xl">
                               {STICKERS.map(s => (
                                   <button key={s} onClick={() => addStickerOverlay(s)} className="hover:scale-110 transition-transform">{s}</button>
                               ))}
                           </div>
                      </div>
                  </div>
              )}

              {/* 3. MUSIC TOOL */}
              {activeTool === 'music' && (
                  <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/50" onClick={() => setActiveTool('none')}>
                      <div className="bg-[#1c1c1c] h-[60vh] rounded-t-2xl p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-white font-bold">الموسيقى</h3>
                               <button onClick={() => setActiveTool('none')}><X className="text-gray-400" /></button>
                           </div>
                           <div className="space-y-2">
                               {MUSIC_TRACKS.map(track => (
                                   <button 
                                      key={track.id} 
                                      onClick={() => { setSelectedMusic({ name: track.name, url: track.url }); setActiveTool('none'); }}
                                      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 ${selectedMusic?.url === track.url ? 'bg-white/10 border border-blue-500' : ''}`}
                                   >
                                       <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                                               <Music className="w-5 h-5" />
                                           </div>
                                           <div className="text-right">
                                               <p className="text-sm font-bold text-white">{track.name}</p>
                                               <p className="text-xs text-gray-500">0:30</p>
                                           </div>
                                       </div>
                                       {selectedMusic?.url === track.url && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                                   </button>
                               ))}
                           </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // === UI: PUBLISH SETUP ===
  if (step === 'PUBLISH_SETUP') {
      return (
          <div className="h-full w-full bg-[#121212] flex flex-col relative animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <button onClick={() => setStep('EDIT')}><ChevronDown className="w-6 h-6 text-white rotate-90" /></button>
                  <h2 className="font-bold text-white text-lg">نشر جديد</h2>
                  <div className="w-6"></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="flex gap-4">
                      <div className="w-24 h-32 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                          <video 
                            src={mediaUrl!} 
                            className="w-full h-full object-cover opacity-70" 
                            style={{ filter: selectedFilter !== 'none' ? selectedFilter : undefined }}
                          />
                          {/* Mini Overlay Preview */}
                          <div className="absolute inset-0 flex items-center justify-center">
                              {overlays.length > 0 && <span className="text-[10px] bg-black/50 text-white px-1 rounded">+{overlays.length} تعديلات</span>}
                          </div>
                      </div>
                      <div className="flex-1">
                          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="اكتب وصفاً..." className="w-full h-32 bg-transparent text-white resize-none outline-none text-sm placeholder-gray-500" />
                      </div>
                  </div>
              </div>
              <div className="p-4 border-t border-gray-800 bg-[#121212]">
                  <button onClick={handlePublish} disabled={isPublishing} className="w-full py-3 rounded-xl bg-[#0095f6] text-white font-bold hover:bg-[#0085dd]">
                      {isPublishing ? 'جاري النشر...' : 'نشر الفيديو'}
                  </button>
              </div>
          </div>
      );
  }

  // === UI: LIVE SETUP ===
  if (step === 'LIVE_SETUP') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col">
              <div className="absolute inset-0">{renderCamera()}</div>
              <div className="absolute inset-0 bg-black/60 flex flex-col p-6 z-10">
                  <div className="flex justify-between items-start">
                      <button onClick={() => setStep('MENU')}><X className="text-white w-8 h-8" /></button>
                      <div className="bg-red-600 px-3 py-1 rounded-md text-xs font-bold text-white uppercase">LIVE</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-xs mx-auto">
                      <h2 className="text-2xl font-bold text-white">إعداد البث</h2>
                      <input type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} placeholder="عنوان البث..." className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center outline-none" />
                      <div className="flex gap-2 w-full">
                          {['عام', 'ألعاب', 'موسيقى'].map(cat => (
                              <button key={cat} onClick={() => setLiveCategory(cat)} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${liveCategory === cat ? 'bg-white text-black' : 'text-gray-400 border-gray-600'}`}>{cat}</button>
                          ))}
                      </div>
                  </div>
                  <button onClick={startLive} disabled={isPublishing} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-full text-lg shadow-lg">
                      {isPublishing ? 'جاري الاتصال...' : 'بدء البث 📡'}
                  </button>
              </div>
          </div>
      );
  }

  // === UI: LIVE ACTIVE ===
  if (step === 'LIVE_ACTIVE') {
      const activeGuests = guests.filter(g => g.status === 'ACTIVE');
      
      // Dynamic Layout Logic
      const isSplitScreen = pkState !== 'IDLE' && pkState !== 'SEARCHING';
      const isMultiGuest = activeGuests.length > 0;
      
      return (
          <div className="h-full w-full bg-black relative flex flex-col overflow-hidden">
              <style>{`
                @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-200px) scale(0.5); opacity: 0; } }
                .floating-heart { animation: floatUp 1.2s ease-out forwards; }
                @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }
                .live-ring { animation: pulse-red 2s infinite; }
              `}</style>

              {/* === VIDEO CONTENT LAYER === */}
              <div className="absolute inset-0 flex flex-col">
                  {/* SEARCHING OVERLAY */}
                  {pkState === 'SEARCHING' && (
                      <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                          <div className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                          <div className="flex gap-8 items-center">
                               <div className="flex flex-col items-center">
                                   <div className="w-16 h-16 rounded-full bg-gray-700 mb-2 overflow-hidden border-2 border-white"><img src="https://picsum.photos/100/100?random=me" className="w-full h-full" /></div>
                                   <span className="text-white font-bold">أنت</span>
                               </div>
                               <span className="text-2xl font-black text-white italic">VS</span>
                               <div className="flex flex-col items-center opacity-50">
                                   <div className="w-16 h-16 rounded-full bg-gray-800 mb-2 border-2 border-gray-600"></div>
                                   <span className="text-gray-400 font-bold">...</span>
                               </div>
                          </div>
                      </div>
                  )}

                  {isSplitScreen ? (
                      // PK SPLIT MODE
                      <div className="h-[50vh] flex w-full relative mt-20">
                          <div className="w-1/2 h-full border-r border-black relative">
                              {renderCamera()}
                              <div className="absolute bottom-2 right-2 bg-black/50 px-2 rounded text-[10px] text-white">أنت</div>
                          </div>
                          <div className="w-1/2 h-full relative bg-gray-800">
                              <img src="https://picsum.photos/400/800?random=opp" className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 left-2 bg-red-600 px-2 rounded text-[10px] text-white font-bold">الخصم</div>
                          </div>
                          
                          {/* PK CENTER BADGE */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                              <img src="https://cdn-icons-png.flaticon.com/512/5278/5278658.png" className="w-16 h-16 drop-shadow-lg animate-bounce" />
                          </div>
                      </div>
                  ) : isMultiGuest ? (
                      // MULTI-LIVE GRID MODE
                      <div className="flex-1 flex flex-col pt-20">
                          <div className="h-1/2 w-full relative">{renderCamera()}</div>
                          <div className="h-1/2 w-full grid grid-cols-2 bg-gray-900 border-t border-gray-800">
                              {activeGuests.map(guest => (
                                  <div key={guest.id} className="relative border border-gray-800">
                                      <img src={guest.avatar} className="w-full h-full object-cover" />
                                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 rounded-full">
                                          <span className="text-[10px] text-white">{guest.name}</span>
                                          {guest.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                                      </div>
                                  </div>
                              ))}
                              {/* Empty Slots */}
                              {[...Array(4 - activeGuests.length)].map((_, i) => (
                                  <div key={i} className="flex items-center justify-center bg-black/20 text-gray-600">
                                      <UserPlus className="w-6 h-6 opacity-30" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      // NORMAL FULL SCREEN
                      <div className="w-full h-full">{renderCamera()}</div>
                  )}
              </div>

              {/* === INTERFACE LAYER === */}
              <div className="absolute inset-0 flex flex-col z-10 bg-gradient-to-b from-black/30 via-transparent to-black/60 p-4 pb-safe pointer-events-none">
                  
                  {/* TOP HEADER */}
                  <div className="flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-2 bg-black/30 rounded-full p-1 pr-3 backdrop-blur-md border border-white/10">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 p-[2px]">
                               <img src="https://picsum.photos/100/100" className="w-full h-full rounded-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-white">أنت</span>
                              <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                  <span className="text-[10px] text-white">{liveViewers}</span>
                              </div>
                          </div>
                          <button onClick={notifyFriends} className="bg-[#0095f6] px-2 py-0.5 rounded text-[10px] font-bold text-white ml-1 flex items-center gap-1">
                              <UserPlus className="w-3 h-3" /> استدعاء
                          </button>
                      </div>

                      <div className="flex items-center gap-2">
                           <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
                      </div>
                  </div>

                  {/* BOOST ALERT */}
                  {viewerBoost && (
                      <div className="self-center mt-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-white" />
                          تم دفع اللايف للمقدمة! 🚀
                      </div>
                  )}

                  {/* PK BAR (If Active) */}
                  {(pkState === 'BATTLE' || pkState === 'PUNISHMENT' || pkState === 'ENDED') && (
                       <div className="w-full mt-4 animate-in slide-in-from-top duration-500 pointer-events-auto">
                           <div className="flex justify-between items-center bg-black/80 rounded-t-xl px-4 py-1 text-white text-xs font-bold">
                               <span className="text-blue-400">أنت {pkMultiplier && <span className="text-yellow-400 animate-pulse ml-1">x2</span>}</span>
                               <span className="text-2xl font-black italic text-yellow-500 mx-2">{pkTimer}s</span>
                               <span className="text-red-400">الخصم</span>
                           </div>
                           <div className="h-6 w-full flex relative rounded-b-xl overflow-hidden shadow-lg border-2 border-yellow-500/30">
                               <div className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300 flex items-center px-2 justify-start" style={{ width: `${(myScore + opponentScore) === 0 ? 50 : (myScore / (myScore + opponentScore)) * 100}%` }}>
                                   <span className="font-black text-white drop-shadow-md text-xs">{myScore}</span>
                               </div>
                               <div className="h-full bg-gradient-to-l from-red-700 to-red-500 transition-all duration-300 flex items-center px-2 justify-end flex-1">
                                   <span className="font-black text-white drop-shadow-md text-xs">{opponentScore}</span>
                               </div>
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black font-black text-[10px] px-1 rounded transform -skew-x-12">PK</div>
                           </div>
                       </div>
                  )}

                  <div className="flex-1"></div>

                  {/* CHAT AREA */}
                  <div 
                      ref={chatScrollRef}
                      className="h-48 overflow-y-auto no-scrollbar mask-image-linear-gradient flex flex-col justify-end space-y-2 mb-2 w-3/4 pointer-events-auto"
                  >
                      {liveMessages.map((msg, i) => (
                          <div key={i} className={`text-sm px-2 py-1 rounded-md bg-black/20 backdrop-blur-sm self-start animate-in slide-in-from-left-2 ${msg.isSystem ? 'bg-transparent pl-0' : ''}`}>
                              {msg.user && <span className="font-bold text-gray-300 ml-1">{msg.user}:</span>}
                              <span className={`text-white ${msg.color || ''}`}>{msg.text}</span>
                          </div>
                      ))}
                  </div>

                  {/* ANIMATIONS LAYER */}
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                       {floatingHearts.map(h => (
                           <Heart key={h.id} className="absolute bottom-20 right-4 w-10 h-10 floating-heart fill-current" style={{ color: h.color, left: `${80 + h.offset}%` }} />
                       ))}
                       {activeGiftAnim && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in zoom-in duration-300">
                               <div className="text-8xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-bounce">{activeGiftAnim.icon}</div>
                               <div className="bg-yellow-500 text-black font-black text-xl px-4 py-1 rounded-full mt-2 skew-x-[-10deg] border-2 border-white">
                                   Combo x{giftCombo}
                               </div>
                           </div>
                       )}
                  </div>

                  {/* CONTROLS */}
                  <div className="flex items-end gap-3 pointer-events-auto">
                      <div className="flex-1 bg-black/40 rounded-full h-10 px-1 flex items-center backdrop-blur-md border border-white/10 focus-within:border-white/50 transition-colors">
                          <input 
                              type="text" 
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                              placeholder="أضف تعليقاً..." 
                              className="bg-transparent border-none outline-none text-white text-sm w-full px-3 placeholder-gray-400 h-full"
                          />
                          {commentInput.trim() && (
                               <button onClick={handleSendComment} className="p-1.5 mr-1 bg-[#0095f6] rounded-full text-white hover:bg-[#0085dd]">
                                    <Send className="w-3 h-3 rtl:rotate-180" />
                               </button>
                          )}
                      </div>
                      
                      {/* GUESTS BUTTON */}
                      <button onClick={() => setShowGuestPanel(true)} className="relative w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/10">
                          <Users className="w-5 h-5 text-white" />
                          {guests.filter(g => g.status === 'REQUESTING').length > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                                  {guests.filter(g => g.status === 'REQUESTING').length}
                              </span>
                          )}
                      </button>

                      {/* PK BUTTON */}
                      <button onClick={startPK} disabled={pkState !== 'IDLE'} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 ${pkState !== 'IDLE' ? 'bg-gray-700 opacity-50' : 'bg-gradient-to-tr from-blue-600 to-purple-600'}`}>
                          <Swords className="w-5 h-5 text-white" />
                      </button>

                      {/* GIFT BUTTON */}
                      <button onClick={() => setShowGiftPanel(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center backdrop-blur-md border border-white/20 animate-pulse">
                          <Gift className="w-5 h-5 text-white" />
                      </button>

                      {/* TAP BUTTON */}
                      <button onClick={handleTapLike} className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center backdrop-blur-md border-2 border-red-500/50 active:scale-90 transition-transform live-ring">
                          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                      </button>
                  </div>
              </div>

              {/* === GIFT PANEL === */}
              {showGiftPanel && (
                  <div className="absolute inset-0 z-[100] flex flex-col justify-end">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setShowGiftPanel(false)}></div>
                      <div className="bg-[#1c1c1c] rounded-t-2xl p-4 relative z-10 animate-in slide-in-from-bottom duration-300">
                          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-yellow-500 font-bold text-sm">
                                  <span>🪙 {userCoins}</span>
                              </div>
                              <h3 className="text-white font-bold">هدايا</h3>
                              <button onClick={() => setShowGiftPanel(false)}><X className="text-gray-400 w-5 h-5" /></button>
                          </div>
                          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto no-scrollbar">
                              {LIVE_GIFTS.map(gift => (
                                  <button key={gift.id} onClick={() => sendGift(gift)} className="flex flex-col items-center p-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all">
                                      <div className="text-4xl mb-1">{gift.icon}</div>
                                      <span className="text-[10px] text-white font-bold">{gift.name}</span>
                                      <span className="text-[10px] text-yellow-500 font-bold">{gift.cost}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* === GUEST MANAGEMENT PANEL === */}
              {showGuestPanel && (
                  <div className="absolute inset-0 z-[100] flex flex-col justify-end">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setShowGuestPanel(false)}></div>
                      <div className="bg-[#1c1c1c] rounded-t-2xl p-4 relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[60vh] overflow-y-auto">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-white font-bold text-lg">الضيوف ({guests.length})</h3>
                              <button onClick={() => setShowGuestPanel(false)}><X className="text-white" /></button>
                          </div>

                          {guests.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">لا يوجد طلبات حالياً</div>
                          ) : (
                              <div className="space-y-4">
                                  {guests.map(guest => (
                                      <div key={guest.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-xl">
                                          <div className="flex items-center gap-3">
                                              <img src={guest.avatar} className="w-10 h-10 rounded-full" />
                                              <div>
                                                  <h4 className="font-bold text-white text-sm">{guest.name}</h4>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded ${guest.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                      {guest.status === 'ACTIVE' ? 'متصل' : 'قيد الانتظار'}
                                                  </span>
                                              </div>
                                          </div>
                                          <div className="flex gap-2">
                                              {guest.status === 'REQUESTING' ? (
                                                  <>
                                                      <button onClick={() => declineGuest(guest.id)} className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold">رفض</button>
                                                      <button onClick={() => acceptGuest(guest.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">قبول</button>
                                                  </>
                                              ) : (
                                                  <button onClick={() => declineGuest(guest.id)} className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">إخراج</button>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return null;
};

// --- SUBCOMPONENTS ---
const MenuCard = ({ title, subtitle, icon, color, onClick }: any) => (
    <button onClick={onClick} className={`w-full p-6 rounded-2xl bg-gradient-to-br ${color} relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg`}>
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="relative z-10 flex items-center gap-4 text-right">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">{icon}</div>
            <div><h3 className="text-white font-bold text-xl">{title}</h3><p className="text-white/80 text-sm">{subtitle}</p></div>
        </div>
    </button>
);

const ToolIcon = ({ icon, label, onClick, active }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
        <div className={`w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-colors ${active ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/40 text-white'}`}>{React.cloneElement(icon, { size: 18 })}</div>
        <span className="text-[10px] font-medium text-white shadow-black drop-shadow-md">{label}</span>
    </button>
);

const ClapperboardIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20.2 6 3 11l-.9-2.1 6-4.3-1.8-1.1L2.4 7.3 1.7 5.8l6.3-3.2 2.1 3.2 6.5-2.2 2.3 2.1-1.3 2.3Z"/><path d="m5 17 14-5.2-2.3-3.9-14 5.2z"/><path d="M4 17h16v4H4z"/></svg>;
const HistoryIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;

export default CreateVideo;