import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Square, RotateCw, AlertCircle, Video as VideoIcon, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import { ChatState, Message, ChatMode } from '../types';
import { realtimeService } from '../services/realtimeService';
import { STRINGS } from '../constants';

interface ChatWindowProps {
  onBack: () => void;
  interests: string[];
  mode: ChatMode;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack, interests, mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.SEARCHING);
  const [stopConfirm, setStopConfirm] = useState(false);
  const [chatId, setChatId] = useState<number>(Date.now());
  
  // Video Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [isMockCam, setIsMockCam] = useState<boolean>(false); // Mock Camera state
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatState]);

  // Initial auto-start
  useEffect(() => {
    handleStartChat();
    return () => {
        realtimeService.disconnect();
    };
  }, []);

  // Camera handling for Video Mode with ROBUST FIX & MOCK Fallback
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
        if (!isMounted) return;
        setCameraError(false);
        setIsMockCam(false);

        // Helper to safely try getting a stream
        const getStream = async (constraints: MediaStreamConstraints) => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
                return await navigator.mediaDevices.getUserMedia(constraints);
            } catch (e) {
                return null;
            }
        };

        let stream = null;

        // Attempt 1: Standard Video + Audio
        stream = await getStream({ video: true, audio: true });

        // Attempt 2: Video only (if audio failed/denied)
        if (!stream) {
            console.warn("Video+Audio failed, trying video only");
            stream = await getStream({ video: true });
        }

        if (isMounted) {
            if (stream) {
                streamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                // Check what tracks we actually got
                const hasVideo = stream.getVideoTracks().length > 0;
                setIsCamOn(hasVideo);
            } else {
                console.warn("All camera attempts failed, switching to MOCK CAMERA.");
                setIsMockCam(true);
                setIsCamOn(true); // Technically "on" but mock
            }
        } else {
             // Cleanup if unmounted
             if (stream) stream.getTracks().forEach(t => t.stop());
        }
    };

    if (mode === 'video' && chatState !== ChatState.SEARCHING) {
        if (isCamOn && !cameraError && !streamRef.current && !isMockCam) {
             startCamera();
        } else if (!isCamOn && streamRef.current) {
             // User turned off cam
             streamRef.current.getVideoTracks().forEach(t => t.enabled = false);
        } else if (isCamOn && streamRef.current) {
             streamRef.current.getVideoTracks().forEach(t => t.enabled = true);
        }
    }

    return () => {
        isMounted = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
  }, [mode, chatState, isCamOn]);

  const handleStartChat = () => {
    setChatState(ChatState.SEARCHING);
    setMessages([]);
    setStopConfirm(false);
    setChatId(Date.now());
    
    // Connect to Realtime Service
    realtimeService.disconnect(); 
    realtimeService.connect(
        (msg) => {
            setMessages(prev => [...prev, msg]);
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
                  sender: 'system',
                  timestamp: Date.now()
              }]);
          }
      }
  };

  const handleSend = () => {
    if (!input.trim() || chatState !== ChatState.CONNECTED) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    realtimeService.sendMessage(userMsg.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Searching View
  if (chatState === ChatState.SEARCHING) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 bg-black">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#0095f6] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-4xl">{mode === 'video' ? '🎥' : '🕵️'}</span>
            </div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-xl font-medium animate-pulse">{STRINGS.searching}</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
               ملاحظة: لكي يعمل هذا الوضع، يجب فتح الموقع في نافذة أخرى (Tab) في نفس الوقت لمحاكاة شخص آخر.
            </p>
            {interests.length > 0 && (
                <p className="text-sm text-gray-400">نبحث عن شخص يحب: {interests.join(', ')}</p>
            )}
        </div>
        <button onClick={() => { setChatState(ChatState.IDLE); realtimeService.disconnect(); onBack(); }} className="mt-8 text-gray-500 hover:text-white">
            إلغاء
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 z-20 sticky top-0 ${mode === 'video' ? 'bg-black/80 backdrop-blur-md absolute w-full border-b-0 top-0 left-0 right-0' : 'bg-[#121212] border-b border-ig-darkSec shadow-md'}`}>
        <div className="flex items-center space-x-3 space-x-reverse">
          <button onClick={() => { realtimeService.disconnect(); onBack(); }} className="p-1 hover:bg-gray-800 rounded-full bg-black/40 text-white">
            <ArrowRight className="w-6 h-6" />
          </button>
          
          {mode === 'text' && (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600">
                    <span className="text-xl">👤</span>
                </div>
                <div>
                    <h3 className="font-bold text-base text-white">{STRINGS.stranger}</h3>
                    {chatState === ChatState.CONNECTED && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            متصل الآن
                        </span>
                    )}
                </div>
              </>
          )}
        </div>

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
      </div>

      {/* Content Area */}
      {mode === 'video' ? (
        // === VIDEO MODE LAYOUT ===
        <div className="flex-1 flex flex-col min-h-0 relative bg-gray-900">
            
            {/* 1. STRANGER VIEW (TOP HALF) */}
            <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
                {chatState === ChatState.CONNECTED ? (
                     <div className="w-full h-full relative">
                         <img 
                            src={`https://picsum.photos/seed/${chatId}/500/700`} 
                            alt="Stranger" 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-black/10"></div>
                     </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black">
                        <div className="text-center">
                           <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                           <p>الغريب غير متصل</p>
                        </div>
                    </div>
                )}
                
                <div className="absolute top-16 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-bold text-white backdrop-blur-sm flex items-center gap-2 z-10">
                    <span>{STRINGS.stranger}</span>
                    {chatState === ChatState.CONNECTED && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </div>

                {/* Messages Overlay */}
                <div className="absolute bottom-0 left-0 right-0 top-1/4 bg-gradient-to-t from-black via-black/50 to-transparent px-4 pb-20 flex flex-col justify-end overflow-y-auto no-scrollbar pointer-events-none z-10">
                     {messages.map((msg) => (
                         <div key={msg.id} className={`mb-2 px-3 py-2 rounded-xl max-w-[85%] text-sm backdrop-blur-md shadow-sm pointer-events-auto transition-all ${
                             msg.sender === 'system' ? 'self-center bg-gray-800/80 text-gray-300 text-xs py-1' :
                             msg.sender === 'me' ? 'self-end bg-[#0095f6]/80 text-white rounded-br-none' : 'self-start bg-white/20 text-white rounded-bl-none border border-white/10'
                         }`}>
                             {msg.sender !== 'system' && <span className="block text-[10px] opacity-70 mb-0.5">{msg.sender === 'me' ? 'أنت' : 'غريب'}</span>}
                             {msg.text}
                         </div>
                     ))}
                     <div ref={messagesEndRef} />
                </div>
            </div>

            {/* 2. USER VIEW (BOTTOM HALF) */}
            <div className="flex-1 relative overflow-hidden bg-black border-t-2 border-[#262626]">
                 {!cameraError && (isCamOn || isMockCam) ? (
                    isMockCam ? (
                         <div className="absolute inset-0 w-full h-full">
                            <video 
                                src="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[8px] font-bold text-white">
                                كاميرا وهمية
                            </div>
                         </div>
                    ) : (
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover transform -scale-x-100" 
                        />
                    )
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#121212] text-gray-500">
                        <div className="text-center px-4">
                            {cameraError ? (
                                <>
                                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
                                    <p className="text-red-400 text-sm">تعذر الوصول للكاميرا</p>
                                    <p className="text-xs text-gray-600 mt-1">تأكد من الصلاحيات</p>
                                </>
                            ) : (
                                <>
                                    <CameraOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>الكاميرا مغلقة</p>
                                </>
                            )}
                        </div>
                    </div>
                 )}

                 <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-bold text-white backdrop-blur-sm z-10">
                     أنت
                 </div>

                 {/* Local Controls Overlay */}
                 <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                     <button onClick={() => setIsMicOn(!isMicOn)} className={`p-3 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                     </button>
                     <button onClick={() => { setIsCamOn(!isCamOn); setCameraError(false); }} className={`p-3 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all ${isCamOn && !cameraError ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                        {isCamOn && !cameraError ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                     </button>
                 </div>
            </div>

        </div>
      ) : (
        // === TEXT MODE LAYOUT ===
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black">
            {messages.map((msg) => {
                if (msg.sender === 'system') {
                    return (
                        <div key={msg.id} className="flex justify-center my-4">
                            <span className="bg-[#262626] text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-800">
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
                        <span className={`text-[10px] mb-1 px-1 ${msg.sender === 'me' ? 'text-blue-400' : 'text-red-400'}`}>
                            {msg.sender === 'me' ? 'أنت' : STRINGS.stranger}
                        </span>
                        <div 
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-snug break-words shadow-sm ${
                            msg.sender === 'me' 
                            ? 'bg-[#0095f6] text-white rounded-br-none' 
                            : 'bg-[#262626] text-white rounded-bl-none border border-gray-800'
                        }`}
                        >
                        {msg.text}
                        </div>
                    </div>
                );
            })}
            
            {chatState === ChatState.DISCONNECTED && (
                <div className="flex flex-col items-center justify-center py-6 space-y-3 opacity-80">
                    <p className="text-gray-500 font-medium">لقد غادر الغريب المحادثة.</p>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className={`p-3 flex items-center gap-3 z-30 transition-all ${mode === 'video' ? 'bg-black/80 backdrop-blur-lg border-t border-white/10 absolute bottom-0 w-full' : 'bg-[#121212] border-t border-ig-darkSec'}`}>
        <div className={`flex-1 flex items-center bg-[#262626] rounded-3xl px-4 py-2 border ${chatState === ChatState.CONNECTED ? 'border-transparent focus-within:border-gray-500' : 'border-red-900/50 opacity-50 cursor-not-allowed'}`}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chatState !== ChatState.CONNECTED}
                placeholder={chatState === ChatState.CONNECTED ? STRINGS.typeMessage : 'المحادثة منتهية'}
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-sm h-7"
            />
        </div>
        <button 
            onClick={handleSend}
            disabled={!input.trim() || chatState !== ChatState.CONNECTED}
            className={`p-2 rounded-full transition-colors ${input.trim() && chatState === ChatState.CONNECTED ? 'bg-[#0095f6] text-white hover:bg-[#0085dd]' : 'bg-[#262626] text-gray-600'}`}
        >
            <Send className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;