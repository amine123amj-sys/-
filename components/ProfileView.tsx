import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Menu, Grid, Video, Image as ImageIcon, FileText, Star,
  ChevronDown, Link as LinkIcon, X, Check,
  Lock, Bell, ShieldAlert, LogOut, Users, Heart, EyeOff, Eye, Zap, Smile, Music, Briefcase, Camera,
  UserCog, Smartphone, Key, Globe, Moon, HelpCircle, MessageCircle, Ban, BellRing, ShieldCheck, History,
  Fingerprint, Ghost, Download, FileJson, AlertTriangle, CreditCard, ArrowRight, ArrowLeft, Mail, Calendar, MapPin, Laptop, Trash2, Search, Edit2, Shield, CheckCircle, Smartphone as PhoneIcon, AtSign, Plus, RefreshCw
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../constants';

// --- CONSTANTS ---
const ANONYMOUS_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

// --- DUMMY DATA ---
const MY_CONTENT = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/300/300?random=${i + 100}`,
  type: i % 3 === 0 ? 'video' : i % 2 === 0 ? 'image' : 'text',
  views: Math.floor(Math.random() * 5000) + 500
}));

const MOODS = [
    { id: 'happy', icon: '😄', label: 'سعيد' },
    { id: 'work', icon: '💼', label: 'في العمل' },
    { id: 'music', icon: '🎧', label: 'موسيقى' },
    { id: 'live', icon: '🔴', label: 'بث مباشر' },
    { id: 'chill', icon: '☕', label: 'روقان' },
];

// Helper Components for Settings
const SettingsGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="space-y-1">
        <h3 className="text-xs font-bold text-gray-500 px-2 mb-2 uppercase tracking-wider">{title}</h3>
        <div className="space-y-1">
            {children}
        </div>
        <div className="h-px bg-gray-800 my-4 mx-2"></div>
    </div>
);

const SettingsToggle = ({ icon, label, subtext, isOn, onToggle }: any) => (
    <div className="flex items-center justify-between p-3 hover:bg-[#1c1c1c] rounded-xl transition-colors cursor-pointer" onClick={onToggle}>
         <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-800 rounded-lg text-gray-200">
                 {React.cloneElement(icon, { className: "w-5 h-5" })}
             </div>
             <div className="flex flex-col items-start">
                 <span className="text-sm font-bold text-white">{label}</span>
                 {subtext && <span className="text-[10px] text-gray-400">{subtext}</span>}
             </div>
         </div>
         <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-[#0095f6]' : 'bg-gray-600'}`}>
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isOn ? '-translate-x-5' : 'translate-x-0'}`}></div>
         </div>
    </div>
);

const SettingsRow = ({ icon, label, subtext, isDestructive, onClick, rightElement }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-[#1c1c1c] rounded-xl transition-colors group text-right">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors text-gray-200 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
                {React.cloneElement(icon, { className: `w-5 h-5 ${isDestructive ? 'text-red-500' : ''}` })}
            </div>
            <div className="flex flex-col items-start text-start">
                <span className={`text-sm font-bold ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</span>
                {subtext && <span className="text-[10px] text-gray-400">{subtext}</span>}
            </div>
        </div>
        {rightElement ? rightElement : <ChevronDown className="w-4 h-4 rotate-90 text-gray-600 group-hover:text-gray-400 transition-colors ltr:rotate-[-90deg]" />}
    </button>
);

interface ProfileViewProps {
  currentUser: User | null;
  onLogout: () => void;
  onUpdateProfile: (user: User) => void;
}

