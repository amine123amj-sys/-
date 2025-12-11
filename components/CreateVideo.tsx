import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Music, RotateCcw, Zap, ZapOff, Timer, Settings2, 
  ChevronDown, Check, Scissors, Type, Smile, Mic, 
  Palette, ArrowRight, Wand2, Rocket, Globe, Banknote, Calendar, CheckCircle2,
  Radio, Users, MessageCircle, Heart, Send
} from 'lucide-react';
import { Reel, Story } from '../types';

interface CreateVideoProps {
  onClose: () => void;
  onPublishReel: (reel: Reel) => void;
  onPublishStory: (story: Story) => void;
}

type Mode = 'STORY' | 'REEL' | 'LIVE';
type Step = 'capture' | 'edit' | 'publish' | 'live_active';

const CreateVideo: React.FC<CreateVideoProps> = ({ onClose, onPublishReel, onPublishStory }) => {
  const [mode, setMode] = useState<Mode>('REEL');
  const [step, setStep] = useState<Step>('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [caption, setCaption] = useState('');
  
  // Live Mode State
  const [viewers, setViewers] = useState(0);
  const [liveComments, setLiveComments] = useState<{user: string, text: string}[]>([]);
  const commentsIntervalRef = useRef<any>(null);
  const viewersIntervalRef = useRef<any>(null);

  // Boost Feature State
  const [isBoostEnabled, setIsBoostEnabled] = useState(false);
  const [boostConfig, setBoostConfig] = useState({
      budget: '10',
      duration: '3',
      target: 'global'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode }, 
          audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode, step]); // Restart camera when coming back to capture

  // Handle Recording Logic (Simulation)
  useEffect(() => {
    let interval: any;
    if (isRecording && mode !== 'LIVE') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsRecording(false);
            setStep('edit'); // Auto move to edit when time is up
            return 100;
          }
          return prev + (mode === 'STORY' ? 1 : 0.5); // Stories are shorter
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRecording, mode]);

  const toggleRecording = () => {
    if (mode === 'LIVE') {
        startLiveStream();
        return;
    }

    if (isRecording) {
      setIsRecording(false);
      // If we stop manually, go to edit
      setTimeout(() => setStep('edit'), 500);
    } else {
      setIsRecording(true);
    }
  };

  const startLiveStream = () => {
      setStep('live_active');
      setViewers(0);
      setLiveComments([]);
      
      // Simulate viewers growing
      viewersIntervalRef.current = setInterval(() => {
          setViewers(prev => prev + Math.floor(Math.random() * 5));
      }, 2000);

      // Simulate comments
      const randomComments = ["منور!", "Hello!", "Cool stream", "ممكن قست؟", "واو", "🔥🔥🔥", "أحبك ❤️"];
      const randomUsers = ["user123", "ahmed_k", "sara_99", "cool_boy", "meme_queen"];
      
      commentsIntervalRef.current = setInterval(() => {
          const newComment = {
              user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
              text: randomComments[Math.floor(Math.random() * randomComments.length)]
          };
          setLiveComments(prev => [...prev.slice(-4), newComment]); // Keep last 5
      }, 1500);
  };

  const endLiveStream = () => {
      clearInterval(viewersIntervalRef.current);
      clearInterval(commentsIntervalRef.current);
      setStep('capture');
      setMode('REEL'); // Reset to default
      onClose(); // Close creator
  };

  const handleClose = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    onClose();
  };

  const handleStoryPublish = () => {
      const newStory: Story = {
          id: Date.now(),
          name: 'قصتي',
          img: 'https://picsum.photos/100/100?random=me', // In real app, this is the captured image/video thumbnail
          isUser: true,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4'
      };
      
      onPublishStory(newStory);
      handleClose();
  };

  const handleReelPublish = () => {
    // Construct Reel Object
    const newReel: Reel = {
        id: Date.now().toString(),
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
        username: 'مستخدم_جديد',
        userAvatar: 'https://picsum.photos/100/100?random=99',
        description: caption || 'فيديو جديد! #نيو #ترند',
        likes: 0,
        comments: 0,
        shares: 0,
        isBoosted: isBoostEnabled,
        boostConfig: isBoostEnabled ? boostConfig : undefined
    };
    
    onPublishReel(newReel);
    handleClose();
  };

  // --- RENDER LIVE ACTIVE SCREEN ---
  if (step === 'live_active') {
      return (
        <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />
            
            {/* Live UI Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-10 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#0095f6] px-2 py-1 rounded-sm text-white text-xs font-bold animate-pulse">LIVE</div>
                        <div className="bg-black/40 px-2 py-1 rounded-sm text-white text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" /> {viewers}
                        </div>
                    </div>
                    <button onClick={endLiveStream} className="bg-black/40 text-white p-2 rounded-full"><X /></button>
                </div>

                <div className="w-full max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-16">
                    {liveComments.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 animate-in slide-in-from-bottom-2 fade-in">
                            <div className="w-6 h-6 rounded-full bg-gray-500 overflow-hidden shrink-0">
                                <img src={`https://picsum.photos/50/50?random=${i}`} className="w-full h-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/70 text-[10px] font-bold">{c.user}</span>
                                <span className="text-white text-sm drop-shadow-md">{c.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             {/* Bottom Input (Simulated) */}
             <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black to-transparent z-20 flex items-center gap-2">
                 <input type="text" placeholder="إضافة تعليق..." className="flex-1 bg-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/70 outline-none backdrop-blur-sm border-none" />
                 <button className="p-2 text-white"><MoreHorizontalIcon /></button>
                 <button className="p-2 text-white"><ShareIcon /></button>
                 <button className="p-2 text-white"><HeartIcon /></button>
             </div>
        </div>
      );
  }

  // --- RENDER CAPTURE SCREEN ---
  if (step === 'capture') {
    return (
      <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
        {/* Camera Preview */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* Top Bar */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={handleClose} className="p-2">
            <X className="w-7 h-7 text-white drop-shadow-md" />
          </button>
          
          <button className="flex items-center space-x-2 space-x-reverse bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Music className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">إضافة صوت</span>
          </button>

          <div className="w-7" /> {/* Spacer for balance */}
        </div>

        {/* Right Sidebar Tools */}
        <div className="absolute right-4 top-20 flex flex-col space-y-6 items-center z-20">
            <ToolIcon icon={<RotateCcw />} label="قلب" onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} />
            <ToolIcon icon={<Settings2 />} label="السرعة" onClick={() => setShowSpeed(!showSpeed)} active={showSpeed} />
            <ToolIcon icon={<Wand2 />} label="تجميل" />
            <ToolIcon icon={<Timer />} label="مؤقت" />
            <ToolIcon icon={flash ? <Zap className="fill-yellow-400 text-yellow-400" /> : <ZapOff />} label="فلاش" onClick={() => setFlash(!flash)} />
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full flex flex-col items-center pb-8 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-20">
            
            {/* Speed Selector */}
            {showSpeed && (
                <div className="flex bg-black/60 backdrop-blur-md rounded-lg p-1 mb-8 animate-in slide-in-from-bottom-5">
                    {[0.3, 0.5, 1, 2, 3].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setSpeed(s)} 
                            className={`w-10 h-8 text-xs font-bold rounded-md transition-colors ${speed === s ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-around w-full px-8">
                {/* Gallery */}
                <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 border-2 border-white overflow-hidden">
                        <img src="https://picsum.photos/50/50" alt="gallery" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <span className="text-[10px] font-medium text-white">المعرض</span>
                </div>

                {/* --- CUSTOM BUTTONS (TIKTOK STYLE) --- */}
                {mode === 'LIVE' ? (
                     <div className="relative cursor-pointer group" onClick={toggleRecording}>
                         {/* Live Button Container with Blue Glow */}
                         <div className="w-24 h-24 rounded-full border-[3px] border-[#0095f6]/50 flex items-center justify-center bg-[#0095f6]/10 backdrop-blur-md group-active:scale-95 transition-all shadow-[0_0_30px_rgba(0,149,246,0.3)]">
                             {/* Inner Pulsing Circle */}
                             <div className="w-16 h-16 rounded-full bg-[#0095f6] flex items-center justify-center shadow-lg relative overflow-hidden ring-4 ring-black/20">
                                 <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                 <Radio className="text-white w-8 h-8 relative z-10" strokeWidth={2.5} />
                             </div>
                         </div>
                         <div className="absolute -bottom-8 w-full text-center text-[#0095f6] text-sm font-bold tracking-widest drop-shadow-md animate-pulse">LIVE</div>
                     </div>
                ) : (
                    <div className="relative flex items-center justify-center cursor-pointer group" onClick={toggleRecording}>
                         {/* Outer Static Ring */}
                         <div className={`absolute rounded-full border-[5px] transition-all duration-300 ${
                             isRecording 
                             ? 'w-24 h-24 border-[#0095f6]/30 scale-100' 
                             : 'w-20 h-20 border-white/30 group-hover:scale-105'
                         }`}></div>

                         {/* Recording Progress Ring */}
                         {isRecording && (
                             <svg className="absolute w-24 h-24 transform -rotate-90 z-10 pointer-events-none">
                                <circle 
                                    cx="48" cy="48" r="44" 
                                    stroke="#0095f6" 
                                    strokeWidth="5" 
                                    fill="none" 
                                    strokeDasharray="276" 
                                    strokeDashoffset={276 - (276 * progress) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-100"
                                />
                             </svg>
                         )}
                         
                         {/* Inner Button */}
                         <div className={`relative z-20 transition-all duration-300 shadow-lg ${
                             isRecording 
                             ? 'w-8 h-8 rounded-lg scale-90' 
                             : 'w-16 h-16 rounded-full'
                         } bg-[#0095f6] border-2 border-white/10`}></div>
                    </div>
                )}

                {/* Effects */}
                <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0095f6] to-cyan-400 border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(0,149,246,0.5)]">
                        <Smile className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white">مؤثرات</span>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex space-x-6 space-x-reverse mt-6 text-sm font-semibold text-gray-400 bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
                <button 
                    onClick={() => setMode('LIVE')}
                    className={`transition-all duration-300 ${mode === 'LIVE' ? 'text-[#0095f6] font-bold scale-110 drop-shadow-[0_0_5px_rgba(0,149,246,0.8)]' : 'hover:text-white'}`}
                >
                    بث مباشر
                </button>
                <button 
                    onClick={() => setMode('REEL')}
                    className={`transition-all duration-300 ${mode === 'REEL' ? 'text-[#0095f6] font-bold scale-110 drop-shadow-[0_0_5px_rgba(0,149,246,0.8)]' : 'hover:text-white'}`}
                >
                    ريلز
                </button>
                <button 
                    onClick={() => setMode('STORY')}
                    className={`transition-all duration-300 ${mode === 'STORY' ? 'text-[#0095f6] font-bold scale-110 drop-shadow-[0_0_5px_rgba(0,149,246,0.8)]' : 'hover:text-white'}`}
                >
                    قصة
                </button>
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER EDIT SCREEN ---
  if (step === 'edit') {
    return (
      <div className="relative h-full w-full bg-[#121212] flex flex-col">
         {/* Preview Area */}
         <div className="flex-1 relative m-4 rounded-xl overflow-hidden bg-black border border-gray-800 shadow-xl">
             <div className="absolute inset-0 flex items-center justify-center">
                 {/* In a real app, this would be the recorded video blob */}
                 <video 
                    src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4" 
                    autoPlay loop muted className="w-full h-full object-cover opacity-80" 
                  />
             </div>
             
             {/* Edit Overlay UI */}
             <div className="absolute top-4 right-4 flex flex-col space-y-4">
                 <EditTool icon={<Type />} label="نص" />
                 <EditTool icon={<Smile />} label="ملصق" />
                 <EditTool icon={<Scissors />} label="قص" />
                 <EditTool icon={<Mic />} label="صوت" />
                 <EditTool icon={<Palette />} label="فلاتر" />
             </div>

             <div className="absolute bottom-4 left-4">
                  <button className="text-white text-xs bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      مؤثرات الصوت
                  </button>
             </div>
         </div>

         {/* Bottom Actions */}
         <div className="h-20 bg-black flex items-center justify-between px-6 border-t border-gray-800">
              <div className="flex flex-col items-center text-xs text-gray-400 gap-1 cursor-pointer hover:text-white" onClick={() => setStep('capture')}>
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                  </div>
                  إلغاء
              </div>

              {mode === 'STORY' ? (
                   <button onClick={handleStoryPublish} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95">
                       <div className="w-5 h-5 rounded-full bg-[#0095f6] border border-black"></div>
                       قصتي <ArrowRight className="w-4 h-4" />
                   </button>
              ) : (
                  <button onClick={() => setStep('publish')} className="bg-[#0095f6] hover:bg-[#0085dd] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(0,149,246,0.4)]">
                      التالي <ArrowRight className="w-4 h-4" />
                  </button>
              )}
         </div>
      </div>
    );
  }

  // --- RENDER PUBLISH SCREEN (REELS ONLY) ---
  return (
    <div className="h-full w-full bg-[#121212] flex flex-col text-white overflow-y-auto no-scrollbar">
       <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black sticky top-0 z-50">
           <button onClick={() => setStep('edit')}><ArrowRight className="w-6 h-6 rotate-180" /></button>
           <h2 className="font-bold text-lg">منشور جديد</h2>
           <div className="w-6"></div>
       </div>

       <div className="flex p-4 gap-3">
           <div className="w-20 h-28 bg-gray-800 rounded-md overflow-hidden relative">
              <video src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4" className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 text-[10px] bg-black/60 px-1 rounded text-white">الغلاف</div>
           </div>
           <div className="flex-1">
               <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="اكتب شرحاً توضيحياً..." 
                  className="w-full h-28 bg-transparent border-none outline-none resize-none text-sm placeholder-gray-500"
               />
               <div className="flex gap-2 mt-2">
                   <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">#هاشتاق</span>
                   <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300">@ذكر</span>
               </div>
           </div>
       </div>

       <div className="h-px bg-gray-800 mx-4"></div>

       {/* BOOST FEATURE SECTION */}
       <div className="p-4">
           <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
               {/* Toggle Header */}
               <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsBoostEnabled(!isBoostEnabled)}
               >
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#0095f6]/20 flex items-center justify-center">
                           <Rocket className="w-5 h-5 text-[#0095f6]" />
                       </div>
                       <div>
                           <h3 className="font-bold text-sm">تفعيل الانتشار (Boost)</h3>
                           <p className="text-xs text-gray-400">احصل على مشاهدات أكثر فوراً!</p>
                       </div>
                   </div>
                   <div className={`w-12 h-6 rounded-full transition-colors relative ${isBoostEnabled ? 'bg-[#0095f6]' : 'bg-gray-600'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBoostEnabled ? 'right-7' : 'right-1'}`}></div>
                   </div>
               </div>

               {/* Boost Configuration Options */}
               {isBoostEnabled && (
                   <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                       <div className="bg-black/30 rounded-lg p-3 mb-3 text-xs text-gray-300 space-y-1">
                           <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#0095f6]" /> وصول أعلى للفيديو خلال فترة قصيرة</p>
                           <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#0095f6]" /> زيادة فرص الظهور في الصفحة الرئيسية</p>
                           <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#0095f6]" /> تفعيل تلقائي عند نشر الفيديو</p>
                       </div>

                       <div className="space-y-4">
                           {/* Budget */}
                           <div>
                               <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                   <Banknote className="w-3 h-3" /> الميزانية
                               </label>
                               <div className="flex gap-2">
                                   {['5', '10', '25', '50'].map(b => (
                                       <button 
                                          key={b}
                                          onClick={() => setBoostConfig({...boostConfig, budget: b})}
                                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${boostConfig.budget === b ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600'}`}
                                       >
                                           ${b}
                                       </button>
                                   ))}
                               </div>
                           </div>

                           {/* Duration */}
                           <div>
                               <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                   <Calendar className="w-3 h-3" /> المدة
                               </label>
                               <div className="flex gap-2">
                                   {['1 يوم', '3 أيام', '7 أيام'].map(d => (
                                       <button 
                                          key={d}
                                          onClick={() => setBoostConfig({...boostConfig, duration: d})}
                                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${boostConfig.duration === d ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600'}`}
                                       >
                                           {d}
                                       </button>
                                   ))}
                               </div>
                           </div>

                            {/* Target */}
                           <div>
                               <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                   <Globe className="w-3 h-3" /> الاستهداف
                               </label>
                               <div className="flex bg-gray-800 rounded-lg p-1">
                                   <button 
                                      onClick={() => setBoostConfig({...boostConfig, target: 'local'})}
                                      className={`flex-1 py-1.5 rounded-md text-xs transition-colors ${boostConfig.target === 'local' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
                                   >
                                       محلي (الدولة)
                                   </button>
                                   <button 
                                      onClick={() => setBoostConfig({...boostConfig, target: 'global'})}
                                      className={`flex-1 py-1.5 rounded-md text-xs transition-colors ${boostConfig.target === 'global' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
                                   >
                                       عالمي
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>

       <div className="p-4 space-y-4">
           <div className="flex justify-between items-center py-3 border-b border-gray-800">
               <span className="text-sm">من يمكنه مشاهدة الفيديو</span>
               <span className="text-sm text-gray-400 flex items-center gap-1">الجميع <ArrowRight className="w-4 h-4 rotate-180" /></span>
           </div>
           <div className="flex justify-between items-center py-3 border-b border-gray-800">
               <span className="text-sm">خيارات إضافية</span>
               <ArrowRight className="w-4 h-4 rotate-180 text-gray-400" />
           </div>
       </div>

       <div className="flex-1"></div>

       <div className="p-4 bg-black border-t border-gray-800 sticky bottom-0">
           <div className="flex gap-3">
               <button className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 font-bold text-sm">مسودة</button>
               <button 
                  onClick={handleReelPublish}
                  className="flex-1 py-3 rounded-lg bg-[#0095f6] text-white font-bold text-sm hover:bg-[#0085dd] transition-colors shadow-[0_0_15px_rgba(0,149,246,0.3)]"
               >
                   {isBoostEnabled ? 'نشر وترويج' : 'نشر'}
               </button>
           </div>
       </div>
    </div>
  );
};

// Helper Components
const ToolIcon = ({ icon, label, onClick, active }: any) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-1 group">
        <div className={`p-2 rounded-full transition-all ${active ? 'bg-yellow-400 text-black' : 'bg-black/20 text-white group-hover:bg-black/40'}`}>
            {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
        </div>
        <span className="text-[10px] font-medium text-white drop-shadow-md">{label}</span>
    </button>
);

const EditTool = ({ icon, label }: any) => (
    <button className="flex flex-col items-center space-y-1 group">
        <div className="w-9 h-9 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-[10px] font-medium text-white shadow-black drop-shadow-md">{label}</span>
    </button>
);

const MoreHorizontalIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg> );
const ShareIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg> );
const HeartIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> );


export default CreateVideo;