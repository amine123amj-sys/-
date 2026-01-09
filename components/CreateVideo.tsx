
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, RotateCcw, Radio, MessageCircle, Heart, MoreHorizontal, Gift, Swords, Trophy, Flame, UserPlus, Share2,
  Users, Mic, MicOff, Video as VideoIcon, VideoOff, Send, Image as ImageIcon, Play, Pause, Trash2, Check,
  Settings, Activity, Layout, Eye, Star, TrendingUp, HandHelping, UserCheck, Loader2, UserMinus, LogOut, Shield, Lock, Bell, Hand, Coins, CreditCard, DollarSign,
  AlertCircle
} from 'lucide-react';
import { Reel, Story, StoryItem, OverlayItem } from '../types';

interface CreateVideoProps {
  onClose: () => void;
  onPublishReel: (reel: Reel) => void;
  onPublishStory: (storyItem: StoryItem) => void;
  initialMode?: 'MENU' | 'STORY'; 
}

type MainStep = 'MENU' | 'CAPTURE' | 'EDIT' | 'LIVE_SETUP' | 'LIVE_ACTIVE';
type Mode = 'VIDEO' | 'LIVE' | 'STORY';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    avatar?: string;
    type?: 'gift' | 'text' | 'system' | 'action';
}

interface LiveGuest {
    id: string;
    name: string;
    avatar: string;
    videoUrl: string;
    isMutedByHost: boolean;
    isCamStoppedByHost: boolean;
    score?: number; 
}

interface HeartAnim {
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
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

  // Panels
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [liveGuest, setLiveGuest] = useState<LiveGuest | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (step !== 'CAPTURE' && step !== 'LIVE_ACTIVE' && step !== 'LIVE_SETUP') return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (e) {}
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [facingMode, step]);

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

              {/* Interaction Feed (Viewing Only) */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-32 z-10 pointer-events-none overflow-hidden">
                  <div className="w-full max-w-[85%] space-y-2 no-scrollbar">
                      {liveMessages.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 bg-black/30 backdrop-blur-md rounded-xl p-2 border border-white/5 animate-in slide-in-from-right duration-300">
                              <img src={m.avatar} className="w-6 h-6 rounded-full" />
                              <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-gray-400">{m.user}</span>
                                  <p className="text-[11px] text-white leading-tight">{m.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom Controls (No Comment Input, No Share, No Gifts) */}
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
