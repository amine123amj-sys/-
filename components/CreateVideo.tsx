
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, RotateCcw, Radio, MessageCircle, Heart, MoreHorizontal, Gift, Swords, Trophy, Flame, UserPlus, Share2,
  Users, Mic, MicOff, Video as VideoIcon, VideoOff, Send, Image as ImageIcon, Play, Pause, Trash2, Check,
  Settings, Activity, Layout, Eye, Star, TrendingUp, HandHelping, UserCheck, Loader2, UserMinus, LogOut, Shield, Lock, Bell, Hand, Coins, CreditCard, DollarSign,
  AlertCircle, ArrowRight, RefreshCw, Palette, Type, Music
} from 'lucide-react';
import { Reel, Story, StoryItem, OverlayItem } from '../types';

interface CreateVideoProps {
  onClose: () => void;
  onPublishReel: (reel: Reel) => void;
  onPublishStory: (storyItem: StoryItem) => void;
  initialMode?: 'MENU' | 'STORY'; 
}

type MainStep = 'MENU' | 'CAPTURE' | 'TEXT_EDIT' | 'EDIT' | 'LIVE_SETUP' | 'LIVE_ACTIVE';
type Mode = 'VIDEO' | 'LIVE' | 'STORY';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    avatar?: string;
    type?: 'gift' | 'text' | 'system' | 'action';
}

interface HeartAnim {
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    emoji?: string;
}

const INVITE_CANDIDATES = [
    { id: '1', name: 'أحمد علي', username: 'ahmed_ali', avatar: 'https://picsum.photos/50/50?random=1', online: true },
    { id: '2', name: 'سارة خالد', username: 'sara_k', avatar: 'https://picsum.photos/50/50?random=2', online: true },
    { id: '3', name: 'نور الهزاع', username: 'nour_h', avatar: 'https://picsum.photos/50/50?random=4', online: true },
];

