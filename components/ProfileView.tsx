import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Menu, Grid, Video, Image as ImageIcon, FileText, Star,
  ChevronDown, Link as LinkIcon, X, Check,
  Lock, Bell, ShieldAlert, LogOut, Users, Heart, EyeOff, Eye, Zap, Smile, Music, Briefcase, Camera,
  UserCog, Smartphone, Key, Globe, Moon, HelpCircle, MessageCircle, Ban, BellRing, ShieldCheck, History,
  Fingerprint, Ghost, Download, FileJson, AlertTriangle, CreditCard, ArrowRight, ArrowLeft, Mail, Calendar, MapPin, Laptop, Trash2, Search, Edit2, Shield, CheckCircle, Smartphone as PhoneIcon, AtSign, Plus, RefreshCw, ChevronRight, Info, ChevronUp, Share2, Bookmark, PlayCircle
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../constants';

// --- CONSTANTS ---
const ANONYMOUS_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

// --- DUMMY DATA ---
const MY_CONTENT = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/400/${i % 3 === 0 ? '600' : '400'}?random=${i + 100}`,
  type: i % 4 === 0 ? 'video' : i % 2 === 0 ? 'image' : 'text',
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
        <h3 className="text-xs font-bold text-gray-500 px-4 mb-2 uppercase tracking-wider mt-4">{title}</h3>
        <div className="space-y-1">
            {children}
        </div>
        <div className="h-px bg-gray-900 my-2 mx-4"></div>
    </div>
);

const SettingsToggle = ({ icon, label, subtext, isOn, onToggle }: any) => (
    <div className="flex items-center justify-between p-3 px-4 hover:bg-[#1c1c1c] transition-colors cursor-pointer" onClick={onToggle}>
         <div className="flex items-center gap-3">
             <div className="text-white">
                 {React.cloneElement(icon, { className: "w-6 h-6" })}
             </div>
             <div className="flex flex-col items-start">
                 <span className="text-base font-normal text-white">{label}</span>
                 {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
             </div>
         </div>
         <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-[#0095f6]' : 'bg-gray-600'}`}>
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isOn ? '-translate-x-5' : 'translate-x-0'}`}></div>
         </div>
    </div>
);

const SettingsRow = ({ icon, label, subtext, isDestructive, onClick, rightElement, isBlue }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 px-4 hover:bg-[#1c1c1c] transition-colors group text-right active:bg-gray-800">
        <div className="flex items-center gap-3">
            <div className={`transition-colors ${isDestructive ? 'text-red-500' : isBlue ? 'text-[#0095f6]' : 'text-white'}`}>
                {React.cloneElement(icon, { className: `w-6 h-6` })}
            </div>
            <div className="flex flex-col items-start text-start">
                <span className={`text-base font-normal ${isDestructive ? 'text-red-500' : isBlue ? 'text-[#0095f6]' : 'text-white'}`}>{label}</span>
                {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
            </div>
        </div>
        {rightElement ? rightElement : <ChevronDown className="w-5 h-5 rotate-90 text-gray-500 group-hover:text-gray-300 transition-colors ltr:rotate-[-90deg]" />}
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
  | 'ADD_PROFESSIONAL'
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
  | 'HELP'
  | 'REPORT'
  | 'TERMS'
  | 'DELETE_ACCOUNT';

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

  useEffect(() => {
      if (currentUser) {
          setUser(currentUser);
      }
  }, [currentUser]);

  // Tabs updated to: Videos, Highlights, Saved
  const [activeTab, setActiveTab] = useState<'my_videos' | 'highlights' | 'saved_videos'>('my_videos');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState<SettingsPage>('MAIN');
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
  const [emailTab, setEmailTab] = useState<'security' | 'other'>('security');

  // Forgot Password / Delete Account Flow State
  const [forgotStep, setForgotStep] = useState<'METHOD' | 'INPUT' | 'OTP' | 'NEW_PASS' | 'SUCCESS'>('METHOD');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Delete Account Specific States
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteType, setDeleteType] = useState<'DISABLE' | 'DELETE'>('DISABLE'); 
  const [deleteVerifyStep, setDeleteVerifyStep] = useState<'SELECT_METHOD' | 'VERIFY'>('SELECT_METHOD');
  const [deleteVerifyMethod, setDeleteVerifyMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [deletePassword, setDeletePassword] = useState('');

  // Report Problem State
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Add Professional Account State
  const [profCategory, setProfCategory] = useState('');
  const [profLoading, setProfLoading] = useState(false);

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

  const handleRemovePhoto = () => {
      setEditForm(prev => ({ ...prev, avatar: ANONYMOUS_AVATAR }));
  };

  const openEditModal = (field: 'email' | 'phone' | 'dob') => {
      setEditingField(field);
      if (field === 'email') setTempValue(user.email || '');
      else if (field === 'phone') setTempValue(user.phone || '');
      else if (field === 'dob') setTempValue(user.dob || '');
  };

  const renderSmartGrid = () => {
      // Filter logic based on the new tabs
      let items = [];
      
      if (activeTab === 'my_videos') {
          // Show "Video" types as user's main videos
          items = MY_CONTENT.filter(item => item.type === 'video');
      } else if (activeTab === 'highlights') {
          // Mock highlights (using images for now)
          items = MY_CONTENT.filter(item => item.type === 'image');
      } else if (activeTab === 'saved_videos') {
          // Mock saved videos (mix of text and some video)
          items = MY_CONTENT.filter((_, i) => i % 2 === 0);
      }

      if (items.length === 0) {
          return (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
                      {activeTab === 'my_videos' && <Video className="w-8 h-8" />}
                      {activeTab === 'highlights' && <Star className="w-8 h-8" />}
                      {activeTab === 'saved_videos' && <Bookmark className="w-8 h-8" />}
                  </div>
                  <p className="font-bold">لا يوجد محتوى لعرضه</p>
              </div>
          );
      }

      return (
          <div className="grid grid-cols-3 gap-1 px-1 pb-24 auto-rows-[120px]">
              {items.map((item, index) => {
                  // Smart Layout Logic
                  const isLarge = index % 10 === 0;
                  const isWide = index % 5 === 0 && !isLarge;
                  
                  return (
                    <div 
                        key={item.id} 
                        className={`relative bg-gray-900 overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity group 
                        ${isLarge ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : 'col-span-1'}
                        `}
                    >
                        {item.type === 'text' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black p-4 text-center">
                                <p className="text-white text-xs font-bold leading-relaxed line-clamp-4">"أفكار اليوم: الهدوء هو مفتاح الإبداع ✨"</p>
                            </div>
                        ) : (
                            <>
                                <img src={item.url} className="w-full h-full object-cover" />
                                {item.type === 'video' && <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><Video className="w-3 h-3 text-white" /></div>}
                            </>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Heart className="w-4 h-4 text-white fill-white" /> <span className="text-white text-xs font-bold">{Math.floor(item.views / 100)}</span>
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
      if (value !== '' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) otpRefs.current[index - 1]?.focus();
  };

  // --- SUB-SCREENS ---

  const renderPersonalInfo = () => (
      <div className="space-y-4 pt-4">
          <div className="px-4 pb-4">
            <h3 className="font-bold text-lg text-white mb-2">تفاصيل الاتصال</h3>
            <p className="text-sm text-gray-400">تستخدم هذه المعلومات للتحقق من هويتك وتأمين حسابك. لن تظهر للعامة.</p>
          </div>
          
          <SettingsGroup title="معلومات التواصل">
              <SettingsRow 
                 icon={<Mail />} 
                 label="البريد الإلكتروني" 
                 subtext={user.email} 
                 onClick={() => openEditModal('email')} 
              />
              <SettingsRow 
                 icon={<PhoneIcon />} 
                 label="رقم الهاتف" 
                 subtext={user.phone || 'غير مضاف'} 
                 onClick={() => openEditModal('phone')} 
              />
          </SettingsGroup>
      </div>
  );

  const renderForgotPassword = () => {
      if (forgotStep === 'METHOD') {
          return (
              <div className="p-4 space-y-4 animate-in slide-in-from-right">
                  <h3 className="text-xl font-bold text-white mb-2">استعادة كلمة المرور</h3>
                  <p className="text-gray-400 text-sm mb-6">اختر وسيلة لاستلام رمز التحقق</p>
                  
                  <button onClick={() => { setRecoveryMethod('email'); setForgotStep('INPUT'); }} className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 hover:border-gray-500 transition-colors">
                      <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="text-right">
                              <span className="block text-sm font-bold text-white">البريد الإلكتروني</span>
                              <span className="text-xs text-gray-500">{user.email || 'user@example.com'}</span>
                          </div>
                      </div>
                      <ChevronRight className="w-5 h-5 rtl:rotate-180 text-gray-500" />
                  </button>

                  <button onClick={() => { setRecoveryMethod('phone'); setForgotStep('INPUT'); }} className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 hover:border-gray-500 transition-colors">
                       <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                          <div className="text-right">
                              <span className="block text-sm font-bold text-white">رقم الهاتف</span>
                              <span className="text-xs text-gray-500">{user.phone || '+966...'}</span>
                          </div>
                      </div>
                      <ChevronRight className="w-5 h-5 rtl:rotate-180 text-gray-500" />
                  </button>
              </div>
          );
      }
      
      if (forgotStep === 'INPUT') {
           return (
              <div className="p-4 space-y-6 animate-in slide-in-from-right">
                  <h3 className="text-xl font-bold text-white">تأكيد {recoveryMethod === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}</h3>
                  <input 
                    type={recoveryMethod === 'email' ? 'email' : 'tel'} 
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder={recoveryMethod === 'email' ? 'user@example.com' : '+966...'}
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-white transition-colors"
                  />
                  <button onClick={() => setForgotStep('OTP')} className="w-full bg-[#0095f6] text-white py-3 rounded-xl font-bold">إرسال الرمز</button>
              </div>
           );
      }

      if (forgotStep === 'OTP') {
           return (
               <div className="p-4 space-y-6 animate-in slide-in-from-right">
                    <h3 className="text-xl font-bold text-white text-center">أدخل رمز التحقق</h3>
                    <p className="text-sm text-gray-400 text-center mb-4">تم إرسال الرمز إلى {tempValue || user.email}</p>
                    <div className="flex justify-between gap-2 dir-ltr">
                        {otpCode.map((digit, i) => (
                              <input
                                  key={i}
                                  ref={el => { otpRefs.current[i] = el; }}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  className="w-12 h-14 bg-[#1c1c1c] border border-gray-700 rounded-lg text-center text-2xl font-bold text-white focus:border-[#0095f6] outline-none"
                              />
                          ))}
                    </div>
                    <button onClick={() => setForgotStep('NEW_PASS')} className="w-full bg-[#0095f6] text-white py-3 rounded-xl font-bold">تحقق</button>
               </div>
           );
      }

      if (forgotStep === 'NEW_PASS') {
           return (
               <div className="p-4 space-y-6 animate-in slide-in-from-right">
                   <h3 className="text-xl font-bold text-white">كلمة المرور الجديدة</h3>
                   <input type="password" placeholder="كلمة المرور الجديدة" className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white outline-none" />
                   <input type="password" placeholder="تأكيد كلمة المرور" className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white outline-none" />
                   <button onClick={() => setForgotStep('SUCCESS')} className="w-full bg-[#0095f6] text-white py-3 rounded-xl font-bold">تغيير كلمة المرور</button>
               </div>
           );
      }

      return (
           <div className="p-4 flex flex-col items-center justify-center h-[50vh] animate-in slide-in-from-bottom">
               <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle className="w-10 h-10 text-green-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">تم بنجاح!</h3>
               <p className="text-gray-400 text-sm mb-8">تم تغيير كلمة المرور الخاصة بك.</p>
               <button onClick={() => setSettingsPage('MAIN')} className="w-full bg-[#1c1c1c] text-white py-3 rounded-xl font-bold">العودة للإعدادات</button>
           </div>
      );
  };

  const renderAddProfessionalAccount = () => (
      <div className="p-4 space-y-6 animate-in slide-in-from-right h-full flex flex-col">
          <div className="text-center mb-6">
               <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Briefcase className="w-10 h-10 text-blue-500" />
               </div>
               <h3 className="text-2xl font-bold text-white">حساب احترافي</h3>
               <p className="text-gray-400 text-sm mt-2">احصل على أدوات وتحليلات إضافية للوصول لجمهورك.</p>
          </div>
          
          <div className="space-y-4">
              <label className="text-sm font-bold text-gray-300 block">اختر فئة</label>
              <div className="grid grid-cols-2 gap-3">
                  {['فنان', 'مدون', 'تعليم', 'صحة', 'موسيقي', 'مصور'].map(cat => (
                      <button 
                          key={cat}
                          onClick={() => setProfCategory(cat)}
                          className={`p-3 rounded-xl text-sm font-medium border transition-colors ${profCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#1c1c1c] border-gray-700 text-gray-300'}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1"></div>

          <button 
              disabled={!profCategory || profLoading}
              onClick={() => {
                  setProfLoading(true);
                  setTimeout(() => {
                      setProfLoading(false);
                      setAccountType('professional');
                      setSettingsPage('MAIN');
                  }, 1500);
              }}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${!profCategory ? 'bg-gray-800 text-gray-500' : 'bg-[#0095f6]'}`}
          >
              {profLoading ? 'جاري التحويل...' : 'تحويل إلى حساب احترافي'}
          </button>
      </div>
  );

  const renderDeleteAccount = () => {
    if (deleteVerifyStep === 'SELECT_METHOD') {
        return (
            <div className="p-4 space-y-6 animate-in slide-in-from-right">
                <div className="text-center mb-6">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">{deleteType === 'DISABLE' ? 'تعطيل الحساب مؤقتاً' : 'حذف الحساب نهائياً'}</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        {deleteType === 'DISABLE' 
                            ? 'سيتم إخفاء ملفك الشخصي وصورك وتعليقاتك حتى تعيد تفعيل الحساب عن طريق تسجيل الدخول مرة أخرى.' 
                            : 'سيتم حذف كل بياناتك نهائياً ولن تتمكن من استعادتها.'}
                    </p>
                </div>

                <div className="space-y-4">
                     <label className="text-sm font-bold text-gray-300 block">لماذا تريد {deleteType === 'DISABLE' ? 'تعطيل' : 'حذف'} حسابك؟</label>
                     <select 
                        className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-3 text-white outline-none"
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                     >
                         <option value="">اختر سبباً...</option>
                         <option value="break">أحتاج لاستراحة</option>
                         <option value="privacy">مخاوف بشأن الخصوصية</option>
                         <option value="trouble">مشكلة في استخدام التطبيق</option>
                         <option value="other">شيء آخر</option>
                     </select>
                </div>

                {deleteReason && (
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <p className="text-sm font-bold text-white mb-2">للأمان، يرجى تأكيد هويتك:</p>
                        
                        <button 
                            onClick={() => { setDeleteVerifyMethod('PASSWORD'); setDeleteVerifyStep('VERIFY'); }}
                            className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-bold">استخدام كلمة المرور</span>
                            </div>
                            <ChevronDown className="w-5 h-5 rotate-[-90deg] text-gray-500" />
                        </button>

                        <button 
                            onClick={() => { setDeleteVerifyMethod('OTP'); setDeleteVerifyStep('VERIFY'); }}
                            className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-bold">إرسال رمز (OTP)</span>
                            </div>
                            <ChevronDown className="w-5 h-5 rotate-[-90deg] text-gray-500" />
                        </button>
                    </div>
                )}
            </div>
        );
    } else {
        // VERIFY STEP
        return (
            <div className="p-6 flex flex-col h-full animate-in slide-in-from-right">
                <h3 className="text-xl font-bold text-white mb-6 text-center">تأكيد الهوية</h3>
                
                {deleteVerifyMethod === 'PASSWORD' ? (
                    <div className="space-y-4 mb-8">
                        <p className="text-sm text-gray-400">أدخل كلمة المرور للمتابعة.</p>
                        <input 
                            type="password" 
                            placeholder="كلمة المرور"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                ) : (
                    <div className="space-y-4 mb-8">
                        <p className="text-sm text-gray-400 text-center">أدخل الرمز الذي أرسلناه إلى {user.email || user.phone}</p>
                        <div className="flex justify-between gap-2 dir-ltr">
                             {otpCode.map((digit, i) => (
                                  <input
                                      key={i}
                                      ref={el => { otpRefs.current[i] = el; }}
                                      type="text"
                                      maxLength={1}
                                      value={digit}
                                      onChange={(e) => handleOtpChange(i, e.target.value)}
                                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                      className="w-12 h-14 bg-[#1c1c1c] border border-gray-700 rounded-lg text-center text-2xl font-bold text-white focus:border-red-500 outline-none"
                                  />
                              ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={() => { setShowSettings(false); onLogout(); }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 mb-3"
                >
                    {deleteType === 'DISABLE' ? 'تعطيل الحساب' : 'حذف الحساب'}
                </button>
                <button onClick={() => setDeleteVerifyStep('SELECT_METHOD')} className="text-gray-400 text-sm font-bold">إلغاء</button>
            </div>
        );
    }
  };

  const renderHelpCenter = () => (
      <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-800">
               <div className="bg-[#1c1c1c] rounded-xl flex items-center px-3 py-2 gap-2 border border-gray-800">
                   <Search className="w-4 h-4 text-gray-500" />
                   <input type="text" placeholder="كيف يمكننا مساعدتك؟" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" />
               </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="font-bold text-white mb-2">مواضيع شائعة</h3>
              {['كيفية استعادة الحساب', 'مشاكل تسجيل الدخول', 'إدارة الحساب', 'الخصوصية والأمان', 'الإبلاغ عن محتوى'].map((topic, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-gray-800 hover:bg-gray-800 transition-colors text-right">
                      <span className="text-sm text-white">{topic}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 rtl:rotate-180" />
                  </button>
              ))}
          </div>
      </div>
  );

  const renderReportProblem = () => (
      <div className="p-4 h-full flex flex-col animate-in slide-in-from-right">
          {reportSent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">شكراً لك!</h3>
                  <p className="text-gray-400 text-sm mt-2 mb-8">ساعدتنا ملاحظاتك في تحسين NeL للجميع.</p>
                  <button onClick={() => setSettingsPage('MAIN')} className="bg-[#1c1c1c] px-8 py-3 rounded-xl text-white font-bold">العودة للإعدادات</button>
              </div>
          ) : (
              <>
                  <h3 className="text-lg font-bold text-white mb-2">الإبلاغ عن مشكلة</h3>
                  <p className="text-sm text-gray-400 mb-4">يرجى وصف المشكلة باختصار وإرفاق التفاصيل إذا أمكن.</p>
                  <textarea 
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="ما الذي لا يعمل؟" 
                      className="w-full h-40 bg-[#1c1c1c] border border-gray-800 rounded-xl p-4 text-white text-sm outline-none resize-none mb-4 focus:border-white"
                  />
                  <button 
                      disabled={!reportText.trim()}
                      onClick={() => { setReportSent(true); setTimeout(() => { setSettingsPage('MAIN'); setReportSent(false); setReportText(''); }, 3000); }}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all ${reportText.trim() ? 'bg-[#0095f6]' : 'bg-gray-800 text-gray-500'}`}
                  >
                      إرسال بلاغ
                  </button>
              </>
          )}
      </div>
  );

  const renderTerms = () => (
      <div className="p-4 h-full overflow-y-auto">
          <h1 className="text-2xl font-bold text-white mb-4">شروط الاستخدام</h1>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>مرحباً بك في NeL. تحكم شروط الاستخدام هذه استخدامك لتطبيقنا.</p>
              <h3 className="font-bold text-white">1. قبول الشروط</h3>
              <p>بإنشاء حساب أو استخدام التطبيق، فإنك توافق على الالتزام بهذه الشروط.</p>
              <h3 className="font-bold text-white">2. الخصوصية</h3>
              <p>خصوصيتك مهمة بالنسبة لنا. يرجى قراءة سياسة الخصوصية لمعرفة كيفية جمعنا لبياناتك واستخدامها.</p>
              <h3 className="font-bold text-white">3. سلوك المستخدم</h3>
              <p>يجب عليك عدم استخدام الخدمة لأي غرض غير قانوني أو غير مصرح به. أنت المسؤول الوحيد عن سلوكك وأي بيانات ترسلها.</p>
              <div className="h-20"></div>
          </div>
      </div>
  );

  const renderSettingsContent = () => {
      switch (settingsPage) {
          case 'PERSONAL_INFO': return renderPersonalInfo();
          case 'SECURITY_MAIN': return renderSecurityMain();
          case 'SECURITY_PASSWORD': return null; // Simplified for now
          case 'SECURITY_FORGOT_PASSWORD': return renderForgotPassword();
          case 'SECURITY_ACTIVITY': return null;
          case 'SECURITY_EMAILS': return renderSecurityEmails();
          case 'SECURITY_CHECKUP': return renderSecurityCheckup();
          case 'DEVICES': return renderDevicesMain();
          case 'BLOCKED': return renderBlocked();
          case 'CLOSE_FRIENDS': return renderCloseFriends();
          case 'WALLET': return renderWallet();
          case 'LANGUAGE': return renderLanguageSelection();
          case 'ACCOUNT_TYPE': return renderAccountType();
          
          // NEW PAGES
          case 'ADD_PROFESSIONAL': return renderAddProfessionalAccount();
          case 'DELETE_ACCOUNT': return renderDeleteAccount();
          case 'HELP': return renderHelpCenter();
          case 'REPORT': return renderReportProblem();
          case 'TERMS': return renderTerms();

          default:
              return (
                  <>
                        <div className="bg-[#1c1c1c] rounded-xl flex items-center px-3 py-2.5 gap-2 border border-gray-800 sticky top-0 z-20 shadow-lg mb-6">
                             <div className="w-5 h-5 text-gray-500"><Settings className="w-5 h-5" /></div>
                             <input type="text" placeholder={t('search_settings')} className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" />
                        </div>

                        <SettingsGroup title={t('account')}>
                            <SettingsRow icon={<UserCog />} label={t('personal_info')} subtext="البريد الإلكتروني، رقم الهاتف" onClick={() => setSettingsPage('PERSONAL_INFO')} />
                            <SettingsRow icon={<ShieldCheck />} label={t('security')} subtext="كلمة المرور، الأمان" onClick={() => setSettingsPage('SECURITY_MAIN')} />
                            <SettingsRow icon={<Briefcase />} label={t('account_type')} subtext={accountType === 'personal' ? 'شخصي' : 'احترافي'} onClick={() => setSettingsPage('ACCOUNT_TYPE')} />
                            <SettingsRow 
                                icon={<AlertTriangle />} 
                                label={t('delete_account')} 
                                isDestructive 
                                onClick={() => { setDeleteType('DISABLE'); setDeleteVerifyStep('SELECT_METHOD'); setSettingsPage('DELETE_ACCOUNT'); }} 
                            />
                        </SettingsGroup>

                        <SettingsGroup title={t('privacy')}>
                             <SettingsToggle icon={<Lock />} label={t('private_account')} isOn={settings.privateAccount} onToggle={() => toggleSetting('privateAccount')} />
                             <SettingsRow icon={<Ban />} label={t('blocked_accounts')} onClick={() => setSettingsPage('BLOCKED')} />
                        </SettingsGroup>

                        <SettingsGroup title={t('support')}>
                             <SettingsRow icon={<HelpCircle />} label={t('help_center')} onClick={() => setSettingsPage('HELP')} />
                             <SettingsRow icon={<ShieldAlert />} label={t('report_problem')} onClick={() => setSettingsPage('REPORT')} />
                        </SettingsGroup>

                        <div className="space-y-1 pt-6 pb-12 px-2">
                             <h3 className="text-xs font-bold text-gray-500 px-2 mb-2 uppercase tracking-wider">تسجيل الدخول</h3>
                             <SettingsRow 
                                icon={<Plus />} 
                                label={t('add_account')} 
                                isBlue
                                onClick={() => { setShowSettings(false); onLogout(); }} 
                                rightElement={null}
                             />
                             <SettingsRow 
                                icon={<LogOut />} 
                                label={`${t('logout')} ${user.username}`} 
                                isDestructive
                                onClick={() => setShowLogoutModal(true)} 
                                rightElement={null}
                             />
                        </div>
                        
                        <div className="text-center pb-6">
                            <p className="text-xs text-gray-500 font-mono">NeL App v1.4.1</p>
                        </div>
                  </>
              );
      }
  };

  const renderSecurityMain = () => ( <div className="p-4 text-white">Security Main (Placeholder)</div> );
  const renderSecurityEmails = () => <div className="p-4 text-white">البريد الأمني</div>; 
  const renderSecurityCheckup = () => <div className="p-4 text-white"><CheckCircle className="mx-auto w-12 h-12 text-green-500 mb-4" />حسابك آمن</div>;
  const renderDevicesMain = () => <div className="p-4 text-white">قائمة الأجهزة</div>;
  const renderBlocked = () => <div className="p-4 text-white">المستخدمون المحظورون</div>;
  const renderCloseFriends = () => <div className="p-4 text-white">قائمة الأصدقاء المقربين</div>;
  const renderWallet = () => <div className="p-4 text-white">المحفظة والرصيد</div>;
  const renderLanguageSelection = () => <div className="p-4 text-white">قائمة اللغات</div>;
  const renderAccountType = () => <div className="p-4 text-white">نوع الحساب</div>;

  const getPageTitle = () => {
      switch(settingsPage) {
          case 'MAIN': return t('settings_privacy');
          case 'PERSONAL_INFO': return t('personal_info');
          case 'ADD_PROFESSIONAL': return 'حساب احترافي';
          case 'DELETE_ACCOUNT': return 'تعطيل أو حذف';
          case 'HELP': return t('help_center');
          case 'REPORT': return t('report_problem');
          case 'TERMS': return t('terms');
          default: return '';
      }
  };

  return (
    <div className="h-full bg-[#0b0b0b] text-white flex flex-col relative overflow-y-auto no-scrollbar">
      
      {/* 1. FLUID HEADER */}
      <div className="relative w-full h-[280px] overflow-hidden flex flex-col items-center justify-end shrink-0 pb-2">
          {/* Blurred Dynamic Background */}
          <div className="absolute inset-0 z-0">
              <img src={user.avatar} className="w-full h-full object-cover blur-[50px] opacity-40 scale-110" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0b]/60 to-[#0b0b0b]"></div>
          </div>

          {/* Top Actions */}
          <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-4 z-20">
              <button 
                  onClick={() => setIsIncognito(!isIncognito)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${isIncognito ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/10 text-white border-white/20'}`}
              >
                   {isIncognito ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                   <span className="text-[10px] font-bold">{isIncognito ? 'خفي' : 'مرئي'}</span>
              </button>
              <div className="flex gap-3">
                  <button className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                      <Share2 className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => { setSettingsPage('MAIN'); setShowSettings(true); }} className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                      <Menu className="w-5 h-5 text-white" />
                  </button>
              </div>
          </div>

          {/* Avatar Container */}
          <div className="relative z-10 mb-2 group cursor-pointer" onClick={() => { setEditForm(user); setShowEditProfile(true); }}>
              <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 animate-pulse-slow shadow-2xl">
                  <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-6 h-6 text-white" />
                  </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#1c1c1c] rounded-full p-1.5 border border-gray-700 shadow-lg text-sm">
                  {currentMood.icon}
              </div>
          </div>

          {/* Name & Bio */}
          <div className="relative z-10 text-center px-8 w-full">
              <h1 className="text-xl font-bold text-white tracking-wide">{user.name}</h1>
              <p className="text-gray-400 text-xs font-mono mb-2">@{user.username}</p>
              
              <div 
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className={`text-sm text-gray-300 transition-all duration-300 cursor-pointer ${isBioExpanded ? '' : 'line-clamp-1 opacity-80'}`}
              >
                  {user.bio || "مرحبًا بك في ملفي الشخصي 👋"}
                  {!isBioExpanded && <span className="text-[10px] text-gray-500 ml-1">(المزيد)</span>}
              </div>
          </div>
      </div>

      {/* 2. BUBBLE STATS & ACTIONS */}
      <div className="flex flex-col gap-6 mt-2 z-10 relative">
          {/* Stats Bubbles (Spaced Apart) */}
          <div className="flex justify-around items-center w-full px-2">
              <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-1 group-hover:bg-[#222] group-hover:scale-110 transition-all shadow-lg">
                      <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">{user.postsCount}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">منشور</span>
              </div>
              
              <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-1 group-hover:bg-[#222] group-hover:scale-110 transition-all shadow-xl shadow-blue-900/10">
                      <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-purple-400">{user.followers}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">متابع</span>
              </div>

              <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-gray-800 flex items-center justify-center mb-1 group-hover:bg-[#222] group-hover:scale-110 transition-all shadow-lg">
                      <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">{user.following}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">يتابع</span>
              </div>
          </div>

          {/* Action Capsules */}
          <div className="flex gap-3 w-full px-4">
              <button onClick={() => { setEditForm(user); setShowEditProfile(true); }} className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-white py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors shadow-lg">
                  تعديل الملف
              </button>
              <button className="px-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors">
                  <MessageCircle className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* 3. CONTENT TABS & GRID */}
      <div className="flex-1 flex flex-col mt-6 bg-[#0b0b0b] rounded-t-[30px] border-t border-gray-900 relative">
           <div className="flex justify-around items-center p-2 border-b border-gray-900 sticky top-0 bg-[#0b0b0b]/95 z-20 backdrop-blur-md rounded-t-[30px]">
               {/* 1. My Videos */}
               <button 
                  onClick={() => setActiveTab('my_videos')}
                  className={`relative px-4 py-3 flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === 'my_videos' ? 'text-white' : 'text-gray-500'}`}
               >
                   <Video className="w-5 h-5" />
                   {activeTab === 'my_videos' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0095f6] rounded-full shadow-[0_0_10px_#0095f6]"></div>}
               </button>

               {/* 2. Highlights (Saved Stories) */}
               <button 
                  onClick={() => setActiveTab('highlights')}
                  className={`relative px-4 py-3 flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === 'highlights' ? 'text-white' : 'text-gray-500'}`}
               >
                   <Star className="w-5 h-5" />
                   {activeTab === 'highlights' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0095f6] rounded-full shadow-[0_0_10px_#0095f6]"></div>}
               </button>

               {/* 3. Saved Videos */}
               <button 
                  onClick={() => setActiveTab('saved_videos')}
                  className={`relative px-4 py-3 flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === 'saved_videos' ? 'text-white' : 'text-gray-500'}`}
               >
                   <Bookmark className="w-5 h-5" />
                   {activeTab === 'saved_videos' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0095f6] rounded-full shadow-[0_0_10px_#0095f6]"></div>}
               </button>
           </div>
           
           <div className="min-h-[500px] p-1">
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
              <div className="p-4 space-y-6 overflow-y-auto">
                  
                  {/* Avatar Change Section */}
                  <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                          <img src={editForm.avatar} className="w-24 h-24 rounded-full object-cover border border-[#262626]" />
                      </div>
                      <div className="flex flex-col gap-2 items-center">
                          <button onClick={() => fileInputRef.current?.click()} className="text-[#0095f6] font-bold text-sm hover:text-[#0085dd]">
                              تغيير صورة الملف الشخصي
                          </button>
                          {editForm.avatar !== ANONYMOUS_AVATAR && (
                              <button onClick={handleRemovePhoto} className="text-red-500 font-bold text-sm hover:text-red-600">
                                  إزالة الصورة الحالية
                              </button>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      </div>
                  </div>

                  <div className="space-y-4 pt-2">
                      <div className="space-y-1"><label className="text-xs text-gray-400">الاسم</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-transparent border-b border-[#262626] py-2 outline-none text-white focus:border-white transition-colors" /></div>
                      <div className="space-y-1"><label className="text-xs text-gray-400">اسم المستخدم</label><input type="text" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="w-full bg-transparent border-b border-[#262626] py-2 outline-none text-white focus:border-white transition-colors" /></div>
                      <div className="space-y-1"><label className="text-xs text-gray-400">النبذة</label><textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-transparent border-b border-[#262626] py-2 outline-none resize-none h-20 text-white focus:border-white transition-colors" /></div>
                  </div>
              </div>
          </div>
      )}

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
          <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
              <div className="w-full bg-[#262626] rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-300 space-y-3" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-center border-b border-gray-700 pb-4 mb-2">
                      <h3 className="font-bold text-lg text-white">هل تريد تسجيل الخروج؟</h3>
                      <p className="text-xs text-gray-400 mt-1">سيتم حفظ معلومات تسجيل الدخول الخاصة بك.</p>
                  </div>
                  <button onClick={() => { setShowLogoutModal(false); setShowSettings(false); onLogout(); }} className="w-full py-3 bg-[#1c1c1c] rounded-xl text-red-500 font-bold hover:bg-red-500/10 transition-colors">تسجيل الخروج من {user.username}</button>
                  <button onClick={() => { setShowLogoutModal(false); setShowSettings(false); onLogout(); }} className="w-full py-3 bg-[#1c1c1c] rounded-xl text-white font-bold hover:bg-white/10 transition-colors">تسجيل الخروج من كل الحسابات</button>
                  <button onClick={() => setShowLogoutModal(false)} className="w-full py-3 bg-transparent rounded-xl text-white font-bold hover:bg-white/5 transition-colors">إلغاء</button>
              </div>
          </div>
      )}

      {/* --- SETTINGS SHEET --- */}
      {showSettings && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSettings(false)}></div>
               <div className="bg-[#121212] w-full rounded-t-3xl h-[90vh] animate-in slide-in-from-bottom duration-300 relative z-10 flex flex-col border-t border-gray-800 shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        {settingsPage !== 'MAIN' ? (
                            <button onClick={() => {
                                if (settingsPage.startsWith('SECURITY_') && settingsPage !== 'SECURITY_MAIN') {
                                    if(settingsPage === 'SECURITY_FORGOT_PASSWORD' && forgotStep !== 'METHOD') setForgotStep('METHOD');
                                    else setSettingsPage('SECURITY_MAIN');
                                } else if (settingsPage === 'DELETE_ACCOUNT' && deleteVerifyStep === 'VERIFY') {
                                    setDeleteVerifyStep('SELECT_METHOD');
                                } else {
                                    setSettingsPage('MAIN');
                                }
                            }} className="p-2 -ml-2 text-white hover:bg-gray-800 rounded-full"><ArrowRight className="w-6 h-6 rtl:rotate-180" /></button>
                        ) : (<div className="w-8"></div>)}
                        <h2 className="font-bold text-white text-base mt-2">{getPageTitle()}</h2>
                        <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors mt-2"><X className="w-5 h-5 text-gray-300" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pb-8">{renderSettingsContent()}</div>
               </div>
          </div>
      )}
    </div>
  );
};

export default ProfileView;