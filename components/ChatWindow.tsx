
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Square, RotateCw, AlertCircle, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, Phone, Trash2, Lock, Play, Pause, X, ChevronLeft, Check, Plus, Image as ImageIcon, FileText, Download, ShieldCheck, User, Loader2, Search as SearchIcon } from 'lucide-react';
import { ChatState, Message, ChatMode } from '../types';
import { realtimeService } from '../services/realtimeService';
import { STRINGS } from '../constants';

interface ChatWindowProps {
  onBack: () => void;
  interests: string[];
  mode: ChatMode;
  targetUser?: {
    id: string | number;
    name: string;
    avatar: string;
    isActive?: boolean;
    username?: string;
    bio?: string;
  };
  onViewProfile?: (user: any) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const StatusIcon = ({ status, isDark }: { status?: 'sent' | 'delivered' | 'read', isDark?: boolean }) => {
    const baseClass = isDark ? "text-gray-400" : "text-gray-500";
    if (!status) return <Check className={`w-3 h-3 ${baseClass}`} />;
    if (status === 'sent') return <Check className={`w-3.5 h-3.5 ${baseClass}`} />;
    if (status === 'delivered') return <div className="flex -space-x-1"><Check className={`w-3.5 h-3.5 ${baseClass}`} /><Check className={`w-3.5 h-3.5 ${baseClass}`} /></div>;
    if (status === 'read') return <div className="flex -space-x-1"><Check className="w-3.5 h-3.5 text-blue-500" /><Check className="w-3.5 h-3.5 text-blue-500" /></div>;
    return null;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack, interests, mode: initialMode, targetUser, onViewProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.SEARCHING);
  const [stopConfirm, setStopConfirm] = useState(false);
  const [chatId, setChatId] = useState<number>(Date.now());
  
  const [activeMode, setActiveMode] = useState<ChatMode>(initialMode);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [isMockCam, setIsMockCam] = useState<boolean>(false);
  
