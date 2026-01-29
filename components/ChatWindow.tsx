
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Lock, Search as SearchIcon, Check, Plus, Trash2, Mic, Camera, FileText, Image as ImageIcon, Download, Loader2, X } from 'lucide-react';
import { ChatState, Message, ChatMode } from '../types';
import { realtimeService } from '../services/realtimeService';
import { sendMessageToAI, startNewChatSession } from '../services/geminiService';
import { STRINGS } from '../constants';

interface ChatWindowProps {
  onBack: () => void;
  interests: string[];
  mode: ChatMode;
  targetUser?: any;
  onViewProfile?: (user: any) => void;
}

const StatusIcon = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
    if (!status) return <Check className="w-3 h-3 text-gray-500" />;
    if (status === 'sent') return <Check className="w-3.5 h-3.5 text-gray-400" />;
    if (status === 'delivered') return <div className="flex -space-x-1"><Check className="w-3.5 h-3.5 text-gray-400" /><Check className="w-3.5 h-3.5 text-gray-400" /></div>;
    if (status === 'read') return <div className="flex -space-x-1"><Check className="w-3.5 h-3.5 text-blue-500" /><Check className="w-3.5 h-3.5 text-blue-500" /></div>;
    return null;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack, interests, mode: initialMode, targetUser: initialTarget, onViewProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.SEARCHING);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [stopConfirm, setStopConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatState]);

  useEffect(() => {
    if (initialTarget) {
        setChatState(ChatState.CONNECTED);
        setActivePartner(initialTarget);
    } else {
        startSearching();
    }
    return () => realtimeService.disconnect();
  }, [initialTarget]);

  const startSearching = () => {
    setChatState(ChatState.SEARCHING);
    setMessages([]);
    
    // محاكاة البحث عن شخص أونلاين
    setTimeout(async () => {
        try {
            const onlineStranger = await startNewChatSession();
            setActivePartner({
                name: "غريب",
                username: onlineStranger.username,
                avatar: onlineStranger.avatar,
                isActive: true
            });
            setChatState(ChatState.CONNECTED);
            setMessages([
                { id: 'sys_conn', text: STRINGS.connected, type: 'text', sender: 'system', timestamp: Date.now() },
                { id: 'stranger_init', text: onlineStranger.text, type: 'text', sender: 'other', timestamp: Date.now() }
            ]);
        } catch (e) {
            setChatState(ChatState.DISCONNECTED);
        }
    }, 4000); // 4 ثوانٍ للبحث لتعطيك شعور "الأونلاين"
  };

  const handleSend = async () => {
    if (!input.trim() || chatState !== ChatState.CONNECTED) return;
    
    const userMsg: Message = { id: Date.now().toString(), text: input, type: 'text', sender: 'me', timestamp: Date.now(), status: 'sent' };
    setMessages(prev => [...prev, userMsg]);
    const textToSend = input;
    setInput('');

    // محاكاة الكتابة من الطرف الآخر
    setTimeout(async () => {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
        const aiResponse = await sendMessageToAI(textToSend);
        
        // تأخير عشوائي ليشعر المستخدم أن الطرف الآخر يكتب فعلاً
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: aiResponse, type: 'text', sender: 'other', timestamp: Date.now() }]);
        }, Math.random() * 2000 + 1000);
    }, 600);
  };

  const handleStop = () => {
    if (chatState === ChatState.DISCONNECTED) {
        startSearching();
    } else if (!stopConfirm) {
        setStopConfirm(true);
    } else {
        setChatState(ChatState.DISCONNECTED);
        setStopConfirm(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* الهيدر - يبقى كما هو تماماً */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-900 bg-black z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-white"><ArrowRight className="w-6 h-6" /></button>
          {chatState === ChatState.CONNECTED && (
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewProfile?.(activePartner)}>
                <img src={activePartner?.avatar} className="w-10 h-10 rounded-full border border-gray-800" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{activePartner?.name}</span>
                    <span className="text-[10px] text-green-500">متصل الآن</span>
                </div>
              </div>
          )}
        </div>
        <button onClick={handleStop} className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${chatState === ChatState.DISCONNECTED ? 'bg-blue-600 text-white' : stopConfirm ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
            {chatState === ChatState.DISCONNECTED ? "جديد" : stopConfirm ? "إنهاء؟" : "إنهاء"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {chatState === ChatState.SEARCHING ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center"><SearchIcon className="w-8 h-8 text-blue-600 animate-pulse" /></div>
                </div>
                <h2 className="text-xl font-black text-white">{STRINGS.searching}</h2>
                <p className="text-gray-500 text-sm mt-2">البحث في السيرفرات العالمية...</p>
            </div>
        ) : (
            <>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : msg.sender === 'system' ? 'items-center my-4' : 'items-start'}`}>
                        {msg.sender === 'system' ? (
                            <span className="bg-gray-900 text-gray-500 text-[10px] px-3 py-1 rounded-lg border border-gray-800"><Lock className="w-3 h-3 inline ml-1" />{msg.text}</span>
                        ) : (
                            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-[#262626] text-white rounded-tr-none' : 'bg-white text-black rounded-tl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <div className="flex justify-end items-center gap-1 mt-1 opacity-50">
                                    <span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    {msg.sender === 'me' && <StatusIcon status={msg.status} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {chatState === ChatState.CONNECTED && (
          <div className="p-3 bg-black border-t border-gray-900 flex items-center gap-2">
            <button className="p-2 text-gray-500"><Plus /></button>
            <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-4 py-2 border border-gray-800 focus-within:border-gray-600 transition-all">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="اكتب رسالة..."
                    className="bg-transparent border-none outline-none text-white text-sm w-full py-1"
                />
            </div>
            <button onClick={handleSend} disabled={!input.trim()} className={`p-3 rounded-full ${input.trim() ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
      )}
    </div>
  );
};

export default ChatWindow;
