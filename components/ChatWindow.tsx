import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Square, RotateCw, AlertCircle, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, Phone, Trash2, Lock, Play, Pause, X, ChevronLeft, Check, Plus, Image as ImageIcon, FileText, Download } from 'lucide-react';
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
  };
}

// Helper to format duration (seconds -> MM:SS)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Helper to format file size
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Read Receipt Icon Component
const StatusIcon = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
    if (!status) return <Check className="w-3 h-3 text-gray-500" />;
    if (status === 'sent') return <Check className="w-3.5 h-3.5 text-gray-400" />;
    if (status === 'delivered') return <div className="flex -space-x-1"><Check className="w-3.5 h-3.5 text-gray-400" /><Check className="w-3.5 h-3.5 text-gray-400" /></div>;
    if (status === 'read') return <div className="flex -space-x-1"><Check className="w-3.5 h-3.5 text-blue-500" /><Check className="w-3.5 h-3.5 text-blue-500" /></div>;
    return null;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack, interests, mode: initialMode, targetUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.SEARCHING);
  const [stopConfirm, setStopConfirm] = useState(false);
  const [chatId, setChatId] = useState<number>(Date.now());
  
  // Mode State
  const [activeMode, setActiveMode] = useState<ChatMode>(initialMode);
  
  // Attachments State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for auto-resizing

  // Video Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [isMockCam, setIsMockCam] = useState<boolean>(false);
  
  // --- VOICE RECORDING STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // Gesture State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCancellingAnimation, setIsCancellingAnimation] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordStartTimeRef = useRef<number>(0);
  
  // Gestures Refs
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        const newHeight = Math.min(textareaRef.current.scrollHeight, 120); // Cap at 120px
        textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Initial auto-start
  useEffect(() => {
    if (targetUser) {
        setChatState(ChatState.CONNECTED);
        setActiveMode(initialMode);
        setMessages([
            {
                id: 'hist_1',
                text: 'اليوم',
                type: 'text',
                sender: 'system',
                timestamp: Date.now() - 3600000
            },
            {
                id: 'hist_sys',
                text: '🔒 الرسائل والمكالمات مشفرة تماماً.',
                type: 'text',
                sender: 'system',
                timestamp: Date.now()
            }
        ]);
    } else {
        handleStartChat();
    }
    return () => {
        realtimeService.disconnect();
    };
  }, [targetUser]);

  // Monitor Chat State for System Messages
  useEffect(() => {
    if (chatState === ChatState.CONNECTED && !targetUser) {
      setMessages(prev => [...prev, {
        id: `sys_conn_${Date.now()}`,
        text: STRINGS.connected,
        type: 'text',
        sender: 'system',
        timestamp: Date.now()
      }]);
    }
  }, [chatState, targetUser]);

  // Camera handling logic (omitted for brevity as focus is on audio/media)
  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
        if (!isMounted) return;
        setCameraError(false);
        setIsMockCam(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (isMounted && stream) {
                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                setIsCamOn(true);
            }
        } catch (e) {
            console.warn("Camera failed", e);
            if (isMounted) { setIsMockMode(true); setIsCamOn(true); }
        }
    };

    if (activeMode === 'video' && chatState !== ChatState.SEARCHING) {
        if (isCamOn && !streamRef.current && !isMockCam) startCamera();
    }
    return () => { isMounted = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [activeMode, chatState]);

  const setIsMockMode = (val: boolean) => setIsMockCam(val);

  // --- RECORDING FUNCTIONS ---

  const startRecording = async () => {
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

          recordingTimerRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);

      } catch (err) {
          console.error("Failed to start recording", err);
          alert("الرجاء السماح بالوصول للميكروفون لتسجيل الصوت");
      }
  };

  const stopRecording = (shouldSend: boolean) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

      mediaRecorderRef.current.onstop = () => {
          if (shouldSend && !isCancellingAnimation) {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const duration = (Date.now() - recordStartTimeRef.current) / 1000;
              
              if (duration > 1) { 
                  handleSendAudio(audioUrl, Math.round(duration));
              }
          }
          
          // Cleanup
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
          stopRecording(false);
      }, 300); // Wait for animation
  };

  // --- GESTURES HANDLERS ---

  const handleTouchStartRecord = (e: React.TouchEvent | React.MouseEvent) => {
      if (input.trim()) return;
      isDraggingRef.current = true;
      if ('touches' in e) {
          startYRef.current = e.touches[0].clientY;
          startXRef.current = e.touches[0].clientX;
      } else {
          startYRef.current = (e as React.MouseEvent).clientY;
          startXRef.current = (e as React.MouseEvent).clientX;
      }
      startRecording();
  };

  const handleTouchMoveRecord = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDraggingRef.current || isLocked) return;
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
      if (deltaY < -60) {
          setIsLocked(true);
          isDraggingRef.current = false;
          setDragOffset({ x: 0, y: 0 });
      }
      if (Math.abs(deltaX) > 120) {
          cancelRecording();
          isDraggingRef.current = false;
      }
  };

  const handleTouchEndRecord = () => {
      if (isLocked) return;
      if (isDraggingRef.current) {
          isDraggingRef.current = false;
          if (!isCancellingAnimation) {
              stopRecording(true);
          }
      }
  };

  // --- FILE HANDLING ---

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

          // Simulate Status
          setTimeout(() => setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)), 1000);
          setTimeout(() => setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)), 2500);
      }
  };

  // --- SEND HANDLERS ---

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
            } else {
                if (chatState === ChatState.CONNECTED) {
                    setChatState(ChatState.DISCONNECTED);
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        text: 'الغريب غادر المحادثة.',
                        type: 'text',
                        sender: 'system',
                        timestamp: Date.now()
                    }]);
                }
            }
        }
    );
  };

  const handleStopClick = () => {
      if (chatState === ChatState.DISCONNECTED) {
          handleStartChat();
      } else {
          if (!stopConfirm) {
              setStopConfirm(true);
          } else {
              realtimeService.disconnect();
              setChatState(ChatState.DISCONNECTED);
              setStopConfirm(false);
              setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  text: 'تم إنهاء المحادثة.',
                  type: 'text',
                  sender: 'system',
                  timestamp: Date.now()
              }]);
          }
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
    
    // Reset height manually if needed
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
    }, 2500);
    
    if (!targetUser) {
        realtimeService.sendMessage(userMsg.text!);
    }
  };

  const handleSendAudio = (url: string, duration: number) => {
      const audioMsg: Message = {
          id: Date.now().toString(),
          type: 'audio',
          audioUrl: url,
          duration: duration,
          sender: 'me',
          timestamp: Date.now(),
          status: 'sent'
      };
      setMessages(prev => [...prev, audioMsg]);
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === audioMsg.id ? { ...m, status: 'delivered' } : m));
      }, 1000);
      setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === audioMsg.id ? { ...m, status: 'read' } : m));
      }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleCallMode = () => {
      setActiveMode(prev => prev === 'text' ? 'video' : 'text');
  };

  // --- AUDIO PLAYER COMPONENT ---
  const AudioPlayerBubble = ({ msg }: { msg: Message }) => {
      const [playing, setPlaying] = useState(false);
      const [progress, setProgress] = useState(0);
      const [speed, setSpeed] = useState(1);
      const audioRef = useRef<HTMLAudioElement | null>(null);

      useEffect(() => {
          if (!msg.audioUrl) return;
          const audio = new Audio(msg.audioUrl);
          audioRef.current = audio;

          audio.ontimeupdate = () => {
              if (audio.duration) {
                  setProgress((audio.currentTime / audio.duration) * 100);
              }
          };

          audio.onended = () => {
              setPlaying(false);
              setProgress(0);
          };

          return () => {
              audio.pause();
              audio.src = '';
          };
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
                       <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-blue-500 border border-black z-10 flex items-center justify-center">
                            <Mic className="w-2.5 h-2.5 text-white" />
                       </div>
                       <img 
                          src={msg.sender === 'me' ? "https://picsum.photos/100/100?random=me" : targetUser?.avatar || "https://picsum.photos/100/100?random=stranger"} 
                          className="w-10 h-10 rounded-full border-2 border-transparent object-cover" 
                       />
                  </div>
                  
                  <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-gray-500/20 rounded-full hover:bg-gray-500/30 transition-colors">
                      {playing ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                  
                  <div className="flex-1 flex flex-col gap-1">
                      <div className="h-8 flex items-center gap-[2px] opacity-80">
                          {[...Array(25)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 rounded-full transition-all duration-300 ${i/25 < progress/100 ? 'bg-blue-400' : 'bg-gray-400'}`}
                                style={{ 
                                    height: `${playing ? Math.max(20, Math.random() * 100) : 40}%`,
                                }}
                              ></div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[10px] text-gray-400">{formatTime(msg.duration || 0)}</span>
                  <div className="flex items-center gap-2">
                       <button onClick={toggleSpeed} className="bg-gray-700/50 px-2 py-0.5 rounded-full text-[10px] font-bold hover:bg-gray-600 transition-colors">
                           {speed}x
                       </button>
                       {msg.sender === 'me' && <StatusIcon status={msg.status} />}
                  </div>
              </div>
          </div>
      );
  };

  // Searching View
  if (chatState === ChatState.SEARCHING) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 bg-black">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#0095f6] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-4xl">{activeMode === 'video' ? '🎥' : '🕵️'}</span>
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-xl font-medium animate-pulse">{STRINGS.searching}</p>
            <button onClick={() => { setChatState(ChatState.IDLE); realtimeService.disconnect(); onBack(); }} className="mt-8 text-gray-500 hover:text-white">
                إلغاء
            </button>
        </div>
      </div>
    );
  }

  // Common Input Component for reusability with style props
  const ChatInput = ({ isOverlay = false }) => (
    <div className={`relative ${isOverlay ? 'w-full px-4 pb-4' : 'px-2 py-2 bg-[#1c1c1c] border-t border-ig-darkSec'}`}>
        
        {/* ATTACHMENT MENU POPUP */}
        {isAttachMenuOpen && (
            <div className="absolute bottom-16 left-4 bg-[#262626] rounded-xl shadow-2xl border border-gray-700 p-2 flex flex-col gap-2 z-50 animate-in slide-in-from-bottom-5 fade-in">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></div>
                    <span className="text-white text-sm font-medium">معرض الصور</span>
                </button>
                <button onClick={() => setActiveMode('video')} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center"><Camera className="w-4 h-4 text-white" /></div>
                    <span className="text-white text-sm font-medium">كاميرا</span>
                </button>
                <button onClick={() => docInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></div>
                    <span className="text-white text-sm font-medium">مستند (جودة أصلية)</span>
                </button>
            </div>
        )}

        {/* Hidden Inputs */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileSelect(e, 'media')} 
            accept="image/*,video/*" 
            className="hidden" 
        />
        <input 
            type="file" 
            ref={docInputRef} 
            onChange={(e) => handleFileSelect(e, 'doc')} 
            className="hidden" 
        />

        {/* RECORDING OVERLAY (Locked or Held) */}
        {isRecording && (
            <div className={`absolute inset-0 z-20 flex items-center px-4 gap-4 animate-in slide-in-from-right duration-200 ${isOverlay ? 'bg-black/90 rounded-3xl' : 'bg-[#1c1c1c]'}`}>
                {/* Trash Animation if Cancelling */}
                {isCancellingAnimation ? (
                    <div className="flex-1 flex items-center gap-2 text-red-500 animate-pulse">
                         <Trash2 className="w-5 h-5" />
                         <span className="font-bold">جاري الحذف...</span>
                    </div>
                ) : (
                    <>
                         {isLocked ? (
                             <div className="flex-1 flex items-center gap-3">
                                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                                 <span className="text-white font-mono font-bold text-lg min-w-[50px]">{formatTime(recordingDuration)}</span>
                                 <div className="flex-1 flex items-end justify-center h-6 gap-0.5 pb-1">
                                      {/* Recording Visualizer */}
                                      {[...Array(10)].map((_, i) => (
                                          <div key={i} className="w-1 bg-red-500/50 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                                      ))}
                                 </div>
                             </div>
                         ) : (
                             <div className="flex-1 flex items-center gap-2 text-gray-400">
                                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                 <span className="font-mono">{formatTime(recordingDuration)}</span>
                                 <div className="flex-1 text-center flex items-center justify-center gap-1 opacity-60">
                                     <ChevronLeft className="w-4 h-4 animate-bounce-horizontal" />
                                     <span className="text-xs">اسحب للإلغاء</span>
                                 </div>
                             </div>
                         )}

                         {/* Action Buttons */}
                         {isLocked && (
                             <div className="flex items-center gap-4">
                                 <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                     <Trash2 className="w-6 h-6" />
                                 </button>
                                 <button onClick={() => stopRecording(true)} className="p-2 bg-[#0095f6] text-white rounded-full hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
                                     <Send className="w-5 h-5 rtl:rotate-180 ml-0.5" />
                                 </button>
                             </div>
                         )}
                    </>
                )}
            </div>
        )}

        <div className={`flex items-end gap-2 relative ${isRecording ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} className="p-3 mb-0.5 text-gray-400 hover:text-white transition-colors bg-[#262626] rounded-full">
                {isAttachMenuOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
            <button onClick={() => setActiveMode('video')} className="p-3 mb-0.5 text-gray-400 hover:text-white transition-colors">
                 <Camera className="w-6 h-6" />
            </button>
            
            {/* Auto-Resizing Textarea */}
            <div className={`flex-1 flex items-center rounded-3xl px-4 py-2 border transition-all bg-[#262626] border-transparent focus-within:border-gray-600`}>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setIsAttachMenuOpen(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder={STRINGS.typeMessage}
                    rows={1}
                    dir="auto"
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-sm resize-none max-h-[120px] overflow-y-auto leading-5 py-1 dir-rtl"
                    style={{ minHeight: '28px' }}
                />
            </div>
            
            {/* Dynamic Mic/Send Button */}
            <div className="relative mb-0.5">
                {/* Lock Hint (Slide Up) */}
                {isRecording && !isLocked && !input.trim() && (
                    <div 
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500 z-50"
                        style={{ transform: `translate(-50%, ${dragOffset.y}px)` }}
                    >
                        <div className="bg-black/60 p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                            <Lock className={`w-5 h-5 ${dragOffset.y < -30 ? 'text-[#0095f6] scale-110' : 'text-white'}`} />
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-50">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    </div>
                )}

                <button 
                    onMouseDown={handleTouchStartRecord}
                    onMouseUp={handleTouchEndRecord}
                    onTouchStart={handleTouchStartRecord}
                    onTouchEnd={handleTouchEndRecord}
                    onTouchMove={handleTouchMoveRecord}
                    onClick={input.trim() ? handleSend : undefined}
                    className={`p-3 rounded-full transition-all flex-shrink-0 shadow-lg select-none ${
                        input.trim()
                        ? 'bg-[#0095f6] text-white hover:bg-[#0085dd]' 
                        : isRecording 
                            ? 'bg-red-500 scale-150 ring-4 ring-red-900 shadow-[0_0_20px_red]' 
                            : 'bg-[#0095f6] text-white'
                    }`}
                    style={isRecording && !isLocked && !input.trim() ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.5)` } : {}}
                >
                    {input.trim() ? (
                        <Send className="w-5 h-5 rtl:rotate-180 ml-0.5" />
                    ) : (
                        <Mic className={`w-5 h-5 ${isRecording ? 'fill-white' : ''}`} />
                    )}
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0b0b0b] relative">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 z-20 sticky top-0 ${activeMode === 'video' ? 'bg-black/80 backdrop-blur-md absolute w-full border-b-0 top-0 left-0 right-0' : 'bg-[#1c1c1c] border-b border-gray-800 shadow-sm'}`}>
        <div className="flex items-center space-x-3 space-x-reverse">
          <button onClick={() => { realtimeService.disconnect(); onBack(); }} className="p-1 hover:bg-gray-800 rounded-full text-white transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          
          {(activeMode === 'text' || targetUser) && (
              <div className="flex items-center gap-3">
                <div className="relative">
                    {targetUser ? (
                        <img src={targetUser.avatar} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                            <span className="text-xl">👤</span>
                        </div>
                    )}
                    {targetUser?.isActive && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c1c]"></div>}
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-white">{targetUser ? targetUser.name : STRINGS.stranger}</h3>
                    {targetUser && <span className="text-[10px] text-gray-400">متصل الآن</span>}
                </div>
              </div>
          )}
        </div>

        <div className="flex items-center gap-4">
            {targetUser && activeMode === 'text' && (
                <>
                    <button className="text-gray-300 hover:text-white transition-colors">
                        <Phone className="w-6 h-6" />
                    </button>
                    <button onClick={toggleCallMode} className="text-gray-300 hover:text-white transition-colors">
                        <VideoIcon className="w-6 h-6" />
                    </button>
                </>
            )}

            {!targetUser ? (
                <button 
                    onClick={handleStopClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg ${
                        chatState === ChatState.DISCONNECTED 
                        ? 'bg-[#0095f6] hover:bg-[#0085dd] text-white' 
                        : stopConfirm 
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                            : 'bg-white text-black hover:bg-gray-200'
                    }`}
                >
                    {chatState === ChatState.DISCONNECTED ? (
                        <>
                            <RotateCw className="w-4 h-4" />
                            <span>{STRINGS.newChat}</span>
                        </>
                    ) : stopConfirm ? (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span>{STRINGS.reallyStop}</span>
                        </>
                    ) : (
                        <>
                            <Square className="w-4 h-4 fill-current" />
                            <span>{STRINGS.stop}</span>
                        </>
                    )}
                </button>
            ) : activeMode === 'video' && (
                 <button 
                    onClick={toggleCallMode}
                    className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-lg"
                 >
                     <Phone className="w-6 h-6 fill-white rotate-[135deg]" />
                 </button>
            )}
        </div>
      </div>

      {/* Content Area */}
      {activeMode === 'video' ? (
        <div className="flex-1 flex flex-col min-h-0 relative bg-gray-900">
            <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
                {chatState === ChatState.CONNECTED ? (
                     <div className="w-full h-full relative">
                         {targetUser ? (
                             <img src={targetUser.avatar} className="w-full h-full object-cover blur-sm" />
                         ) : (
                             <img src={`https://picsum.photos/seed/${chatId}/500/700`} className="w-full h-full object-cover" />
                         )}
                     </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black">
                        <div className="text-center"><VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>الطرف الآخر غير متصل</p></div>
                    </div>
                )}
            </div>
            <div className="flex-1 relative overflow-hidden bg-black border-t-2 border-[#262626]">
                 {!cameraError && (isCamOn || isMockCam) ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#121212] text-gray-500"><CameraOff className="w-10 h-10" /></div>
                 )}
                 <div className="absolute bottom-4 left-0 right-0 z-30"><ChatInput isOverlay={true} /></div>
            </div>
        </div>
      ) : (
        <>
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b0b0b] no-scrollbar"
                style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'contain', backgroundBlendMode: 'overlay' }}
            >
                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="bg-[#1c1c1c]/90 text-yellow-500 text-[10px] px-3 py-1 rounded-lg border border-yellow-500/20 shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                                    <Lock className="w-3 h-3" />
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                            <div 
                            className={`max-w-[80%] rounded-lg shadow-sm relative group ${
                                msg.sender === 'me' 
                                ? 'bg-[#005c4b] text-white rounded-tr-none' 
                                : 'bg-[#202c33] text-white rounded-tl-none border border-gray-800'
                            } ${msg.type === 'text' ? 'px-2 py-2' : 'p-1'}`}
                            >
                                {/* TEXT */}
                                {msg.type === 'text' && (
                                    <div className="px-2 pt-1 pb-4 min-w-[100px] relative">
                                        <p className="text-[15px] leading-snug break-words dir-rtl text-right whitespace-pre-wrap">{msg.text}</p>
                                        <div className="absolute bottom-0 left-0 flex items-center gap-1">
                                             <span className="text-[10px] text-white/60">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                             {msg.sender === 'me' && <StatusIcon status={msg.status} />}
                                        </div>
                                    </div>
                                )}

                                {/* AUDIO */}
                                {msg.type === 'audio' && (
                                     <div className="p-2">
                                        <AudioPlayerBubble msg={msg} />
                                     </div>
                                )}

                                {/* IMAGE */}
                                {msg.type === 'image' && (
                                    <div className="relative">
                                        <img src={msg.mediaUrl} alt="sent image" className="rounded-lg max-w-full max-h-[300px] object-cover" />
                                        <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black/40 px-1.5 rounded text-[10px] text-white">
                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            {msg.sender === 'me' && <StatusIcon status={msg.status} />}
                                        </div>
                                    </div>
                                )}

                                {/* VIDEO */}
                                {msg.type === 'video' && (
                                    <div className="relative">
                                        <video src={msg.mediaUrl} controls className="rounded-lg max-w-full max-h-[300px]" />
                                        <div className="absolute top-2 left-2 bg-black/50 p-1 rounded-full"><VideoIcon className="w-4 h-4 text-white" /></div>
                                    </div>
                                )}

                                {/* FILE (ORIGINAL QUALITY) */}
                                {msg.type === 'file' && (
                                    <div className="flex items-center gap-3 p-3 min-w-[250px] bg-black/20 rounded-lg">
                                        <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center shrink-0">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{msg.fileName}</p>
                                            <p className="text-xs text-gray-300">{msg.fileSize} • {msg.fileName?.split('.').pop()?.toUpperCase()}</p>
                                        </div>
                                        {/* Download Button */}
                                        <a href={msg.mediaUrl} download={msg.fileName} className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors">
                                            <Download className="w-5 h-5 text-white" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {chatState === ChatState.DISCONNECTED && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3 opacity-80">
                        <p className="text-gray-500 font-medium">لقد غادر الطرف الآخر المحادثة.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <ChatInput />
        </>
      )}
    </div>
  );
};

export default ChatWindow;