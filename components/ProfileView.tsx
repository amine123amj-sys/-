import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Menu, Video, Star, ChevronDown, X, Check,
  Lock, Bell, ShieldAlert, LogOut, Heart, EyeOff, Eye,
  UserCog, Smartphone, Key, HelpCircle, MessageCircle, Ban, 
  ShieldCheck, ArrowRight, Mail, AlertTriangle, Search, 
  Edit2, CheckCircle, Smartphone as PhoneIcon, Plus, ChevronRight, 
  Share2, Bookmark, Briefcase, Camera, Play, Disc, Music
} from 'lucide-react';
import { User, SavedSound } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- CONSTANTS ---
const ANONYMOUS_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_973460_720.png";

// --- DUMMY DATA ---
const MY_CONTENT = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/400/${i % 3 === 0 ? '600' : '400'}?random=${i + 100}`,
  type: i % 4 === 0 ? 'video' : i % 2 === 0 ? 'image' : 'text',
  views: Math.floor(Math.random() * 5000) + 500
}));

const SAVED_MUSIC: SavedSound[] = [
    { id: 'm1', name: 'Arabic Lo-Fi Night', artist: 'Hala Beats', cover: 'https://picsum.photos/200/200?random=sound1', duration: '0:30' },
    { id: 'm2', name: 'Summer Sunset', artist: 'Desert Trax', cover: 'https://picsum.photos/200/200?random=sound2', duration: '0:15' },
    { id: 'm3', name: 'Techno Pulse', artist: 'NeL DJ', cover: 'https://picsum.photos/200/200?random=sound3', duration: '1:00' },
];

// Helper Components for Settings
const SettingsGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="space-y-1">
        <h3 className="text-xs font-bold text-gray-500 px-4 mb-2 uppercase tracking-wider mt-4">{title}</h3>
        <div className="space-y-1">{children}</div>
        <div className="h-px bg-gray-900 my-2 mx-4"></div>
    </div>
);

const SettingsToggle = ({ icon, label, isOn, onToggle }: any) => (
    <div className="flex items-center justify-between p-3 px-4 hover:bg-[#1c1c1c] transition-colors cursor-pointer" onClick={onToggle}>
         <div className="flex items-center gap-3">
             <div className="text-white">{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
             <span className="text-base font-normal text-white">{label}</span>
         </div>
         <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-[#0095f6]' : 'bg-gray-600'}`}>
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isOn ? (document.dir === 'rtl' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`}></div>
         </div>
    </div>
);

const SettingsRow = ({ icon, label, subtext, isDestructive, onClick, rightElement, isBlue }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 px-4 hover:bg-[#1c1c1c] transition-colors group text-right active:bg-gray-800">
        <div className="flex items-center gap-3 text-start">
            <div className={`transition-colors ${isDestructive ? 'text-red-500' : isBlue ? 'text-[#0095f6]' : 'text-white'}`}>
                {React.cloneElement(icon, { className: `w-6 h-6` })}
            </div>
            <div className="flex flex-col items-start">
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

type SettingsPage = 'MAIN' | 'PERSONAL_INFO' | 'ACCOUNT_TYPE' | 'ADD_PROFESSIONAL' | 'DELETE_ACCOUNT' | 'HELP' | 'REPORT' | 'TERMS';

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onLogout, onUpdateProfile }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User>(currentUser || { id: '0', username: 'guest', name: 'Guest', email: '', avatar: ANONYMOUS_AVATAR, followers: 0, following: 0, postsCount: 0 });
  const [activeTab, setActiveTab] = useState<'my_videos' | 'highlights' | 'saved_music'>('my_videos');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState<SettingsPage>('MAIN');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'professional'>('personal');

  // Deactivation Flow State
  const [deleteStep, setDeleteStep] = useState<'SELECT' | 'VERIFY'>('SELECT');
  const [deleteMethod, setDeleteMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [otpCode, setOtpCode] = useState(['','','','','','']);

  // Forms
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (currentUser) setUser(currentUser); }, [currentUser]);

  const handleSaveProfile = () => { onUpdateProfile(editForm); setShowEditProfile(false); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
        reader.readAsDataURL(file);
    }
  };

  const renderSmartGrid = () => {
      if (activeTab === 'saved_music') {
          return (
              <div className="p-4 space-y-4 pb-24">
                  {SAVED_MUSIC.map(sound => (
                      <div key={sound.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-4">
                               <div className="relative w-14 h-14">
                                   <img src={sound.cover} className="w-full h-full rounded-xl object-cover shadow-lg" />
                                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <Play size={16} className="fill-white text-white" />
                                   </div>
                               </div>
                               <div>
                                   <h4 className="font-bold text-sm text-white">{sound.name}</h4>
                                   <p className="text-xs text-gray-500">{sound.artist} • {sound.duration}</p>
                               </div>
                           </div>
                           <button className="p-2.5 bg-[#0095f6]/10 rounded-full text-[#0095f6] hover:bg-[#0095f6]/20 transition-colors"><Plus size={18} /></button>
                      </div>
                  ))}
              </div>
          );
      }

      let items = [];
      if (activeTab === 'my_videos') items = MY_CONTENT.filter(item => item.type === 'video');
      else if (activeTab === 'highlights') items = MY_CONTENT.filter(item => item.type === 'image');
      
      return (
          <div className="grid grid-cols-3 gap-0.5 px-0.5 pb-24 auto-rows-[140px]">
              {items.map((item, index) => {
                  const isLarge = index % 10 === 0;
                  const isWide = index % 5 === 0 && !isLarge;
                  return (
                    <div key={item.id} className={`relative bg-gray-900 overflow-hidden cursor-pointer group ${isLarge ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : 'col-span-1'}`}>
                        <img src={item.url} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" alt="Content" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Heart className="w-4 h-4 text-white fill-white" /> <span className="text-white text-xs font-bold">{Math.floor(item.views / 100)}</span>
                        </div>
                    </div>
                  );
              })}
          </div>
      );
  };

  const renderPersonalInfo = () => (
      <div className="p-4 space-y-4 animate-in slide-in-from-right">
          <SettingsGroup title="معلومات التواصل">
              <SettingsRow icon={<Mail />} label="البريد الإلكتروني" subtext={user.email} />
              <SettingsRow icon={<PhoneIcon />} label="رقم الهاتف" subtext={user.phone || 'غير مضاف'} />
          </SettingsGroup>
      </div>
  );

  const renderDeleteAccount = () => (
      <div className="p-4 space-y-6 animate-in slide-in-from-right">
          {deleteStep === 'SELECT' ? (
              <>
                  <div className="text-center mb-6">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white">تعطيل الحساب</h3>
                      <p className="text-sm text-gray-400 mt-2">اختر وسيلة للتحقق من هويتك للمتابعة بأمان.</p>
                  </div>
                  <div className="space-y-3">
                      <button onClick={() => { setDeleteMethod('PASSWORD'); setDeleteStep('VERIFY'); }} className="w-full p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 text-right flex items-center justify-between hover:bg-gray-800 transition-colors">
                          <span className="text-sm font-bold text-white">عبر كلمة المرور</span>
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                      <button onClick={() => { setDeleteMethod('OTP'); setDeleteStep('VERIFY'); }} className="w-full p-4 bg-[#1c1c1c] rounded-xl border border-gray-700 text-right flex items-center justify-between hover:bg-gray-800 transition-colors">
                          <span className="text-sm font-bold text-white">عبر رمز تحقق (Email/Phone)</span>
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                  </div>
              </>
          ) : (
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white text-center">تأكيد الهوية</h3>
                  {deleteMethod === 'PASSWORD' ? (
                      <input type="password" placeholder="كلمة المرور" className="w-full bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-red-500 transition-all" />
                  ) : (
                      <div className="flex gap-2 dir-ltr justify-center">
                          {otpCode.map((digit, i) => (
                              <input key={i} type="text" maxLength={1} className="w-11 h-14 bg-gray-800 rounded-lg text-center text-2xl font-bold text-white focus:ring-1 focus:ring-red-500 outline-none" value={digit} onChange={(e) => {
                                  const n = [...otpCode]; n[i] = e.target.value; setOtpCode(n);
                              }} />
                          ))}
                      </div>
                  )}
                  <button onClick={() => { onLogout(); setShowSettings(false); }} className="w-full py-4 bg-red-600 rounded-2xl font-black text-white shadow-xl shadow-red-900/20 active:scale-95 transition-all">تأكيد التعطيل</button>
                  <button onClick={() => setDeleteStep('SELECT')} className="w-full text-gray-500 text-sm font-bold">تراجع</button>
              </div>
          )}
      </div>
  );

  const renderAddProfessional = () => (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in slide-in-from-right">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
              <Briefcase className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">حساب احترافي</h3>
          <p className="text-gray-400 text-sm mb-12 max-w-xs leading-relaxed">احصل على أدوات تحليل متقدمة ووسع نطاق وصولك لملايين المستخدمين.</p>
          <button onClick={() => { setAccountType('professional'); setSettingsPage('MAIN'); }} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-all">بدء التحويل الآن</button>
      </div>
  );

  const renderSettingsContent = () => {
      switch (settingsPage) {
          case 'PERSONAL_INFO': return renderPersonalInfo();
          case 'DELETE_ACCOUNT': return renderDeleteAccount();
          case 'ADD_PROFESSIONAL': return renderAddProfessional();
          case 'HELP': return <div className="p-6 text-white text-sm space-y-4">مركز المساعدة يعمل بكامل طاقته...<div className="h-px bg-gray-800 w-full" />دليل المستخدم متوفر 24/7.</div>;
          case 'REPORT': return <div className="p-6 h-full flex flex-col"><h3 className="font-bold text-white mb-4">ما الذي تود الإبلاغ عنه؟</h3><textarea className="bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-white text-sm h-40 outline-none" placeholder="اكتب مشكلتك هنا..." /><button className="mt-4 py-3 bg-[#0095f6] rounded-xl font-bold">إرسال بلاغ</button></div>;
          case 'TERMS': return <div className="p-6 text-gray-300 text-xs leading-loose">تحكم شروط الاستخدام هذه استخدامك لـ NeL... الخصوصية هي أولويتنا القصوى.</div>;
          default:
              return (
                  <div className="space-y-6">
                        <SettingsGroup title={t('account')}>
                            <SettingsRow icon={<UserCog />} label={t('personal_info')} subtext="البريد ورقم الهاتف" onClick={() => setSettingsPage('PERSONAL_INFO')} />
                            <SettingsRow icon={<ShieldCheck />} label={t('security')} subtext="كلمة المرور والأمان" />
                            <SettingsRow icon={<Briefcase />} label={t('account_type')} subtext={accountType === 'personal' ? 'شخصي' : 'احترافي'} onClick={() => setSettingsPage('ADD_PROFESSIONAL')} />
                            <SettingsRow icon={<AlertTriangle />} label={t('delete_account')} isDestructive onClick={() => setSettingsPage('DELETE_ACCOUNT')} />
                        </SettingsGroup>
                        <SettingsGroup title={t('support')}>
                             <SettingsRow icon={<HelpCircle />} label={t('help_center')} onClick={() => setSettingsPage('HELP')} />
                             <SettingsRow icon={<ShieldAlert />} label={t('report_problem')} onClick={() => setSettingsPage('REPORT')} />
                             <SettingsRow icon={<Bookmark />} label={t('terms')} onClick={() => setSettingsPage('TERMS')} />
                        </SettingsGroup>
                        <div className="space-y-1 pt-6 pb-12 px-2">
                             <SettingsRow icon={<Plus size={18} />} label={t('add_account')} isBlue onClick={() => { onLogout(); }} rightElement={null} />
                             <SettingsRow icon={<LogOut size={18} />} label={`${t('logout')} ${user.username}`} isDestructive onClick={() => setShowLogoutModal(true)} rightElement={null} />
                        </div>
                  </div>
              );
      }
  };

  const getPageTitle = () => {
      switch(settingsPage) {
          case 'MAIN': return t('settings_privacy');
          case 'PERSONAL_INFO': return t('personal_info');
          case 'ADD_PROFESSIONAL': return 'حساب احترافي';
          case 'DELETE_ACCOUNT': return 'تعطيل الحساب';
          case 'HELP': return t('help_center');
          case 'REPORT': return t('report_problem');
          case 'TERMS': return t('terms');
          default: return '';
      }
  };

  return (
    <div className="h-full bg-[#0b0b0b] text-white flex flex-col relative overflow-y-auto no-scrollbar scroll-smooth">
      <div className="relative w-full overflow-hidden flex flex-col items-center shrink-0 pt-16 pb-2">
          <div className="absolute inset-0 z-0">
              <img src={user.avatar} className="w-full h-full object-cover blur-[80px] opacity-30 scale-150" alt="blur" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0b0b]/60 to-[#0b0b0b]"></div>
          </div>
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-20">
              <button onClick={() => setIsIncognito(!isIncognito)} className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${isIncognito ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white border-white/10'}`}>
                   {isIncognito ? <EyeOff size={14} /> : <Eye size={14} />}
                   <span className="text-[9px] font-black tracking-widest uppercase">{isIncognito ? 'GHOST' : 'ACTIVE'}</span>
              </button>
              <button onClick={() => { setSettingsPage('MAIN'); setShowSettings(true); }} className="p-2.5 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors"><Menu size={20} /></button>
          </div>
          <div className="relative z-10 mb-6 group cursor-pointer" onClick={() => setShowEditProfile(true)}>
              <div className="relative w-28 h-28 rounded-[38%] rotate-[45deg] p-1 bg-gradient-to-tr from-[#0095f6] to-[#0033cc] shadow-[0_10px_40px_rgba(0,149,246,0.3)] animate-morph overflow-hidden">
                  <img src={user.avatar} className="w-full h-full rounded-[38%] object-cover -rotate-[45deg] scale-125 border-2 border-[#0b0b0b]" alt="Avatar" />
              </div>
          </div>
          <div className="relative z-10 text-center px-8 w-full">
              <h1 className="text-2xl font-black text-white tracking-tighter mb-0.5">{user.name}</h1>
              <p className="text-[#0095f6] text-[11px] font-black tracking-widest uppercase opacity-80 mb-3">@{user.username}</p>
              <div onClick={() => setIsBioExpanded(!isBioExpanded)} className={`text-[13px] text-gray-300 leading-relaxed transition-all duration-500 cursor-pointer ${isBioExpanded ? '' : 'line-clamp-2 opacity-80'}`}>{user.bio || "مرحبًا بك في عالمي الخاص 🌌 حيث يلتقي الإبداع بالهدوء."}</div>
          </div>
      </div>

      <div className="z-10 relative px-6 mt-4 flex gap-3 w-full max-w-sm mx-auto">
          <button onClick={() => setShowEditProfile(true)} className="flex-1 bg-white text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">تعديل الهوية</button>
          <button className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white transition-all hover:bg-white/10 active:scale-90"><MessageCircle size={18} /></button>
          <button className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white transition-all hover:bg-white/10 active:scale-90"><Share2 size={18} /></button>
      </div>

      <div className="z-10 relative px-6 mt-8 mb-6">
          <div className="flex justify-around items-center w-full bg-white/5 rounded-[32px] p-6 border border-white/5 backdrop-blur-md">
              <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white">{user.postsCount}</span>
                  <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase mt-1">منشور</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2"></div>
              <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-[#0095f6]">{user.followers}</span>
                  <span className="text-[9px] text-[#0095f6] font-black tracking-widest uppercase mt-1">متابع</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2"></div>
              <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white">{user.following}</span>
                  <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase mt-1">يتابع</span>
              </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0b0b0b] rounded-t-[48px] border-t border-white/5 relative min-h-[600px]">
           <div className="flex justify-around items-center border-b border-white/5 sticky top-0 bg-[#0b0b0b]/90 z-20 backdrop-blur-2xl rounded-t-[48px] px-4">
               <button onClick={() => setActiveTab('my_videos')} className={`relative flex-1 py-6 flex items-center justify-center transition-all ${activeTab === 'my_videos' ? 'text-[#0095f6]' : 'text-gray-600'}`}>
                   <Video size={22} strokeWidth={activeTab === 'my_videos' ? 3 : 1.5} />
                   {activeTab === 'my_videos' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#0095f6] rounded-full shadow-[0_-2px_10px_rgba(0,149,246,0.5)]"></div>}
               </button>
               <button onClick={() => setActiveTab('highlights')} className={`relative flex-1 py-6 flex items-center justify-center transition-all ${activeTab === 'highlights' ? 'text-white' : 'text-gray-600'}`}>
                   <Star size={22} strokeWidth={activeTab === 'highlights' ? 3 : 1.5} />
                   {activeTab === 'highlights' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
               </button>
               
               {/* --- SAVED MUSIC TAB --- */}
               <button onClick={() => setActiveTab('saved_music')} className={`relative flex-1 py-6 flex items-center justify-center transition-all ${activeTab === 'saved_music' ? 'text-purple-500' : 'text-gray-600'}`}>
                   <Music size={22} strokeWidth={activeTab === 'saved_music' ? 3 : 1.5} />
                   {activeTab === 'saved_music' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-500 rounded-full shadow-[0_-2px_10px_rgba(168,85,247,0.5)]"></div>}
               </button>
           </div>
           <div className="flex-1">{renderSmartGrid()}</div>
      </div>

      {showSettings && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowSettings(false)}></div>
               <div className="bg-[#121212] w-full rounded-t-[48px] h-[85vh] animate-in slide-in-from-bottom duration-500 relative z-10 flex flex-col border-t border-white/10 p-6 shadow-2xl">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
                    <div className="flex items-center justify-between p-2 border-b border-gray-800/50 mb-4">
                        {settingsPage !== 'MAIN' ? (
                            <button onClick={() => setSettingsPage('MAIN')} className="p-2.5 -ml-2 text-white hover:bg-gray-800 rounded-full transition-colors"><ArrowRight size={24} className="rtl:rotate-180" /></button>
                        ) : (<div className="w-10"></div>)}
                        <h2 className="font-bold text-white text-base">{getPageTitle()}</h2>
                        <button onClick={() => setShowSettings(false)} className="p-2.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"><X size={20} className="text-gray-300" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-8">{renderSettingsContent()}</div>
               </div>
          </div>
      )}

      {showLogoutModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
              <div className="bg-[#1c1c1c] w-full max-w-xs rounded-[32px] p-8 text-center animate-in zoom-in duration-300 border border-white/10 shadow-2xl">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut className="text-red-500" size={32} /></div>
                  <h3 className="text-xl font-black mb-2 text-white">هل تريد الخروج؟</h3>
                  <p className="text-xs text-gray-500 mb-8 leading-relaxed">سيتم إنهاء الجلسة الحالية وحفظ معلومات الدخول.</p>
                  <button onClick={() => { setShowLogoutModal(false); setShowSettings(false); onLogout(); }} className="w-full py-4 bg-red-600 rounded-2xl font-black text-xs uppercase tracking-widest mb-3 shadow-lg hover:bg-red-700 transition-colors">نعم، خروج</button>
                  <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-colors">إلغاء</button>
              </div>
          </div>
      )}

      {showEditProfile && (
          <div className="fixed inset-0 bg-[#0b0b0b] z-[100] animate-in slide-in-from-bottom duration-500 flex flex-col p-8">
              <div className="flex justify-between items-center mb-12">
                  <button onClick={() => setShowEditProfile(false)} className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white"><X /></button>
                  <h2 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">تعديل الهوية</h2>
                  <button onClick={handleSaveProfile} className="text-[#0095f6] font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors">تم</button>
              </div>
              <div className="flex flex-col items-center mb-12">
                  <div className="relative mb-4">
                      <img src={editForm.avatar} className="w-28 h-28 rounded-[32px] object-cover border-4 border-white/5 shadow-2xl" alt="edit-avatar" />
                      <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-[#0095f6] p-2.5 rounded-xl border-4 border-[#0b0b0b] text-white shadow-lg"><Camera size={18} /></button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="space-y-8 max-w-md mx-auto w-full">
                  <div className="group">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">الاسم الحقيقي</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/5 rounded-2xl p-4 outline-none border border-transparent focus:border-[#0095f6]/30 transition-all text-sm font-bold text-white" />
                  </div>
                  <div className="group">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 block">نبذة عنك</label>
                      <textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-white/5 rounded-2xl p-4 h-32 resize-none outline-none border border-transparent focus:border-[#0095f6]/30 transition-all text-sm leading-relaxed text-white" />
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes morph { 0%, 100% { border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%; } 50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }
        .animate-morph { animation: morph 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ProfileView;