  // --- VOICE RECORDING STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{ url: string, duration: number } | null>(null);
  
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCancellingAnimation, setIsCancellingAnimation] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordStartTimeRef = useRef<number>(0);
  const holdStartTimerRef = useRef<any>(null); 
  
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatState, activeMode, isRecording, isAttachMenuOpen]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
        textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (targetUser) {
        setChatState(ChatState.CONNECTED);
        setActiveMode(initialMode);
        setMessages([
            { id: 'hist_1', text: 'اليوم', type: 'text', sender: 'system', timestamp: Date.now() - 3600000 },
            { id: 'hist_sys', text: '🔒 الرسائل والمكالمات مشفرة تماماً.', type: 'text', sender: 'system', timestamp: Date.now() }
        ]);
    } else {
        handleStartChat();
    }
    return () => {
        realtimeService.disconnect();
    };
  }, [targetUser]);

  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
        if (!isMounted) return;
        setCameraError(false);
        setIsMockCam(false);
        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (err) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            if (isMounted && stream) {
                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                setIsCamOn(true);
            }
        } catch (e) {
            if (isMounted) { setIsMockCam(true); setIsCamOn(true); }
        }
    };

    if (activeMode === 'video' && chatState !== ChatState.IDLE) {
        if (isCamOn && !streamRef.current && !isMockCam) startCamera();
    }
    return () => { isMounted = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [activeMode, chatState]);

  const startRecording = async () => {
      setIsAttachMenuOpen(false);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mediaRecorder.start();
          setIsRecording(true);
          setRecordingDuration(0);
          recordStartTimeRef.current = Date.now();
          setDragOffset({ x: 0, y: 0 });
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);
      } catch (err) {
          if (isDraggingRef.current) alert("الرجاء السماح بالوصول للميكروفون لتسجيل الصوت");
          setIsRecording(false);
          isDraggingRef.current = false;
      }
  };

  const stopRecording = (shouldProcess: boolean) => {
      if (holdStartTimerRef.current) clearTimeout(holdStartTimerRef.current);
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          setIsRecording(false);
          setIsLocked(false);
          setDragOffset({ x: 0, y: 0 });
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          return;
      }

      mediaRecorderRef.current.onstop = () => {
          const duration = (Date.now() - recordStartTimeRef.current) / 1000;
          if (shouldProcess && !isCancellingAnimation && duration > 0.5) {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const audioUrl = URL.createObjectURL(audioBlob);
              setPendingAudio({ url: audioUrl, duration: Math.round(duration) });
          }
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          mediaRecorderRef.current = null;
          audioChunksRef.current = [];
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLocked(false);
      setIsCancellingAnimation(false);
      setDragOffset({ x: 0, y: 0 });
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
      setIsCancellingAnimation(true);
      setTimeout(() => {
          setPendingAudio(null);
          stopRecording(false);
          setIsCancellingAnimation(false);
      }, 300);
  };

  const handleTouchStartRecord = (e: React.TouchEvent | React.MouseEvent) => {
      if (input.trim() || pendingAudio) return;
      e.preventDefault();
      isDraggingRef.current = true;
      if ('touches' in e) {
          startYRef.current = e.touches[0].clientY;
          startXRef.current = e.touches[0].clientX;
      } else {
          startYRef.current = (e as React.MouseEvent).clientY;
          startXRef.current = (e as React.MouseEvent).clientX;
      }
      holdStartTimerRef.current = setTimeout(() => {
          if (isDraggingRef.current) startRecording();
      }, 100); 
  };

  const handleTouchMoveRecord = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDraggingRef.current || isLocked || !isRecording) return;
      let currentY, currentX;
      if ('touches' in e) {
          currentY = e.touches[0].clientY;
          currentX = e.touches[0].clientX;
      } else {
          currentY = (e as React.MouseEvent).clientY;
          currentX = (e as React.MouseEvent).clientX;
      }
      const deltaY = currentY - startYRef.current;
      const deltaX = currentX - startXRef.current;
      setDragOffset({ x: deltaX, y: deltaY });
      if (deltaY < -70) {
          setIsLocked(true);
          setDragOffset({ x: 0, y: 0 });
      }
      if (Math.abs(deltaX) > 120) {
          cancelRecording();
          isDraggingRef.current = false;
      }
  };

  const handleTouchEndRecord = (e: React.TouchEvent | React.MouseEvent) => {
      if (holdStartTimerRef.current) clearTimeout(holdStartTimerRef.current);
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (isLocked) return;
      if (isRecording) {
          if (!isCancellingAnimation) stopRecording(true);
      } else {
          setIsRecording(false);
      }
  };

  const handleSendAudio = () => {
      if (!pendingAudio) return;
      const audioMsg: Message = {
          id: Date.now().toString(),
          type: 'audio',
          audioUrl: pendingAudio.url,
          duration: pendingAudio.duration,
          sender: 'me',
          timestamp: Date.now(),
          status: 'sent'
      };
      setMessages(prev => [...prev, audioMsg]);
      setPendingAudio(null);
      setTimeout(() => setMessages(prev => prev.map(m => m.id === audioMsg.id ? { ...m, status: 'delivered' } : m)), 1000);
      setTimeout(() => setMessages(prev => prev.map(m => m.id === audioMsg.id ? { ...m, status: 'read' } : m)), 2500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'doc') => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          let msgType: 'image' | 'video' | 'file' = 'file';
          if (type === 'media') {
              msgType = file.type.startsWith('video') ? 'video' : 'image';
          }
          const newMsg: Message = {
              id: Date.now().toString(),
              type: msgType,
              mediaUrl: url,
              fileName: file.name,
              fileSize: formatFileSize(file.size),
              sender: 'me',
              timestamp: Date.now(),
              status: 'sent'
          };
          setMessages(prev => [...prev, newMsg]);
          setIsAttachMenuOpen(false);
          setTimeout(() => setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)), 1000);
          setTimeout(() => setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)), 2500);
      }
  };

  const handleStartChat = () => {
    setChatState(ChatState.SEARCHING);
    setMessages([]);
    setStopConfirm(false);
    setChatId(Date.now());
    realtimeService.disconnect(); 
    realtimeService.connect(
        (msg) => {
            setMessages(prev => [...prev, { ...msg, type: msg.type || 'text', status: 'read' }]);
        },
        (connected) => {
            if (connected) {
                setChatState(ChatState.CONNECTED);
                setMessages([
                    { id: 'sys_sec_lock', text: '🔒 محادثة آمنة ومشفرة', type: 'text', sender: 'system', timestamp: Date.now() },
                    { id: `sys_conn_${Date.now()}`, text: STRINGS.connected, type: 'text', sender: 'system', timestamp: Date.now() }
                ]);
            } else if (chatState === ChatState.CONNECTED) {
                setChatState(ChatState.DISCONNECTED);
                setMessages(prev => [...prev, { id: Date.now().toString(), text: 'الغريب غادر المحادثة.', type: 'text', sender: 'system', timestamp: Date.now() }]);
            }
        }
    );
  };

  const handleStopClick = () => {
      if (chatState === ChatState.DISCONNECTED) {
          handleStartChat();
      } else if (!stopConfirm) {
          setStopConfirm(true);
      } else {
          realtimeService.disconnect();
          setChatState(ChatState.DISCONNECTED);
          setStopConfirm(false);
          setMessages(prev => [...prev, { id: Date.now().toString(), text: 'تم إنهاء المحادثة.', type: 'text', sender: 'system', timestamp: Date.now() }]);
      }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      type: 'text',
      sender: 'me',
      timestamp: Date.now(),
      status: 'sent'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setTimeout(() => { setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m)); }, 1000);
    setTimeout(() => { setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m)); }, 2500);
    if (!targetUser) realtimeService.sendMessage(userMsg.text!);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleCallMode = () => setActiveMode(prev => prev === 'text' ? 'video' : 'text');

  const handleHeaderClick = () => {
      if (onViewProfile && (targetUser || chatState === ChatState.CONNECTED)) {
          const userToView = targetUser || {
              name: STRINGS.stranger,
              username: 'stranger_user',
              avatar: `https://picsum.photos/seed/${chatId}/200/200`,
              bio: 'مستخدم عشوائي في NeL'
          };
          onViewProfile(userToView);
      }
  };

  const AudioPlayerBubble = ({ msg }: { msg: Message }) => {
      const [playing, setPlaying] = useState(false);
      const [progress, setProgress] = useState(0);
      const [speed, setSpeed] = useState(1);
      const audioRef = useRef<HTMLAudioElement | null>(null);
      const isMe = msg.sender === 'me';
      useEffect(() => {
          if (!msg.audioUrl) return;
          const audio = new Audio(msg.audioUrl);
          audioRef.current = audio;
          audio.ontimeupdate = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100); };
          audio.onended = () => { setPlaying(false); setProgress(0); };
          return () => { audio.pause(); audio.src = ''; };
      }, [msg.audioUrl]);
      const togglePlay = () => {
          if (audioRef.current) {
              if (playing) audioRef.current.pause();
              else audioRef.current.play();
              setPlaying(!playing);
          }
      };
      const toggleSpeed = () => {
          const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
          setSpeed(newSpeed);
          if (audioRef.current) audioRef.current.playbackRate = newSpeed;
      };
      return (
          <div className="flex flex-col min-w-[200px]">
              <div className="flex items-center gap-3">
                  <div className="relative">
                       <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-blue-500 border border-black z-10 flex items-center justify-center"><Mic className="w-2.5 h-2.5 text-white" /></div>
                       <img src={isMe ? "https://picsum.photos/100/100?random=me" : targetUser?.avatar || `https://picsum.photos/seed/${chatId}/100/100`} className="w-10 h-10 rounded-full border-2 border-transparent object-cover" />
                  </div>
                  <button onClick={togglePlay} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isMe ? 'bg-gray-700/50' : 'bg-gray-200/50'}`}>
                      {playing ? <Pause className={`w-4 h-4 ${isMe ? 'fill-white' : 'fill-black'}`} /> : <Play className={`w-4 h-4 ml-0.5 ${isMe ? 'fill-white' : 'fill-black'}`} />}
                  </button>
                  <div className="flex-1 flex flex-col gap-1">
                      <div className="h-8 flex items-center gap-[2px] opacity-80">
                          {[...Array(25)].map((_, i) => (
                              <div key={i} className={`w-1 rounded-full transition-all duration-300 ${i/25 < progress/100 ? (isMe ? 'bg-blue-400' : 'bg-blue-600') : (isMe ? 'bg-gray-600' : 'bg-gray-300')}`} style={{ height: `${playing ? Math.max(20, Math.random() * 100) : 40}%` }}></div>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                  <span className={`text-[10px] ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>{formatTime(msg.duration || 0)}</span>
                  <div className="flex items-center gap-2">
                       <button onClick={toggleSpeed} className={`${isMe ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200 text-gray-600'} px-2 py-0.5 rounded-full text-[10px] font-bold hover:opacity-80 transition-colors`}>{speed}x</button>
                       {isMe && <StatusIcon status={msg.status} isDark={true} />}
                  </div>
              </div>
          </div>
      );
  };

  const renderChatInput = (isOverlay = false) => (
    <div className={`relative ${isOverlay ? 'w-full px-4 pb-4' : 'px-2 py-2 bg-black border-t border-ig-darkSec'}`}>
        {isAttachMenuOpen && (
            <div className="absolute bottom-[calc(100%+8px)] right-2 bg-[#262626] rounded-2xl shadow-2xl border border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-5 fade-in min-w-[180px]">
                <button onClick={() => { fileInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-xl transition-colors text-right group">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.4)]"><ImageIcon className="w-4 h-4 text-white" /></div>
                    <div className="flex flex-col">
                        <span className="text-white text-xs font-bold">معرض الصور</span>
                        <span className="text-[9px] text-gray-400 group-hover:text-purple-300">جودة عالية HD</span>
                    </div>
                </button>
                <button onClick={() => { setActiveMode('video'); setIsAttachMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-xl transition-colors text-right">
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.4)]"><Camera className="w-4 h-4 text-white" /></div>
                    <span className="text-white text-xs font-bold">كاميرا</span>
                </button>
                <button onClick={() => { docInputRef.current?.click(); setIsAttachMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-xl transition-colors text-right">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.4)]"><FileText className="w-4 h-4 text-white" /></div>
                    <span className="text-white text-xs font-bold">مستند أصلي</span>
                </button>
            </div>
        )}

        <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'media')} accept="image/*,video/*" className="hidden" />
        <input type="file" ref={docInputRef} onChange={(e) => handleFileSelect(e, 'doc')} className="hidden" />

        {pendingAudio && (
            <div className={`absolute inset-0 z-30 flex items-center px-4 gap-4 animate-in slide-in-from-bottom duration-200 ${isOverlay ? 'bg-black/95 rounded-3xl' : 'bg-[#1c1c1c]'}`}>
                 <button onClick={() => setPendingAudio(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><Trash2 className="w-6 h-6" /></button>
                 <div className="flex-1 flex items-center gap-2 bg-[#262626] rounded-full px-4 py-2 border border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Mic className="w-4 h-4 text-blue-500" /></div>
                      <div className="flex-1 flex items-center gap-1 opacity-50 overflow-hidden">
                           {[...Array(15)].map((_, i) => (
                               <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDuration: `${0.8 + Math.random()}s` }}></div>
                           ))}
                      </div>
                      <span className="text-xs font-mono text-gray-400">{formatTime(pendingAudio.duration)}</span>
                 </div>
                 <button onClick={handleSendAudio} className="p-3 bg-[#0095f6] text-white rounded-full shadow-lg active:scale-95 transition-transform"><Send className="w-5 h-5 rtl:rotate-180 ml-0.5" /></button>
            </div>
        )}

        {isRecording && (
            <div className={`absolute inset-0 z-20 flex items-center px-4 gap-4 animate-in slide-in-from-right duration-200 ${isOverlay ? 'bg-black/90 rounded-3xl' : 'bg-[#1c1c1c]'}`}>
                {isCancellingAnimation ? (
                    <div className="flex-1 flex items-center gap-2 text-red-500 animate-pulse justify-center"><Trash2 className="w-6 h-6" /><span className="font-bold">جاري الحذف...</span></div>
                ) : (
                    <>
                         <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                            <Trash2 className="w-6 h-6" />
                         </button>
                         <div className="flex-1 flex items-center justify-center gap-3">
                             <span className="text-2xl animate-bounce">🎙️</span>
                             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                             <span className="text-white font-mono font-bold text-lg min-w-[50px]">{formatTime(recordingDuration)}</span>
                             <button onClick={() => stopRecording(true)} className="p-2.5 bg-[#0095f6] text-white rounded-full ml-2 shadow-lg active:scale-95 transition-all">
                                 <Mic className="w-4 h-4 fill-white" />
                             </button>
                         </div>
                    </>
                )}
            </div>
        )}

        <div className={`flex items-end gap-2 relative transition-opacity duration-200 ${isRecording || pendingAudio ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} className="p-3 mb-0.5 text-gray-400 hover:text-white bg-[#262626] rounded-full transition-colors shrink-0">
                {isAttachMenuOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
            
            <div className="flex-1 flex items-center rounded-3xl px-4 py-2 border transition-all bg-[#262626] border-transparent focus-within:border-gray-600">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setIsAttachMenuOpen(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder={STRINGS.typeMessage}
                    rows={1}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-sm resize-none max-h-[120px] overflow-y-auto leading-5 py-1"
                    style={{ minHeight: '28px' }}
                />
            </div>
            
            <button 
                onMouseDown={handleTouchStartRecord}
                onMouseUp={handleTouchEndRecord}
                onTouchStart={handleTouchStartRecord}
                onTouchEnd={handleTouchEndRecord}
                onTouchMove={handleTouchMoveRecord}
                onClick={input.trim() ? handleSend : undefined}
                className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 shadow-lg ${
                    input.trim() ? 'bg-[#0095f6] text-white' : isRecording ? 'bg-red-500 scale-125 ring-4 ring-red-500/30 shadow-[0_0_20px_red]' : 'bg-[#262626] text-white'
                }`}
                style={isRecording && !isLocked && !input.trim() ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.3)` } : {}}
            >
                {input.trim() ? <Send className="w-5 h-5 rtl:rotate-180 ml-0.5" /> : <Mic className={`w-5 h-5 ${isRecording ? 'fill-white animate-pulse' : ''}`} />}
            </button>
        </div>
    </div>
  );

  // --- RENDER SEARCHING OVERLAY ---
  if (chatState === ChatState.SEARCHING && !targetUser) {
      return (
          <div className="h-full w-full bg-black flex flex-col animate-in fade-in duration-300">
              <div className="flex items-center px-4 py-3 border-b border-gray-900">
                  <button onClick={() => { realtimeService.disconnect(); onBack(); }} className="p-1 hover:bg-gray-800 rounded-full text-white transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  <h1 className="flex-1 text-center font-logo text-2xl text-white pt-1">{STRINGS.appName}</h1>
                  <div className="w-8"></div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  {/* Radar Circles */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-[300px] h-[300px] border border-blue-500 rounded-full animate-ping duration-[3000ms]"></div>
                      <div className="w-[400px] h-[400px] border border-blue-500 rounded-full animate-ping duration-[4000ms] delay-500"></div>
                      <div className="w-[500px] h-[500px] border border-blue-500 rounded-full animate-ping duration-[5000ms] delay-1000"></div>
                  </div>

                  <div className="relative z-10 text-center">
                      <div className="relative w-32 h-32 mx-auto mb-8">
                          <div className="absolute inset-0 border-4 border-gray-900 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-[#0095f6] border-r-[#0095f6]/30 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] animate-pulse">
                                  <SearchIcon className="w-10 h-10 text-white" />
                              </div>
                          </div>
                      </div>
                      
                      <h2 className="text-2xl font-black text-white mb-2 animate-pulse">{STRINGS.searching}</h2>
                      <p className="text-gray-400 text-sm mb-12">يتم الآن البحث عن طرف آخر يطابق اهتماماتك...</p>

                      <button 
                          onClick={() => { realtimeService.disconnect(); onBack(); }}
                          className="px-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 font-bold hover:bg-white/10 transition-colors active:scale-95"
                      >
                          إلغاء البحث
                      </button>
                  </div>

                  {/* Interests Badge list in searching */}
                  {interests.length > 0 && (
                      <div className="absolute bottom-12 left-0 right-0 px-8">
                          <div className="flex flex-wrap justify-center gap-2">
                              {interests.map((tag, i) => (
                                  <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg">
                                      #{tag}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div className={`flex items-center justify-between px-4 py-3 z-20 sticky top-0 ${activeMode === 'video' ? 'bg-black/80 backdrop-blur-md absolute w-full' : 'bg-black border-b border-gray-800'}`}>
        <div className="flex items-center space-x-3 space-x-reverse">
          <button onClick={() => { realtimeService.disconnect(); onBack(); }} className="p-1 hover:bg-gray-800 rounded-full text-white transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          {(activeMode === 'text' || targetUser || chatState !== ChatState.IDLE) && (
              <div className="flex items-center gap-3 cursor-pointer group active:opacity-70 transition-opacity" onClick={handleHeaderClick}>
                <div className="relative">
                    {targetUser || chatState === ChatState.CONNECTED ? (
                        <img src={targetUser?.avatar || `https://picsum.photos/seed/${chatId}/100/100`} className="w-10 h-10 rounded-full border border-gray-700 object-cover group-hover:border-[#0095f6] transition-colors" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-[#0095f6] transition-colors">
                            {chatState === ChatState.SEARCHING ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <span className="text-xl">👤</span>}
                        </div>
                    )}
                    {(targetUser?.isActive || chatState === ChatState.CONNECTED) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>}
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-white group-hover:text-[#0095f6] transition-colors">
                        {targetUser ? targetUser.name : (chatState === ChatState.CONNECTED ? STRINGS.stranger : (chatState === ChatState.SEARCHING ? 'جاري البحث...' : STRINGS.stranger))}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                        {chatState === ChatState.CONNECTED || targetUser?.isActive ? 'نشط الآن • عرض الملف' : 'يتم الآن البحث عن شريك...'}
                    </span>
                </div>
              </div>
          )}
        </div>
        <div className="flex items-center gap-4">
            {!targetUser ? (
                <button onClick={handleStopClick} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${chatState === ChatState.DISCONNECTED ? 'bg-[#0095f6] text-white' : stopConfirm ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-black'}`}>
                    {chatState === ChatState.DISCONNECTED ? "محادثة جديدة" : stopConfirm ? "إنهاء؟" : "إنهاء"}
                </button>
            ) : activeMode === 'video' && (
                 <button onClick={toggleCallMode} className="p-3 bg-red-600 rounded-full text-white"><Phone className="w-6 h-6 fill-white rotate-[135deg]" /></button>
            )}
        </div>
      </div>

      {activeMode === 'video' ? (
        <div className="flex-1 flex flex-col min-h-0 relative bg-gray-900">
            <div className="flex-1 relative overflow-hidden bg-black">
                {chatState === ChatState.CONNECTED ? (
                     <div className="w-full h-full relative">
                         <img src={targetUser ? targetUser.avatar : `https://picsum.photos/seed/${chatId}/500/700`} className="w-full h-full object-cover" />
                     </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black">
                        <div className="text-center">
                            {chatState === ChatState.SEARCHING ? (
                                <>
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-t-[#0095f6] rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-3xl">🕵️</div>
                                    </div>
                                    <p className="animate-pulse">{STRINGS.searching}</p>
                                </>
                            ) : (
                                <>
                                    <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>في انتظار الاتصال...</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 relative overflow-hidden bg-black border-t-2 border-[#262626]">
                 {!cameraError && (isCamOn || isMockCam) ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" /> : <div className="w-full h-full flex items-center justify-center bg-[#121212] text-gray-500"><CameraOff className="w-10 h-10" /></div>}
                 <div className="absolute bottom-4 left-0 right-0 z-30">{renderChatInput(true)}</div>
            </div>
        </div>
      ) : (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black no-scrollbar">
                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="bg-[#1c1c1c] text-yellow-500 text-[10px] px-3 py-1 rounded-lg border border-yellow-500/10 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" />
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }
                    const isMe = msg.sender === 'me';
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1`}>
                            <div className={`max-w-[85%] rounded-2xl shadow-sm relative ${isMe ? 'bg-[#262626] text-white border border-gray-800 rounded-tr-none' : 'bg-white text-black rounded-tl-none'}`}>
                                {msg.type === 'text' && (
                                    <div className="px-3 py-2 min-w-[60px] relative">
                                        <p className="text-[15px] leading-snug break-words whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 opacity-60`}>
                                             <span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                             {isMe && <StatusIcon status={msg.status} isDark={true} />}
                                        </div>
                                    </div>
                                )}
                                {msg.type === 'audio' && <div className="px-3 py-2"><AudioPlayerBubble msg={msg} /></div>}
                                {msg.type === 'image' && (
                                    <div className="relative group overflow-hidden rounded-xl bg-black/20">
                                        <img src={msg.mediaUrl} className="max-w-full max-h-[350px] object-contain block" />
                                        <div className="absolute top-2 right-2 flex gap-1.5">
                                            <div className="bg-blue-600/80 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-white/20 shadow-lg">HD</div>
                                            <a href={msg.mediaUrl} download={msg.fileName || `IMG_${Date.now()}.png`} className="p-1.5 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                        {isMe && (
                                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                                <StatusIcon status={msg.status} isDark={true} />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {msg.type === 'video' && (
                                    <div className="relative group overflow-hidden rounded-xl bg-black/20">
                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-[350px]" />
                                        <div className="absolute top-2 right-2 flex gap-1.5">
                                            <div className="bg-blue-600/80 backdrop-blur-md text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-white/20 shadow-lg">4K</div>
                                            <a href={msg.mediaUrl} download={msg.fileName || `VID_${Date.now()}.mp4`} className="p-1.5 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {msg.type === 'file' && (
                                    <div className={`flex items-center gap-3 p-3 min-w-[220px] rounded-xl ${isMe ? 'bg-black/40' : 'bg-gray-100'}`}>
                                        <div className="relative">
                                            <FileText className={`w-8 h-8 ${isMe ? 'text-blue-400' : 'text-blue-600'}`} />
                                            <ShieldCheck className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-green-500 fill-black" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{msg.fileName}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] opacity-60">{msg.fileSize}</span>
                                                <span className="text-[10px] bg-green-500/20 text-green-500 px-1 rounded font-bold uppercase">Original</span>
                                            </div>
                                        </div>
                                        <a href={msg.mediaUrl} download={msg.fileName} className="p-2 hover:bg-black/10 rounded-full transition-colors shrink-0">
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            {renderChatInput()}
        </>
      )}
    </div>
  );
};

export default ChatWindow;