type SettingsPage = 
  | 'MAIN' 
  | 'PERSONAL_INFO' 
  | 'ACCOUNT_TYPE'
  | 'SECURITY_MAIN' 
  | 'SECURITY_PASSWORD'
  | 'SECURITY_FORGOT_PASSWORD'
  | 'SECURITY_ACTIVITY'
  | 'SECURITY_EMAILS'
  | 'SECURITY_CHECKUP'
  | 'DEVICES' 
  | 'BLOCKED' 
  | 'CLOSE_FRIENDS' 
  | 'WALLET' 
  | 'LANGUAGE' 
  | 'HELP';

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onLogout, onUpdateProfile }) => {
  const { t, language, setLanguage, dir } = useLanguage();

  // --- STATE ---
  const [user, setUser] = useState<User>(currentUser || {
    id: '0',
    username: 'guest',
    name: 'Guest User',
    email: '',
    avatar: ANONYMOUS_AVATAR,
    bio: '',
    followers: 0,
    following: 0,
    postsCount: 0
  });

  // Ensure local state is in sync if currentUser changes (e.g. login)
  useEffect(() => {
      if (currentUser) {
          setUser(currentUser);
      }
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image' | 'text'>('all');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState<SettingsPage>('MAIN');
  const [langSearch, setLangSearch] = useState('');

  // Editing Info State
  const [editingField, setEditingField] = useState<'email' | 'phone' | 'dob' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const [isIncognito, setIsIncognito] = useState(false);
  const [currentMood, setCurrentMood] = useState(MOODS[0]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
      privateAccount: false,
      activityStatus: true,
      darkMode: true,
      secureMode: false,
      ghostMode: false,
      notifications: true,
      savedLogin: true,
  });
  
  const [accountType, setAccountType] = useState<'personal' | 'professional'>('personal');

  // Security Email Tab State
  const [emailTab, setEmailTab] = useState<'security' | 'other'>('security');

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState<'METHOD' | 'INPUT' | 'OTP' | 'NEW_PASS' | 'SUCCESS'>('METHOD');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mock Data
  const [blockedUsers, setBlockedUsers] = useState([
      { id: 1, name: 'Spam User', username: 'spam123', avatar: 'https://picsum.photos/50/50?random=90' },
      { id: 2, name: 'Annoying Bot', username: 'bot_x', avatar: 'https://picsum.photos/50/50?random=91' }
  ]);
  
  const [activeDevices, setActiveDevices] = useState([
      { id: 1, name: 'iPhone 13 Pro', location: 'الرياض, السعودية', active: true, icon: Smartphone, time: 'الآن' },
      { id: 2, name: 'Windows PC', location: 'جدة, السعودية', active: false, lastActive: 'منذ 3 ساعات', icon: Laptop, time: '3 س' }
  ]);

  const [closeFriends, setCloseFriends] = useState([
      { id: 1, name: 'Ahmed', username: 'ahmed_m', avatar: 'https://picsum.photos/50/50?random=200', selected: true },
      { id: 2, name: 'Sara', username: 'sara_art', avatar: 'https://picsum.photos/50/50?random=201', selected: true },
      { id: 3, name: 'Mohamed', username: 'mo_ali', avatar: 'https://picsum.photos/50/50?random=202', selected: false }
  ]);

  const toggleSetting = (key: keyof typeof settings) => {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setShowEditProfile(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  // --- INFO EDITING HANDLERS ---
  const openEditModal = (field: 'email' | 'phone' | 'dob') => {
      setEditingField(field);
      // Set initial value based on field
      if (field === 'email') setTempValue(user.email || '');
      else if (field === 'phone') setTempValue(user.phone || '');
      else if (field === 'dob') setTempValue(user.dob || '');
  };

  const saveField = () => {
      if (!editingField) return;
      
      const updatedUser = { ...user, [editingField]: tempValue };
      setUser(updatedUser); // Update local state for display
      setEditForm(updatedUser); // Update edit form state
      onUpdateProfile(updatedUser); // Persist to global/storage
      setEditingField(null);
  };

  const getRingColor = () => {
      if (currentMood.id === 'live') return 'from-purple-500 via-pink-500 to-red-500';
      if (currentMood.id === 'work') return 'from-gray-500 to-gray-700';
      return 'from-blue-400 to-blue-600';
  };

  const renderSmartGrid = () => {
      const items = MY_CONTENT.filter(item => {
          if (activeTab === 'all') return true;
          return item.type === activeTab;
      });

      return (
          <div className="grid grid-cols-3 gap-1 px-1 pb-24">
              {items.map((item, index) => {
                  const isFeatured = index === 0 && activeTab === 'all';
                  return (
                      <div 
                        key={item.id} 
                        className={`relative bg-gray-900 overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity group ${
                            isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'col-span-1 aspect-square'
                        }`}
                      >
                          {item.type === 'text' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black p-4 text-center">
                                  <p className="text-white text-xs font-bold leading-relaxed line-clamp-4">
                                      "أفكار اليوم: الهدوء هو مفتاح الإبداع ✨"
                                  </p>
                              </div>
                          ) : (
                              <img src={item.url} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.type === 'video' && <Video className="w-4 h-4 text-white drop-shadow-md" />}
                              {item.type === 'text' && <FileText className="w-4 h-4 text-white drop-shadow-md" />}
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {(item.views / 1000).toFixed(1)}k
                              </span>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  // --- OTP Logic ---
  const handleOtpChange = (index: number, value: string) => {
      if (value.length > 1) return;
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);
      if (value !== '' && index < 5) {
          otpRefs.current[index + 1]?.focus();
      }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) {
          otpRefs.current[index - 1]?.focus();
      }
  };

  // --- SECURITY SUB-SCREENS ---

  const renderForgotPassword = () => {
      switch (forgotStep) {
          case 'METHOD':
              return (
                  <div className="p-6 flex flex-col h-full animate-in slide-in-from-right">
                      <div className="text-center mb-8">
                          <div className="w-20 h-20 bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                              <Lock className="w-10 h-10 text-[#0095f6]" />
                          </div>
                          <h3 className="text-xl font-bold text-white">استرداد الحساب</h3>
                          <p className="text-sm text-gray-400 mt-2">كيف تريد استلام رمز التحقق لإعادة تعيين كلمة المرور؟</p>
                      </div>
                      
                      <div className="space-y-3">
                          <button 
                              onClick={() => { setRecoveryMethod('email'); setForgotStep('INPUT'); }}
                              className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="bg-gray-800 p-2.5 rounded-full"><Mail className="w-5 h-5 text-white" /></div>
                                  <div className="text-right">
                                      <p className="font-bold text-sm text-white">البريد الإلكتروني</p>
                                      <p className="text-xs text-gray-500">إرسال الرمز إلى بريدك</p>
                                  </div>
                              </div>
                              <ArrowLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
                          </button>

                          <button 
                              onClick={() => { setRecoveryMethod('phone'); setForgotStep('INPUT'); }}
                              className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="bg-gray-800 p-2.5 rounded-full"><Smartphone className="w-5 h-5 text-white" /></div>
                                  <div className="text-right">
                                      <p className="font-bold text-sm text-white">رقم الهاتف</p>
                                      <p className="text-xs text-gray-500">إرسال الرمز عبر SMS</p>
                                  </div>
                              </div>
                              <ArrowLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
                          </button>
                      </div>
                  </div>
              );
          
          case 'INPUT':
              return (
                  <div className="p-6 flex flex-col h-full animate-in slide-in-from-right">
                      <h3 className="text-xl font-bold text-white mb-2 text-center">أدخل {recoveryMethod === 'email' ? 'بريدك الإلكتروني' : 'رقم هاتفك'}</h3>
                      <p className="text-sm text-gray-400 mb-8 text-center">سنرسل رمز تحقق مكون من 6 أرقام إلى هذا {recoveryMethod === 'email' ? 'البريد' : 'الرقم'}.</p>
                      
                      <div className="bg-[#1c1c1c] px-4 py-3 rounded-xl border border-gray-800 mb-6 flex items-center gap-3">
                          {recoveryMethod === 'email' ? <Mail className="text-gray-500 w-5 h-5" /> : <PhoneIcon className="text-gray-500 w-5 h-5" />}
                          <input 
                              type={recoveryMethod === 'email' ? 'email' : 'tel'} 
                              defaultValue={recoveryMethod === 'email' ? user.email : user.phone}
                              placeholder={recoveryMethod === 'email' ? 'name@example.com' : '+966...'}
                              className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-gray-600 text-left dir-ltr"
                          />
                      </div>

                      <button onClick={() => setForgotStep('OTP')} className="w-full bg-[#0095f6] hover:bg-[#0085dd] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 mb-4">
                          إرسال الرمز
                      </button>
                      <button onClick={() => setForgotStep('METHOD')} className="text-sm text-gray-500 font-bold hover:text-white transition-colors">
                          تغيير الطريقة
                      </button>
                  </div>
              );

          case 'OTP':
              return (
                  <div className="p-6 flex flex-col h-full animate-in slide-in-from-right">
                      <h3 className="text-xl font-bold text-white mb-2 text-center">أدخل رمز التحقق</h3>
                      <p className="text-sm text-gray-400 mb-8 text-center">تم إرسال الرمز إلى {recoveryMethod === 'email' ? user.email : user.phone}</p>
                      
                      <div className="flex justify-between gap-2 mb-8 dir-ltr">
                          {otpCode.map((digit, i) => (
                              <input
                                  key={i}
                                  ref={el => otpRefs.current[i] = el}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  className="w-12 h-14 bg-[#1c1c1c] border border-gray-700 rounded-lg text-center text-2xl font-bold text-white focus:border-[#0095f6] focus:bg-[#262626] outline-none transition-all"
                              />
                          ))}
                      </div>

                      <button onClick={() => setForgotStep('NEW_PASS')} className="w-full bg-[#0095f6] hover:bg-[#0085dd] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 mb-6">
                          تحقق
                      </button>
                      
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-500">لم يصلك الرمز؟</span>
                          <button className="text-[#0095f6] font-bold">إعادة الإرسال (30s)</button>
                      </div>
                  </div>
              );

          case 'NEW_PASS':
              return (
                  <div className="p-6 flex flex-col h-full animate-in slide-in-from-right">
                      <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                              <CheckCircle className="w-8 h-8 text-green-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white">تعيين كلمة مرور جديدة</h3>
                          <p className="text-sm text-gray-400 mt-2">يرجى إنشاء كلمة مرور قوية لم تستخدمها من قبل.</p>
                      </div>

                      <div className="space-y-4 mb-6">
                          <div className="bg-[#1c1c1c] px-4 py-3 rounded-xl border border-gray-800">
                              <input type="password" placeholder="كلمة المرور الجديدة" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-gray-500" />
                          </div>
                          <div className="bg-[#1c1c1c] px-4 py-3 rounded-xl border border-gray-800">
                              <input type="password" placeholder="تأكيد كلمة المرور الجديدة" className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-gray-500" />
                          </div>
                      </div>

                      <div className="space-y-2 mb-8">
                          <p className="text-xs text-gray-500 flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> 8 أحرف على الأقل</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> حروف وأرقام ورموز</p>
                      </div>

                      <button onClick={() => setForgotStep('SUCCESS')} className="w-full bg-[#0095f6] hover:bg-[#0085dd] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20">
                          إعادة تعيين كلمة المرور
                      </button>
                  </div>
              );

          case 'SUCCESS':
              return (
                  <div className="p-6 flex flex-col h-full items-center justify-center animate-in zoom-in text-center">
                      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                          <Check className="w-12 h-12 text-white" strokeWidth={3} />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">تم تغيير كلمة المرور!</h2>
                      <p className="text-gray-400 text-sm mb-8 max-w-[250px]">تم تأمين حسابك بنجاح. يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.</p>
                      
                      <button 
                          onClick={() => { setSettingsPage('SECURITY_MAIN'); setForgotStep('METHOD'); }} 
                          className="w-full bg-[#1c1c1c] border border-gray-700 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold"
                      >
                          العودة للأمان
                      </button>
                  </div>
              );
      }
  };

  const renderPasswordChange = () => (
      <div className="p-4 space-y-6">
          <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                  <Lock className="w-8 h-8 text-[#0095f6]" />
              </div>
              <h3 className="text-xl font-bold text-white">تغيير كلمة المرور</h3>
              <p className="text-xs text-gray-500 mt-2">يجب أن تتكون كلمة المرور من 6 أحرف على الأقل وتتضمن مجموعة من الأرقام والحروف.</p>
          </div>

          <div className="space-y-4">
              <div className="bg-[#1c1c1c] p-2 rounded-xl border border-gray-800">
                  <input type="password" placeholder="كلمة المرور الحالية" className="w-full bg-transparent p-3 text-white text-sm outline-none placeholder-gray-500" />
              </div>
              <div className="bg-[#1c1c1c] p-2 rounded-xl border border-gray-800">
                  <input type="password" placeholder="كلمة المرور الجديدة" className="w-full bg-transparent p-3 text-white text-sm outline-none placeholder-gray-500" />
              </div>
              <div className="bg-[#1c1c1c] p-2 rounded-xl border border-gray-800">
                  <input type="password" placeholder="أعد كتابة كلمة المرور الجديدة" className="w-full bg-transparent p-3 text-white text-sm outline-none placeholder-gray-500" />
              </div>
              <div className="flex justify-end">
                  <button 
                      onClick={() => { setForgotStep('METHOD'); setSettingsPage('SECURITY_FORGOT_PASSWORD'); }} 
                      className="text-[#0095f6] text-xs font-bold hover:underline"
                  >
                      هل نسيت كلمة المرور؟
                  </button>
              </div>
          </div>

          <button className="w-full bg-[#0095f6] hover:bg-[#0085dd] text-white py-3.5 rounded-xl font-bold mt-4 shadow-lg shadow-blue-900/20">
              تغيير كلمة المرور
          </button>
      </div>
  );

  const renderAccountType = () => (
    <div className="p-4 space-y-4 animate-in slide-in-from-right">
        <div className="text-center py-6">
            <div className="w-20 h-20 bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <Briefcase className="w-10 h-10 text-[#0095f6]" />
            </div>
            <h3 className="text-xl font-bold text-white">نوع الحساب</h3>
            <p className="text-sm text-gray-400 mt-2">
                {accountType === 'personal' 
                    ? 'حسابك الحالي شخصي. يمكنك التبديل للحصول على أدوات احترافية.' 
                    : 'حسابك الحالي احترافي. يمكنك التبديل للعودة للحساب الشخصي.'}
            </p>
        </div>

        <div className="space-y-3">
            {accountType === 'personal' ? (
                <button 
                    onClick={() => setAccountType('professional')}
                    className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:border-[#0095f6] transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-800 p-2.5 rounded-full group-hover:bg-[#0095f6] transition-colors"><Briefcase className="w-5 h-5 text-white" /></div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-white">تبديل إلى حساب احترافي</p>
                            <p className="text-xs text-gray-500">احصل على رؤى حول متابعيك وأدوات الأعمال</p>
                        </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
                </button>
            ) : (
                <button 
                    onClick={() => setAccountType('personal')}
                    className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:border-red-500 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-800 p-2.5 rounded-full group-hover:bg-red-500 transition-colors"><UserCog className="w-5 h-5 text-white" /></div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-white">تبديل إلى حساب شخصي</p>
                            <p className="text-xs text-gray-500">ستفقد الوصول إلى الرؤى وأدوات الأعمال</p>
                        </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
                </button>
            )}
            
            <button className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                 <div className="flex items-center gap-4">
                        <div className="bg-gray-800 p-2.5 rounded-full"><Plus className="w-5 h-5 text-white" /></div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-white">إضافة حساب احترافي جديد</p>
                        </div>
                    </div>
                 <ArrowLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
            </button>
        </div>
    </div>
  );

  const renderLoginActivity = () => (
      <div className="flex flex-col h-full">
          {/* Mock Map */}
          <div className="h-48 w-full bg-gray-800 relative overflow-hidden mb-4">
              <img 
                src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg" 
                className="w-full h-full object-cover opacity-60" 
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-[#0095f6]/20 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="relative bg-[#0095f6] border-2 border-white p-1 rounded-full shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                  </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white backdrop-blur-md">الرياض، السعودية</div>
          </div>

          <div className="px-4 pb-4 space-y-4">
              <h3 className="text-sm font-bold text-gray-400">الأماكن التي سجلت الدخول منها</h3>
              
              {/* Current Device */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                              Riyadh, Saudi Arabia
                              <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 rounded">هذا الجهاز</span>
                          </p>
                          <p className="text-[10px] text-gray-500">iPhone 13 Pro • نشط الآن</p>
                      </div>
                  </div>
              </div>

              <div className="h-px bg-gray-800"></div>

              {/* Other Devices */}
              {activeDevices.filter(d => !d.active).map(device => (
                  <div key={device.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                              <device.icon className={`w-6 h-6 ${device.active ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                          <div>
                              <p className="text-sm font-bold text-white">{device.location}</p>
                              <p className="text-[10px] text-gray-500">{device.name} • {device.lastActive}</p>
                          </div>
                      </div>
                      <button className="text-gray-500 hover:text-white"><MoreHorizontalIcon /></button>
                  </div>
              ))}

              <button className="w-full text-center text-[#0095f6] text-xs font-bold mt-4">تسجيل الخروج من كل الجلسات الأخرى</button>
          </div>
      </div>
  );

  const renderSecurityEmails = () => (
      <div className="flex flex-col h-full">
          <div className="p-4 text-center">
              <p className="text-sm text-gray-400 leading-relaxed">
                  نرسل إليك رسائل البريد الإلكتروني الأمني والخاص بتسجيل الدخول خلال آخر 14 يوماً. استخدم هذه القائمة للتحقق من أن الرسائل واردة منا.
              </p>
          </div>
          
          <div className="flex border-b border-gray-800">
              <button 
                onClick={() => setEmailTab('security')} 
                className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${emailTab === 'security' ? 'text-white border-white' : 'text-gray-500 border-transparent'}`}
              >
                  الأمان
              </button>
              <button 
                onClick={() => setEmailTab('other')} 
                className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${emailTab === 'other' ? 'text-white border-white' : 'text-gray-500 border-transparent'}`}
              >
                  أخرى
              </button>
          </div>

          <div className="flex-1 p-4">
              {emailTab === 'security' ? (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-[#1c1c1c] p-3 rounded-xl border border-gray-800">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                              <p className="text-sm font-bold text-white">تم تسجيل دخول جديد</p>
                              <p className="text-[10px] text-gray-500">تم الإرسال إلى {user.email} • منذ 2 يوم</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#1c1c1c] p-3 rounded-xl border border-gray-800">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                              <p className="text-sm font-bold text-white">رمز استرداد حسابك</p>
                              <p className="text-[10px] text-gray-500">تم الإرسال إلى {user.email} • منذ 1 أسبوع</p>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-10 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا توجد رسائل أخرى</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderSecurityMain = () => (
      <div className="space-y-4">
          <SettingsGroup title="أمان تسجيل الدخول">
              <SettingsRow 
                  icon={<Key />} 
                  label="كلمة المرور" 
                  onClick={() => setSettingsPage('SECURITY_PASSWORD')} 
              />
              <SettingsRow 
                  icon={<History />} 
                  label="نشاط تسجيل الدخول" 
                  subtext="الرياض، جدة..."
                  onClick={() => setSettingsPage('SECURITY_ACTIVITY')} 
              />
              <SettingsToggle 
                  icon={<Download />} 
                  label="حفظ معلومات تسجيل الدخول" 
                  isOn={settings.savedLogin} 
                  onToggle={() => toggleSetting('savedLogin')} 
              />
          </SettingsGroup>

          <SettingsGroup title="الفحوصات والبيانات">
              <SettingsRow 
                  icon={<Mail />} 
                  label="رسائل البريد الإلكتروني" 
                  onClick={() => setSettingsPage('SECURITY_EMAILS')} 
              />
              <SettingsRow 
                  icon={<Shield />} 
                  label="التحقق من الأمان" 
                  onClick={() => setSettingsPage('SECURITY_CHECKUP')} 
              />
          </SettingsGroup>
      </div>
  );

  const renderSecurityCheckup = () => (
      <div className="flex flex-col h-full p-4">
          <div className="text-center py-6">
              <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">التحقق من الأمان</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">لقد قمنا بمراجعة إعدادات الأمان الخاصة بك، ويبدو كل شيء جيداً.</p>
          </div>

          <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-bold text-white">كلمة المرور قوية</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-bold text-white">البريد الإلكتروني صحيح</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-bold text-white">رقم الهاتف مرتبط</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
          </div>
          
          <button onClick={() => setSettingsPage('SECURITY_MAIN')} className="mt-auto w-full bg-[#1c1c1c] border border-gray-700 text-white py-3 rounded-xl font-bold">تم</button>
      </div>
  );

  const renderDevicesMain = () => (
      <div className="space-y-4">
          <div className="flex flex-col items-center py-6 text-center">
               <div className="w-16 h-16 bg-[#1c1c1c] rounded-full flex items-center justify-center mb-3">
                   <Smartphone className="w-8 h-8 text-[#0095f6]" />
               </div>
               <h3 className="font-bold text-lg text-white">مكان تسجيل دخولك</h3>
               <p className="text-xs text-gray-500 max-w-[200px]">نحن نراقب الأجهزة للحفاظ على أمان حسابك.</p>
          </div>
          <div className="bg-[#1c1c1c] rounded-xl border border-gray-800 overflow-hidden">
               {activeDevices.map((device, idx) => (
                   <div key={device.id}>
                       <div className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-gray-800 rounded-lg">
                                   <device.icon className={`w-6 h-6 ${device.active ? 'text-green-500' : 'text-gray-400'}`} />
                               </div>
                               <div>
                                   <p className="text-sm font-bold text-white flex items-center gap-2">
                                       {device.name}
                                       {device.active && <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 rounded">الآن</span>}
                                   </p>
                                   <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                       <MapPin className="w-3 h-3" /> {device.location} • {device.active ? 'نشط الآن' : device.lastActive}
                                   </p>
                               </div>
                           </div>
                           {!device.active && (
                               <button 
                                  onClick={() => setActiveDevices(prev => prev.filter(d => d.id !== device.id))}
                                  className="text-red-500 text-xs font-bold border border-red-500/30 px-2 py-1 rounded-lg hover:bg-red-500/10"
                               >
                                   خروج
                               </button>
                           )}
                       </div>
                       {idx < activeDevices.length - 1 && <div className="h-px bg-gray-800 mx-4"></div>}
                   </div>
               ))}
          </div>
      </div>
  );

  // --- NEW RENDER FUNCTIONS ---
  const renderPersonalInfo = () => (
      <div className="space-y-4">
          <div className="p-4 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 relative">
                   <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-gray-700" />
                   <button className="absolute bottom-0 right-0 bg-[#0095f6] p-1.5 rounded-full border-2 border-[#121212]">
                       <Camera className="w-4 h-4 text-white" />
                   </button>
              </div>
              <p className="text-gray-400 text-xs">تغيير صورة الملف الشخصي</p>
          </div>
          
          <SettingsGroup title="معلومات عامة">
              <SettingsRow 
                 icon={<UserCog />} 
                 label="الاسم" 
                 subtext={user.name} 
                 onClick={() => {}} 
              />
              <SettingsRow 
                 icon={<AtSign />} 
                 label="اسم المستخدم" 
                 subtext={user.username} 
                 onClick={() => {}} 
              />
              <SettingsRow 
                 icon={<FileText />} 
                 label="النبذة (Bio)" 
                 subtext={user.bio?.substring(0, 20) + '...'} 
                 onClick={() => {}} 
              />
          </SettingsGroup>

          <SettingsGroup title="معلومات خاصة">
              <SettingsRow 
                 icon={<Mail />} 
                 label="البريد الإلكتروني" 
                 subtext={user.email} 
                 onClick={() => openEditModal('email')} 
              />
              <SettingsRow 
                 icon={<PhoneIcon />} 
                 label="رقم الهاتف" 
                 subtext={user.phone || '+966...'} 
                 onClick={() => openEditModal('phone')} 
              />
              <SettingsRow 
                 icon={<Calendar />} 
                 label="تاريخ الميلاد" 
                 subtext={user.dob || '01/01/2000'} 
                 onClick={() => openEditModal('dob')} 
              />
          </SettingsGroup>
      </div>
  );

  const renderBlocked = () => (
      <div className="p-4 space-y-4">
          <div className="text-center py-4">
              <p className="text-sm text-gray-400">الحسابات التي قمت بحظرها لن تتمكن من رؤية ملفك الشخصي أو التواصل معك.</p>
          </div>
          {blockedUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-[#1c1c1c] p-3 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                      <img src={u.avatar} className="w-10 h-10 rounded-full" />
                      <div>
                          <p className="font-bold text-sm text-white">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.name}</p>
                      </div>
                  </div>
                  <button className="text-xs font-bold border border-gray-600 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white">
                      إلغاء الحظر
                  </button>
              </div>
          ))}
          <button className="w-full py-3 bg-[#1c1c1c] rounded-xl flex items-center justify-center gap-2 text-[#0095f6] font-bold text-sm mt-4 border border-gray-800 hover:bg-gray-800">
              <Plus className="w-4 h-4" /> إضافة لحظر
          </button>
      </div>
  );

  const renderCloseFriends = () => (
      <div className="flex flex-col h-full">
          <div className="p-4 text-center border-b border-gray-800">
              <p className="text-sm text-gray-400">
                  نحن لا نرسل إشعارات عند تحرير قائمة الأصدقاء المقربين.
              </p>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="relative mb-4">
                   <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                   <input type="text" placeholder="بحث" className="w-full bg-[#1c1c1c] rounded-xl py-2 pr-9 pl-3 text-sm text-white outline-none placeholder-gray-500" />
              </div>

              {closeFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between hover:bg-[#1c1c1c] p-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                          <img src={friend.avatar} className="w-12 h-12 rounded-full" />
                          <div>
                              <p className="font-bold text-sm text-white">{friend.name}</p>
                              <p className="text-xs text-gray-500">{friend.username}</p>
                          </div>
                      </div>
                      <div 
                        onClick={() => setCloseFriends(prev => prev.map(f => f.id === friend.id ? { ...f, selected: !f.selected } : f))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${friend.selected ? 'bg-[#0095f6] border-[#0095f6]' : 'border-gray-500'}`}
                      >
                          {friend.selected && <Check className="w-4 h-4 text-white" />}
                      </div>
                  </div>
              ))}
          </div>
          <div className="p-4 border-t border-gray-800 bg-[#121212]">
              <button onClick={() => setSettingsPage('MAIN')} className="w-full bg-[#0095f6] text-white py-3 rounded-xl font-bold">تم</button>
          </div>
      </div>
  );

  const renderWallet = () => (
      <div className="p-4 space-y-6">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 shadow-lg border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-32 h-32 text-white" /></div>
               <p className="text-sm text-blue-200 mb-1 font-medium">الرصيد الحالي</p>
               <h2 className="text-4xl font-bold text-white mb-4">5,000 <span className="text-lg font-normal opacity-80">عملة</span></h2>
               <div className="flex gap-3 relative z-10">
                   <button className="flex-1 bg-white text-blue-900 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-gray-100 transition-colors">شحن رصيد</button>
                   <button className="flex-1 bg-blue-800/50 text-white py-2.5 rounded-xl font-bold text-sm border border-blue-400/30 hover:bg-blue-800 transition-colors">إهداء</button>
               </div>
          </div>

          <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">سجل العمليات</h3>
              {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between bg-[#1c1c1c] p-3 rounded-xl border border-gray-800">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${i===1 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {i===1 ? <ArrowLeft className="w-4 h-4 rotate-45" /> : <ArrowRight className="w-4 h-4 -rotate-45" />}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-white">{i===1 ? 'شحن رصيد' : 'إرسال هدية'}</p>
                              <p className="text-[10px] text-gray-500">منذ {i} ساعة</p>
                          </div>
                      </div>
                      <span className={`font-bold text-sm ${i===1 ? 'text-green-500' : 'text-white'}`}>
                          {i===1 ? '+1000' : '-500'}
                      </span>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderLanguageSelection = () => (
      <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
               <div className="bg-[#1c1c1c] rounded-xl flex items-center px-3 py-2 gap-2 border border-gray-800">
                   <Search className="w-4 h-4 text-gray-500" />
                   <input 
                      type="text" 
                      placeholder={t('search_language')} 
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" 
                   />
               </div>
          </div>
          <div className="flex-1 overflow-y-auto">
               {SUPPORTED_LANGUAGES.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.nativeName.includes(langSearch)).map(l => (
                   <button 
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#1c1c1c] transition-colors border-b border-gray-900 group"
                   >
                       <div className="flex flex-col items-start">
                           <span className="text-sm font-bold text-white">{l.nativeName}</span>
                           <span className="text-xs text-gray-500">{l.name}</span>
                       </div>
                       {language.code === l.code && <Check className="w-5 h-5 text-[#0095f6]" />}
                   </button>
               ))}
          </div>
      </div>
  );

  const renderSettingsContent = () => {
      switch (settingsPage) {
          case 'PERSONAL_INFO':
              return renderPersonalInfo();
          
          // SECURITY ROUTES
          case 'SECURITY_MAIN':
              return renderSecurityMain();
          case 'SECURITY_PASSWORD':
              return renderPasswordChange();
          case 'SECURITY_FORGOT_PASSWORD':
              return renderForgotPassword();
          case 'SECURITY_ACTIVITY':
              return renderLoginActivity();
          case 'SECURITY_EMAILS':
              return renderSecurityEmails();
          case 'SECURITY_CHECKUP':
              return renderSecurityCheckup();

          case 'DEVICES':
              return renderDevicesMain();
          case 'BLOCKED':
              return renderBlocked();
          case 'CLOSE_FRIENDS':
              return renderCloseFriends();
          case 'WALLET':
              return renderWallet();
          case 'LANGUAGE':
              return renderLanguageSelection();
          case 'ACCOUNT_TYPE':
              return renderAccountType();
          default:
              return (
                  <>
                        {/* Search Bar */}
                        <div className="bg-[#1c1c1c] rounded-xl flex items-center px-3 py-2.5 gap-2 border border-gray-800 sticky top-0 z-20 shadow-lg mb-6">
                             <div className="w-5 h-5 text-gray-500"><Settings className="w-5 h-5" /></div>
                             <input type="text" placeholder={t('search_settings')} className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" />
                        </div>

                        {/* 1. Account Settings */}
                        <SettingsGroup title={t('account')}>
                            <SettingsRow icon={<UserCog />} label={t('personal_info')} subtext="الاسم، البايو، الميلاد" onClick={() => setSettingsPage('PERSONAL_INFO')} />
                            <SettingsRow icon={<ShieldCheck />} label={t('security')} subtext="كلمة المرور، المصادقة الثنائية" onClick={() => setSettingsPage('SECURITY_MAIN')} />
                            <SettingsRow icon={<Smartphone />} label={t('devices')} onClick={() => setSettingsPage('DEVICES')} />
                            <SettingsRow icon={<CreditCard />} label={t('wallet')} subtext="إدارة العملات" onClick={() => setSettingsPage('WALLET')} />
                            <SettingsRow icon={<Briefcase />} label={t('account_type')} subtext={accountType === 'personal' ? 'شخصي' : 'احترافي'} onClick={() => setSettingsPage('ACCOUNT_TYPE')} />
                            <SettingsRow icon={<AlertTriangle />} label={t('delete_account')} isDestructive onClick={() => {}} />
                        </SettingsGroup>

                        {/* 2. Privacy Settings */}
                        <SettingsGroup title={t('privacy')}>
                             <SettingsToggle 
                                icon={<Lock />} 
                                label={t('private_account')} 
                                isOn={settings.privateAccount} 
                                onToggle={() => toggleSetting('privateAccount')} 
                             />
                             <SettingsToggle 
                                icon={<Eye />} 
                                label={t('activity_status')} 
                                subtext="إظهار أنك متصل الآن"
                                isOn={settings.activityStatus} 
                                onToggle={() => toggleSetting('activityStatus')} 
                             />
                             <SettingsRow icon={<Ban />} label={t('blocked_accounts')} onClick={() => setSettingsPage('BLOCKED')} />
                             <SettingsRow icon={<Users />} label={t('close_friends')} onClick={() => setSettingsPage('CLOSE_FRIENDS')} />
                             <SettingsRow icon={<MessageCircle />} label={t('comments')} subtext="تحكم في من يعلق" onClick={() => {}} />
                        </SettingsGroup>

                        {/* 3. Smart Features (Unique to App) */}
                        <SettingsGroup title={t('smart_features')}>
                             <SettingsToggle 
                                icon={<Ghost />} 
                                label={t('ghost_mode')} 
                                subtext="تصفح دون ترك أثر في المشاهدات"
                                isOn={settings.ghostMode} 
                                onToggle={() => toggleSetting('ghostMode')} 
                             />
                             <SettingsToggle 
                                icon={<Fingerprint />} 
                                label={t('secure_mode')} 
                                subtext="منع تصوير الشاشة"
                                isOn={settings.secureMode} 
                                onToggle={() => toggleSetting('secureMode')} 
                             />
                        </SettingsGroup>

                        {/* 4. Notifications & App */}
                        <SettingsGroup title={t('app_media')}>
                             <SettingsToggle 
                                icon={<BellRing />} 
                                label={t('notifications')} 
                                isOn={settings.notifications} 
                                onToggle={() => toggleSetting('notifications')} 
                             />
                             <SettingsToggle 
                                icon={<Moon />} 
                                label={t('dark_mode')} 
                                isOn={settings.darkMode} 
                                onToggle={() => toggleSetting('darkMode')} 
                             />
                             <SettingsRow icon={<Globe />} label={t('language')} subtext={language.nativeName} onClick={() => setSettingsPage('LANGUAGE')} />
                        </SettingsGroup>

                        {/* 5. Support */}
                        <SettingsGroup title={t('support')}>
                             <SettingsRow icon={<HelpCircle />} label={t('help_center')} onClick={() => {}} />
                             <SettingsRow icon={<ShieldAlert />} label={t('report_problem')} onClick={() => {}} />
                             <SettingsRow icon={<FileText />} label={t('terms')} onClick={() => {}} />
                        </SettingsGroup>

                        {/* Logout Actions */}
                        <div className="space-y-2 pt-2 pb-8">
                             <button className="w-full py-3 text-[#0095f6] font-bold text-sm bg-[#1c1c1c] rounded-xl hover:bg-[#262626] transition-colors border border-gray-800">
                                 {t('add_account')}
                             </button>
                             <button 
                                onClick={() => { setShowSettings(false); onLogout(); }}
                                className="w-full py-3 text-red-500 font-bold text-sm bg-[#1c1c1c] rounded-xl hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 border border-gray-800"
                             >
                                 <LogOut className="w-4 h-4" />
                                 {t('logout')} {user.username}
                             </button>
                        </div>
                        
                        <div className="text-center pb-6">
                            <p className="text-xs text-gray-500 font-mono">NeL App v1.3.0 • 2024</p>
                        </div>
                  </>
              );
      }
  };

  const getPageTitle = () => {
      switch(settingsPage) {
          case 'MAIN': return t('settings_privacy');
          case 'PERSONAL_INFO': return t('personal_info');
          case 'SECURITY_MAIN': return t('security');
          case 'SECURITY_PASSWORD': return 'كلمة المرور';
          case 'SECURITY_FORGOT_PASSWORD': return 'استرداد الحساب';
          case 'SECURITY_ACTIVITY': return 'نشاط تسجيل الدخول';
          case 'SECURITY_EMAILS': return 'رسائل البريد الإلكتروني';
          case 'SECURITY_CHECKUP': return 'التحقق من الأمان';
          case 'DEVICES': return t('devices');
          case 'BLOCKED': return t('blocked_accounts');
          case 'CLOSE_FRIENDS': return t('close_friends');
          case 'WALLET': return t('wallet');
          case 'LANGUAGE': return t('language');
          case 'ACCOUNT_TYPE': return 'نوع الحساب';
          default: return '';
      }
  };

  return (
    <div className="h-full bg-[#0b0b0b] text-white flex flex-col relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2 z-20">
        <button 
            onClick={() => setIsIncognito(!isIncognito)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isIncognito ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-gray-800/50 text-gray-400 border border-transparent'}`}
        >
             {isIncognito ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             <span className="text-xs font-bold">{isIncognito ? 'خفي' : 'علني'}</span>
        </button>

        <div className="flex items-center gap-4">
            <button className="relative">
                <Bell className="w-6 h-6 text-white" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></span>
            </button>
            <Menu className="w-6 h-6 cursor-pointer text-white" onClick={() => { setSettingsPage('MAIN'); setShowSettings(true); }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* --- PROFILE CARD --- */}
        <div className="flex flex-col items-center pt-4 pb-6 px-6">
            <div className="relative mb-4 group cursor-pointer" onClick={() => setShowMoodSelector(!showMoodSelector)}>
                <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${getRingColor()} blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-spin-slow`}></div>
                <div className="relative w-28 h-28 rounded-full p-[3px] bg-[#0b0b0b]">
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-[#1c1c1c]" />
                </div>
                <div className="absolute bottom-1 right-0 bg-[#1c1c1c] text-xl border-2 border-[#0b0b0b] rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                    {currentMood.icon}
                </div>
            </div>

            <div className="text-center relative mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                    <button onClick={() => setShowMoodSelector(!showMoodSelector)} className="bg-gray-800/50 px-2 py-0.5 rounded-md text-[10px] text-gray-300 border border-gray-700">
                        {currentMood.label}
                    </button>
                </div>
                <p className="text-gray-500 text-sm font-medium">@{user.username}</p>

                {showMoodSelector && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1c1c1c] border border-gray-800 rounded-xl p-2 shadow-xl z-30 w-48 animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 gap-1">
                            {MOODS.map(m => (
                                <button 
                                    key={m.id}
                                    onClick={() => { setCurrentMood(m); setShowMoodSelector(false); }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${currentMood.id === m.id ? 'bg-[#0095f6]/20 text-[#0095f6]' : 'hover:bg-white/5 text-gray-300'}`}
                                >
                                    <span>{m.icon}</span>
                                    <span>{m.label}</span>
                                    {currentMood.id === m.id && <Check className="w-3 h-3 mr-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex w-full justify-between items-center max-w-sm mb-8 bg-[#161616] p-4 rounded-2xl border border-gray-800/50">
                <div className="flex flex-col items-center flex-1 cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-colors">
                    <span className="text-xl font-black text-white">{user.followers > 1000 ? (user.followers/1000).toFixed(1)+'k' : user.followers}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('followers')}</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-800"></div>
                <div className="flex flex-col items-center flex-1 cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-colors">
                    <span className="text-xl font-black text-white">{user.following}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('following')}</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-800"></div>
                <div className="flex flex-col items-center flex-1 cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-colors">
                    <span className="text-xl font-black text-white">{user.postsCount}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('content')}</span>
                </div>
            </div>

            <div className="w-full max-w-sm mb-6 text-center">
                 <p className="text-sm text-gray-300 leading-relaxed mb-3">
                     {user.bio || 'محب للسفر والتصوير 📸 | أصنع المحتوى بشغف ✨'}
                 </p>
                 <div className="flex flex-wrap justify-center gap-2">
                     {['سفر', 'تصوير', 'تكنولوجيا', 'قهوة'].map(tag => (
                         <span key={tag} className="bg-gray-800/60 text-gray-400 text-[10px] px-2 py-1 rounded-md border border-gray-700">#{tag}</span>
                     ))}
                 </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm mb-8">
                <button 
                    onClick={() => { setEditForm(user); setShowEditProfile(true); }}
                    className="flex-1 bg-[#0095f6] text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform"
                >
                    {t('edit_profile')}
                </button>
                <button 
                    onClick={() => { setSettingsPage('MAIN'); setShowSettings(true); }}
                    className="bg-[#1c1c1c] text-white px-3.5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* --- TABS & CONTENT --- */}
        <div className="bg-[#0b0b0b] min-h-[500px] rounded-t-3xl border-t border-gray-900 relative">
             <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-md flex justify-around p-2 mb-2 border-b border-gray-800/50">
                 {[
                     { id: 'all', icon: Grid, label: 'الكل' },
                     { id: 'video', icon: Video, label: 'فيديو' },
                     { id: 'image', icon: ImageIcon, label: 'صور' },
                     { id: 'text', icon: FileText, label: 'خواطر' }
                 ].map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                         <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'fill-current' : ''}`} />
                     </button>
                 ))}
             </div>
             
             {renderSmartGrid()}
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {showEditProfile && (
          <div className="absolute inset-0 bg-black z-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#262626]">
                  <button onClick={() => setShowEditProfile(false)} className="text-white"><X className="w-6 h-6" /></button>
                  <h2 className="font-bold text-lg">{t('edit_profile')}</h2>
                  <button onClick={handleSaveProfile} className="text-[#0095f6] font-bold"><Check className="w-6 h-6" /></button>
              </div>
              
              <div className="flex flex-col items-center py-6">
                   <div className="w-24 h-24 rounded-full overflow-hidden mb-3 opacity-80 border border-gray-700 relative group">
                        <img src={editForm.avatar} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="w-6 h-6 text-white" />
                        </div>
                   </div>
                   <div className="flex gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[#0095f6] font-bold text-sm hover:text-[#0085dd] transition-colors bg-blue-500/10 px-4 py-2 rounded-full"
                        >
                            تغيير الصورة
                        </button>
                   </div>
              </div>

              <div className="px-4 space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs text-gray-400">الاسم</label>
                      <input 
                         type="text" 
                         value={editForm.name} 
                         onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors text-white"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-400">اسم المستخدم</label>
                      <input 
                         type="text" 
                         value={editForm.username} 
                         onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors text-white"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-400">النبذة (Bio)</label>
                      <textarea 
                         value={editForm.bio} 
                         onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors resize-none h-20 text-white"
                      />
                  </div>
              </div>
          </div>
      )}

      {/* --- SETTINGS SHEET (NAVIGATIONAL) --- */}
      {showSettings && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSettings(false)}></div>
               <div className="bg-[#121212] w-full rounded-t-3xl h-[85vh] animate-in slide-in-from-bottom duration-300 relative z-10 flex flex-col border-t border-gray-800 shadow-2xl">
                    
                    {/* Settings Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        {settingsPage !== 'MAIN' ? (
                            <button onClick={() => {
                                // Logic to handle back navigation correctly
                                if (settingsPage.startsWith('SECURITY_') && settingsPage !== 'SECURITY_MAIN') {
                                    if(settingsPage === 'SECURITY_FORGOT_PASSWORD' && forgotStep !== 'METHOD') {
                                        setForgotStep('METHOD'); // Go back to method selection if inside flow
                                    } else {
                                        setSettingsPage('SECURITY_MAIN');
                                    }
                                } else {
                                    setSettingsPage('MAIN');
                                }
                            }} className="p-2 -ml-2 text-white hover:bg-gray-800 rounded-full">
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </button>
                        ) : (
                            <div className="w-8"></div>
                        )}
                        
                        <div className="w-12 h-1 bg-gray-600 rounded-full absolute left-1/2 -translate-x-1/2 top-3"></div>
                        <h2 className="font-bold text-white text-lg mt-2">{getPageTitle()}</h2>
                        
                        <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors mt-2">
                             <X className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>

                    {/* Settings Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {renderSettingsContent()}
                    </div>
               </div>
          </div>
      )}

    </div>
  );
};

const MoreHorizontalIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);

export default ProfileView;