const CreateVideo: React.FC<CreateVideoProps> = ({ onClose, onPublishReel, onPublishStory, initialMode = 'MENU' }) => {
  const [step, setStep] = useState<MainStep>(initialMode === 'STORY' ? 'CAPTURE' : 'MENU');
  const [mode, setMode] = useState<Mode>(initialMode === 'STORY' ? 'STORY' : 'VIDEO');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveViewers, setLiveViewers] = useState(0);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hearts, setHearts] = useState<HeartAnim[]>([]);
  
  // Media States
  const [capturedMedia, setCapturedMedia] = useState<{ url?: string, type: 'image' | 'video' | 'text', content?: string, background?: string } | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const [reelDescription, setReelDescription] = useState('');

  // Text Mode State
  const [textInput, setTextInput] = useState('');
  const [textBgIndex, setTextBgIndex] = useState(0);
  const textBackgrounds = [
    'linear-gradient(45deg, #f09433 0%, #dc2743 25%, #cc2366 50%, #bc1888 75%, #8a3ab9 100%)',
    'linear-gradient(to right, #00c6ff, #0072ff)',
    'linear-gradient(to right, #f85032, #e73827)',
    'linear-gradient(to right, #11998e, #38ef7d)',
    '#000000',
    '#ffffff'
  ];

  // Panels
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [liveGuest, setLiveGuest] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);

  useEffect(() => {
    if (step !== 'CAPTURE' && step !== 'LIVE_ACTIVE' && step !== 'LIVE_SETUP') return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } }, 
            audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (e) {
        console.error("Camera access failed", e);
      }
    };
    startCamera();
    return () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode, step]);

  const handleCapture = () => {
      setCapturedMedia({
          url: `https://picsum.photos/1080/1920?random=${Date.now()}`,
          type: 'image'
      });
      setStep('EDIT');
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;
    setIsRecordingVideo(true);
    setVideoTimer(0);
    videoChunksRef.current = [];
    
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia({ url, type: 'video' });
      setStep('EDIT');
    };
    mediaRecorderRef.current.start();
    
    timerRef.current = setInterval(() => {
      setVideoTimer(prev => {
        if (prev >= 15) {
          stopVideoRecording();
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVideo(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    longPressTimerRef.current = setTimeout(() => {
      startVideoRecording();
      longPressTimerRef.current = null;
    }, 500);
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      if (!isRecordingVideo) {
        handleCapture();
      }
    } else if (isRecordingVideo) {
      stopVideoRecording();
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setCapturedMedia({
              url: url,
              type: file.type.startsWith('video') ? 'video' : 'image'
          });
          setStep('EDIT');
      }
  };

  const handleTextComplete = () => {
      if (!textInput.trim()) return;
      setCapturedMedia({
          type: 'text',
          content: textInput,
          background: textBackgrounds[textBgIndex]
      });
      setStep('EDIT');
  };

  const publishMedia = () => {
      if (!capturedMedia) return;
      setIsPublishing(true);

      if (mode === 'VIDEO') {
          // Publish Reel
          const newReel: Reel = {
              id: `reel_${Date.now()}`,
              videoUrl: capturedMedia.url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
              username: 'أنت',
              userAvatar: 'https://picsum.photos/100/100?random=me',
              description: reelDescription || 'فيديو ريلز جديد ✨',
              likes: 0,
              comments: 0,
              shares: 0,
              category: 'custom'
          };
          setTimeout(() => {
              onPublishReel(newReel);
              setIsPublishing(false);
              onClose();
          }, 1500);
      } else {
          // Publish Story
          const newStoryItem: StoryItem = {
              id: Date.now(),
              type: capturedMedia.type,
              url: capturedMedia.url,
              content: capturedMedia.content,
              background: capturedMedia.background,
              timestamp: Date.now(),
              duration: capturedMedia.type === 'video' ? 15 : 5,
              viewers: 0
          };
          setTimeout(() => {
              onPublishStory(newStoryItem);
              setIsPublishing(false);
              onClose();
          }, 1500);
      }
  };

  const startLive = () => {
    setIsPublishing(true);
    setTimeout(() => {
        setIsPublishing(false);
        setStep('LIVE_ACTIVE');
        setLiveViewers(Math.floor(Math.random() * 150) + 50);
        setLiveMessages([
            { id: '1', user: 'سارة', text: 'أهلاً بالمضيف المبدع! ✨', avatar: 'https://picsum.photos/50/50?r=1', type: 'text' },
            { id: '2', user: 'خالد', text: 'بالتوفيق في البث المباشر 🚀', avatar: 'https://picsum.photos/50/50?r=2', type: 'text' }
        ]);
    }, 1200);
  };

  const addHeart = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart: HeartAnim = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        rotation: Math.random() * 40 - 20,
        color: '#0095f6'
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 1000);
  };

  const renderCamera = () => (
      <div className="relative bg-black w-full h-full overflow-hidden">
          {isCamOff ? (
              <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                  <VideoOff className="w-12 h-12 text-gray-700" />
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">الكاميرا متوقفة</span>
              </div>
          ) : (
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} />
          )}
      </div>
  );

  const handleInvite = (user: any) => {
    setLiveGuest({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        isMutedByHost: false,
        isCamStoppedByHost: false,
    });
    setShowInvitePanel(false);
  };

  if (step === 'MENU') {
    return (
        <div className="h-full w-full bg-[#0b0b0b] flex flex-col items-center justify-center gap-6 px-6 relative animate-in fade-in">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full border border-white/10 text-white"><X /></button>
            <MenuCard title="فيديو ريلز" subtitle="شارك لحظاتك" icon={<VideoIcon />} color="from-purple-600 to-pink-600" onClick={() => { setMode('VIDEO'); setStep('CAPTURE'); }} />
            <MenuCard title="بث مباشر" subtitle="تفاعل مباشر مع جمهورك" icon={<Radio />} color="from-red-600 to-orange-600" onClick={() => { setMode('LIVE'); setStep('LIVE_SETUP'); }} />
            <MenuCard title="قصة جديدة" subtitle="تختفي بعد 24 ساعة" icon={<ImageIcon />} color="from-blue-600 to-cyan-600" onClick={() => { setMode('STORY'); setStep('CAPTURE'); }} />
        </div>
    );
  }

  if (step === 'TEXT_EDIT') {
      return (
          <div className="h-full w-full flex flex-col transition-all duration-500" style={{ background: textBackgrounds[textBgIndex] }}>
              <div className="flex justify-between items-center p-6 z-10">
                  <button onClick={() => setStep('MENU')} className="p-2 text-white"><X className="w-8 h-8" /></button>
                  <div className="flex gap-4">
                    <button onClick={() => setTextBgIndex((textBgIndex + 1) % textBackgrounds.length)} className="p-3 bg-white/20 rounded-full text-white"><Palette /></button>
                    <button onClick={handleTextComplete} disabled={!textInput.trim()} className="bg-white text-black px-6 py-2 rounded-full font-black text-sm disabled:opacity-50">معاينة</button>
                  </div>
              </div>
              <div className="flex-1 flex items-center justify-center px-8">
                  <textarea 
                    autoFocus
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="ابدأ الكتابة..."
                    className="w-full bg-transparent border-none outline-none text-white text-4xl font-black text-center placeholder-white/40 resize-none overflow-hidden"
                    rows={4}
                  />
              </div>
          </div>
      );
  }

  if (step === 'CAPTURE') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col">
              <input type="file" ref={galleryInputRef} onChange={handleGallerySelect} accept="image/*,video/*" className="hidden" />
              <div className="absolute inset-0">{renderCamera()}</div>
              
              <div className="absolute top-10 left-0 right-0 px-6 flex justify-between items-center z-10">
                  <button onClick={() => setStep('MENU')} className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white"><X /></button>
                  <div className="px-4 py-1.5 bg-black/40 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {mode === 'VIDEO' ? 'إنشاء ريلز' : mode === 'STORY' ? 'إنشاء ستوري' : ''}
                  </div>
                  <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white"><RefreshCw /></button>
              </div>

              {isRecordingVideo && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-red-600 text-white px-4 py-1 rounded-full font-black text-sm animate-pulse flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>00:{videoTimer < 10 ? `0${videoTimer}` : videoTimer} / 00:15</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-10 z-10">
                  <button onClick={() => galleryInputRef.current?.click()} className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="relative flex items-center justify-center">
                    <button 
                      onMouseDown={handlePressStart}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onTouchStart={handlePressStart}
                      onTouchEnd={handlePressEnd}
                      className={`w-24 h-24 rounded-full border-4 border-white p-1.5 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] ${isRecordingVideo ? 'scale-125' : 'active:scale-90'}`}
                    >
                      <div className={`w-full h-full rounded-full transition-all ${isRecordingVideo ? 'bg-red-600 scale-75 rounded-lg' : 'bg-white'}`}></div>
                    </button>
                    {!isRecordingVideo && (
                      <span className="absolute -bottom-6 text-[10px] text-white/60 font-black uppercase">انقر للصور • مطول للفيديو</span>
                    )}
                  </div>

                  <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90 ${!isMuted ? 'bg-[#0095f6] border-[#0095f6] text-white' : 'bg-white/10 border-white/20 text-white'}`}>
                    <Music className="w-6 h-6" />
                  </button>
              </div>
          </div>
      );
  }

  if (step === 'EDIT') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col animate-in fade-in duration-500">
              <div className="flex-1 relative overflow-hidden">
                {capturedMedia?.type === 'video' ? (
                    <video src={capturedMedia.url} className="w-full h-full object-cover" autoPlay loop muted={isMuted} />
                ) : capturedMedia?.type === 'text' ? (
                    <div className="w-full h-full flex items-center justify-center p-8 text-center" style={{ background: capturedMedia.background }}>
                        <p className="text-white text-4xl font-black drop-shadow-lg">{capturedMedia.content}</p>
                    </div>
                ) : (
                    <img src={capturedMedia?.url} className="w-full h-full object-cover" />
                )}
              </div>
              
              <div className="absolute top-10 left-0 right-0 px-6 flex justify-between items-center z-10">
                  <button onClick={() => setStep('CAPTURE')} className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white"><Trash2 /></button>
                  <div className="flex gap-3">
                     <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-2xl border backdrop-blur-xl transition-all ${!isMuted ? 'bg-[#0095f6] border-[#0095f6] text-white' : 'bg-black/40 border-white/10 text-white'}`}><Music className="w-6 h-6" /></button>
                     <div className="px-5 py-3 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">مراجعة</div>
                  </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                  {mode === 'VIDEO' && (
                      <div className="mb-6 animate-in slide-in-from-bottom duration-300">
                          <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">أضف وصفاً للفيديو</label>
                          <textarea 
                            value={reelDescription}
                            onChange={(e) => setReelDescription(e.target.value)}
                            placeholder="اكتب شيئاً عن هذا الفيديو..."
                            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#0095f6] transition-all resize-none h-24"
                          />
                      </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                      <button onClick={publishMedia} disabled={isPublishing} className="w-full bg-[#0095f6] text-white py-4.5 rounded-[24px] font-black text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl">
                          {isPublishing ? <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><span className="mt-1">{mode === 'VIDEO' ? 'نشر في الريلز' : 'نشر في قصتي'}</span><ArrowRight className="w-6 h-6" /></>}
                      </button>
                      <button onClick={onClose} className="text-white/40 font-bold text-sm text-center py-2 tracking-wide uppercase">تجاهل المسودة</button>
                  </div>
              </div>
          </div>
      );
  }

  if (step === 'LIVE_SETUP') {
    return (
        <div className="h-full w-full bg-black relative flex flex-col">
            <div className="absolute inset-0">{renderCamera()}</div>
            <div className="absolute inset-0 bg-black/60 flex flex-col p-6 z-10 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <button onClick={() => setStep('MENU')} className="p-3 bg-black/40 rounded-2xl border border-white/10"><X className="text-white" /></button>
                    <button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="p-3 bg-black/40 rounded-2xl border border-white/10"><RotateCcw className="text-white" /></button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="w-full max-w-xs space-y-4">
                        <h2 className="text-2xl font-black text-white text-center">عنوان البث</h2>
                        <input type="text" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} placeholder="مثلاً: دردشة وتفاعل 💎" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white text-center outline-none focus:border-[#0095f6] transition-all" />
                    </div>
                </div>
                <button onClick={startLive} disabled={isPublishing} className="w-full bg-[#0095f6] py-5 rounded-3xl text-white font-black text-lg shadow-xl active:scale-95 transition-all">
                    {isPublishing ? 'جاري التحضير...' : 'بدء البث المباشر الآن'}
                </button>
            </div>
        </div>
    );
  }

  if (step === 'LIVE_ACTIVE') {
      return (
          <div className="h-full w-full bg-black relative flex flex-col overflow-hidden" onClick={addHeart}>
              <div className="absolute inset-0 z-0">{renderCamera()}</div>
              
              {/* Hearts Layer */}
              <div className="absolute inset-0 pointer-events-none z-50">
                  {hearts.map(h => (
                      <div key={h.id} className="absolute animate-takbees-heart" style={{ left: h.x, top: h.y, color: h.color }}>
                          <Heart className="w-12 h-12 fill-current shadow-blue-500" />
                      </div>
                  ))}
              </div>

              {/* Header Info */}
              <div className="relative z-20 flex justify-between items-start p-4 bg-gradient-to-b from-black/70 to-transparent pt-8">
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1 pr-3 rounded-full border border-white/10">
                          <img src="https://picsum.photos/100/100?random=me" className="w-8 h-8 rounded-full border border-white/20" />
                          <div className="flex flex-col"><span className="text-[10px] font-black text-white">أنت (المضيف)</span><span className="text-[9px] text-gray-300">{liveViewers} مشاهد</span></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2"></div>
                      </div>
                  </div>
                  <button onClick={() => setShowExitConfirm(true)} className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg">إنهاء</button>
              </div>

              {/* Interaction Feed */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-32 z-10 pointer-events-none overflow-hidden">
                  <div className="w-full max-w-[85%] space-y-2 no-scrollbar">
                      {liveMessages.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/5 animate-in slide-in-from-right duration-300">
                              <img src={m.avatar || ''} className="w-6 h-6 rounded-full" />
                              <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-gray-400">{m.user}</span>
                                  <p className="text-[11px] text-white leading-tight">{m.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 left-0 right-0 z-30 px-4 flex flex-col gap-3 pointer-events-auto">
                  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[30px] p-2 flex items-center justify-between shadow-2xl">
                      <div className="flex gap-2">
                          <StudioBtn icon={isMuted ? <MicOff className="text-red-500" /> : <Mic />} onClick={() => setIsMuted(!isMuted)} />
                          <StudioBtn icon={isCamOff ? <VideoOff className="text-red-500" /> : <VideoIcon />} onClick={() => setIsCamOff(!isCamOff)} />
                      </div>
                      <button onClick={() => setShowInvitePanel(true)} className="w-12 h-12 bg-[#0095f6] rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 active:scale-90"><UserPlus className="w-5 h-5 text-white" /></button>
                      <div className="flex gap-2">
                          <StudioBtn icon={<Settings />} onClick={() => {}} />
                          <StudioBtn icon={<RotateCcw />} onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} />
                      </div>
                  </div>
              </div>

              {/* Invite Panel */}
              {showInvitePanel && (
                  <div className="absolute inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={() => setShowInvitePanel(false)}>
                      <div className="bg-[#121212] w-full rounded-t-[40px] p-8 border-t border-white/10 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-xl font-black text-white">دعوة للمشاركة</h3>
                              <button onClick={() => setShowInvitePanel(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5 text-white" /></button>
                          </div>
                          <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                              {INVITE_CANDIDATES.map(user => (
                                  <div key={user.id} className="flex items-center justify-between bg-[#1c1c1c] p-3 rounded-2xl border border-white/5">
                                      <div className="flex items-center gap-3">
                                          <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                                          <span className="font-bold text-white text-sm">{user.name}</span>
                                      </div>
                                      <button onClick={() => handleInvite(user)} className="bg-[#0095f6] text-white px-4 py-1.5 rounded-xl text-[10px] font-black">دعوة</button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* Exit Confirm */}
              {showExitConfirm && (
                  <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
                      <div className="bg-[#1c1c1c] w-full max-w-xs rounded-[40px] p-8 text-center border border-white/10 shadow-3xl">
                          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-600/40">
                              <AlertCircle className="w-10 h-10 text-red-500" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2">إنهاء البث؟</h3>
                          <p className="text-gray-400 text-sm mb-8 leading-relaxed">بمجرد إنهاء البث لن تتمكن من العودة إليه، وسيتم حفظ الإحصائيات.</p>
                          <div className="flex flex-col gap-3">
                              <button onClick={onClose} className="w-full bg-red-600 py-4 rounded-2xl text-white font-black shadow-lg shadow-red-900/30 active:scale-95 transition-all">إنهاء البث</button>
                              <button onClick={() => setShowExitConfirm(false)} className="w-full bg-white/5 py-4 rounded-2xl text-gray-300 font-bold border border-white/5">تراجع</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return null;
};

// --- SMALL COMPONENTS ---

const StudioBtn = ({ icon, onClick, disabled }: any) => (
    <button disabled={disabled} onClick={onClick} className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors border border-white/5">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </button>
);

const MenuCard = ({ title, subtitle, icon, color, onClick }: any) => (
    <button onClick={onClick} className={`w-full p-6 rounded-[32px] bg-gradient-to-br ${color} flex items-center gap-5 text-white text-right shadow-2xl transform active:scale-[0.98] transition-all`}>
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
        </div>
        <div>
            <h3 className="font-black text-xl mb-0.5">{title}</h3>
            <p className="opacity-80 text-[11px] font-bold uppercase tracking-wider">{subtitle}</p>
        </div>
    </button>
);

export default CreateVideo;
