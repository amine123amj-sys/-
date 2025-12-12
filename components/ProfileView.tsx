import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Menu, PlusSquare, Grid, Video, UserSquare2, 
  ChevronDown, AtSign, Link as LinkIcon, X, Check,
  Lock, Bell, ShieldAlert, LogOut, Users, Heart
} from 'lucide-react';
import { User } from '../types';

// --- CONSTANTS ---
const ANONYMOUS_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

// --- DUMMY DATA FOR POSTS ---
const MY_POSTS = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/300/300?random=${i + 100}`,
  type: 'image'
}));

const MY_HIGHLIGHTS = [
  { id: 1, name: 'سفر ✈️', img: 'https://picsum.photos/100/100?random=200' },
  { id: 2, name: 'تصويري 📸', img: 'https://picsum.photos/100/100?random=201' },
  { id: 3, name: 'أصدقاء 🧡', img: 'https://picsum.photos/100/100?random=202' },
  { id: 4, name: 'قهوة ☕', img: 'https://picsum.photos/100/100?random=203' },
];

const MY_TAGGED = Array.from({ length: 5 }).map((_, i) => ({
  id: i,
  url: `https://picsum.photos/300/300?random=${i + 300}`,
  user: 'friend_user'
}));

interface ProfileViewProps {
  currentUser: User | null;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onLogout }) => {
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

  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleSaveProfile = () => {
    setUser(editForm);
    // In a real app, you would also update the parent state / localStorage here
    const updatedUser = { ...editForm };
    localStorage.setItem('nel_user_session', JSON.stringify(updatedUser));
    setShowEditProfile(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        setEditForm({ ...editForm, avatar: imageUrl });
    }
  };

  const renderContentGrid = () => {
    if (activeTab === 'grid') {
      return (
        <div className="grid grid-cols-3 gap-0.5 pb-24">
          {MY_POSTS.map((post) => (
            <div key={post.id} className="relative aspect-square bg-gray-900 cursor-pointer hover:opacity-90">
              <img src={post.url} alt="post" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'reels') {
      return (
        <div className="grid grid-cols-3 gap-0.5 pb-24">
          {MY_POSTS.slice(0, 6).map((post) => (
            <div key={post.id} className="relative aspect-[9/16] bg-gray-900 cursor-pointer">
              <img src={`https://picsum.photos/300/500?random=${post.id}`} alt="reel" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs drop-shadow-md">
                <Video className="w-3 h-3 fill-white" />
                <span>1.2K</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'tagged') {
      return (
         <div className="grid grid-cols-3 gap-0.5 pb-24">
          {MY_TAGGED.map((post) => (
            <div key={post.id} className="relative aspect-square bg-gray-900 cursor-pointer">
               <img src={post.url} alt="tagged" className="w-full h-full object-cover" />
               <div className="absolute top-1 right-1">
                   <UserSquare2 className="w-4 h-4 text-white drop-shadow-md" />
               </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="h-full bg-black text-white flex flex-col relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#262626] bg-black sticky top-0 z-20">
        <div className="flex items-center gap-1 cursor-pointer">
             <Lock className="w-4 h-4 text-white" />
             <h1 className="font-bold text-lg">{user.username}</h1>
             <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-5">
            <PlusSquare className="w-6 h-6" />
            <Menu className="w-6 h-6 cursor-pointer" onClick={() => setShowSettings(true)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* --- PROFILE INFO --- */}
        <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                        <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black">
                            <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black text-white text-lg font-bold">
                        +
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 flex justify-around items-center mr-4">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{user.postsCount || 12}</span>
                        <span className="text-sm text-gray-400">منشورات</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{user.followers || '1.2K'}</span>
                        <span className="text-sm text-gray-400">متابعين</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{user.following || 150}</span>
                        <span className="text-sm text-gray-400">تتابعهم</span>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
                <h2 className="font-bold text-sm">{user.name}</h2>
                <div className="text-sm whitespace-pre-line leading-snug">{user.bio || 'لا يوجد نبذة تعريفية.'}</div>
                
                {/* Simulated Link */}
                <div className="flex items-center gap-1 text-blue-100/90 text-sm mt-1 cursor-pointer">
                    <LinkIcon className="w-3 h-3 rotate-45" />
                    <span className="font-semibold">{`nel.app/${user.username}`}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => { setEditForm(user); setShowEditProfile(true); }}
                    className="flex-1 bg-[#262626] py-1.5 rounded-lg text-sm font-semibold hover:bg-[#363636] transition-colors"
                >
                    تعديل الملف الشخصي
                </button>
                <button className="flex-1 bg-[#262626] py-1.5 rounded-lg text-sm font-semibold hover:bg-[#363636] transition-colors">
                    مشاركة الملف الشخصي
                </button>
                <button className="bg-[#262626] px-2 py-1.5 rounded-lg hover:bg-[#363636]">
                    <UserSquare2 className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* --- HIGHLIGHTS --- */}
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-4 mb-2">
            {MY_HIGHLIGHTS.map(hl => (
                <div key={hl.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                     <div className="w-16 h-16 rounded-full border border-[#262626] p-1">
                         <div className="w-full h-full bg-[#1a1a1a] rounded-full overflow-hidden">
                             <img src={hl.img} className="w-full h-full object-cover" />
                         </div>
                     </div>
                     <span className="text-xs">{hl.name}</span>
                </div>
            ))}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer opacity-70">
                 <div className="w-16 h-16 rounded-full border border-[#262626] p-1 flex items-center justify-center">
                     <PlusSquare className="w-6 h-6" />
                 </div>
                 <span className="text-xs">جديد</span>
            </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex border-t border-[#262626] sticky top-0 bg-black z-10">
            <button 
                onClick={() => setActiveTab('grid')}
                className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'grid' ? 'border-white text-white' : 'border-transparent text-gray-500'}`}
            >
                <Grid className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setActiveTab('reels')}
                className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'reels' ? 'border-white text-white' : 'border-transparent text-gray-500'}`}
            >
                <Video className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setActiveTab('tagged')}
                className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-gray-500'}`}
            >
                <UserSquare2 className="w-6 h-6" />
            </button>
        </div>

        {/* --- CONTENT --- */}
        {renderContentGrid()}
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {showEditProfile && (
          <div className="absolute inset-0 bg-black z-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#262626]">
                  <button onClick={() => setShowEditProfile(false)} className="text-white"><X className="w-6 h-6" /></button>
                  <h2 className="font-bold text-lg">تعديل الملف الشخصي</h2>
                  <button onClick={handleSaveProfile} className="text-[#0095f6] font-bold"><Check className="w-6 h-6" /></button>
              </div>
              
              <div className="flex flex-col items-center py-6">
                   <div className="w-24 h-24 rounded-full overflow-hidden mb-3 opacity-80 border border-gray-700">
                        <img src={editForm.avatar} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[#0095f6] font-bold text-sm hover:text-[#0085dd] transition-colors"
                        >
                            تغيير الصورة
                        </button>
                        <button 
                            onClick={() => setEditForm({...editForm, avatar: ANONYMOUS_AVATAR})}
                            className="text-red-500 font-bold text-sm"
                        >
                            حذف الصورة (مجهول)
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
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-400">اسم المستخدم</label>
                      <input 
                         type="text" 
                         value={editForm.username} 
                         onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-gray-400">النبذة (Bio)</label>
                      <textarea 
                         value={editForm.bio} 
                         onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                         className="w-full bg-transparent border-b border-[#262626] py-2 outline-none focus:border-white transition-colors resize-none h-20"
                      />
                  </div>
              </div>
          </div>
      )}

      {/* --- SETTINGS SHEET --- */}
      {showSettings && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
               <div className="bg-[#262626] rounded-t-2xl p-4 w-full animate-in slide-in-from-bottom duration-300 relative z-10 max-h-[70vh] overflow-y-auto">
                    <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-6"></div>
                    
                    <div className="space-y-1">
                        <SettingsItem icon={<Settings />} label="الإعدادات والخصوصية" />
                        <SettingsItem icon={<AtSign />} label="Threads" />
                        <SettingsItem icon={<ShieldAlert />} label="حالة الحساب" />
                        <SettingsItem icon={<Lock />} label="الأرشيف" />
                        <SettingsItem icon={<Bell />} label="الإشعارات" />
                        <SettingsItem icon={<Users />} label="الأصدقاء المقربون" />
                        <SettingsItem icon={<Heart />} label="تفضيلات" />
                        
                        <div className="h-px bg-gray-600 my-2"></div>
                        
                        <button 
                            onClick={() => { setShowSettings(false); onLogout(); }}
                            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-[#363636] rounded-lg"
                        >
                             <LogOut className="w-6 h-6" />
                             <span className="text-base font-medium">تسجيل الخروج</span>
                        </button>
                    </div>
               </div>
          </div>
      )}

    </div>
  );
};

const SettingsItem = ({ icon, label }: any) => (
    <button className="w-full flex items-center gap-3 p-3 hover:bg-[#363636] rounded-lg transition-colors text-white">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
        <span className="text-base font-medium">{label}</span>
        <ChevronDown className="w-4 h-4 mr-auto rotate-90 text-gray-400" />
    </button>
);

export default ProfileView;