import React, { useState } from 'react';
import { STRINGS } from '../constants';
import { User } from '../types';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Call / Validation
    setTimeout(() => {
      // Mock User Data creation based on input or default for login
      const mockUser: User = {
        id: Date.now().toString(),
        username: isLogin ? (email.split('@')[0] || 'user_123') : username,
        name: isLogin ? 'مستخدم NeL' : name,
        email: email,
        avatar: `https://picsum.photos/200/200?random=${Date.now()}`,
        bio: 'مستخدم جديد في NeL 👋',
        followers: 0,
        following: 0,
        postsCount: 0
      };

      // In a real app, here you would receive the Token from server
      // We simulate saving the token/session
      localStorage.setItem('nel_user_session', JSON.stringify(mockUser));
      
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-purple-600/20 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-blue-600/20 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-logo text-6xl text-white mb-2">{STRINGS.appName}</h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'سجل الدخول للمتابعة' : 'أنشئ حساباً واكتشف العالم'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-gray-800 text-white text-sm rounded-xl block p-3.5 pr-10 outline-none focus:border-[#0095f6] focus:bg-[#262626] transition-all placeholder-gray-500"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <span className="text-lg font-bold">@</span>
                </div>
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-gray-800 text-white text-sm rounded-xl block p-3.5 pr-10 outline-none focus:border-[#0095f6] focus:bg-[#262626] transition-all placeholder-gray-500"
                />
              </div>
            </>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="البريد الإلكتروني أو رقم الهاتف"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-gray-800 text-white text-sm rounded-xl block p-3.5 pr-10 outline-none focus:border-[#0095f6] focus:bg-[#262626] transition-all placeholder-gray-500"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="كلمة المرور"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-gray-800 text-white text-sm rounded-xl block p-3.5 pr-10 pl-10 outline-none focus:border-[#0095f6] focus:bg-[#262626] transition-all placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isLogin && (
            <div className="text-left">
              <a href="#" className="text-xs text-[#0095f6] hover:text-white transition-colors">هل نسيت كلمة المرور؟</a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0095f6] hover:bg-[#0085dd] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="px-4 text-xs text-gray-500 font-medium">أو</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* Toggle Login/Signup */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setLoading(false);
                  setEmail('');
                  setPassword('');
                  setName('');
              }}
              className="text-[#0095f6] font-bold mx-1 hover:underline"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-12 flex flex-col items-center space-y-2 opacity-50">
             <p className="text-[10px] text-gray-500">من شركة</p>
             <h3 className="font-bold text-sm tracking-widest text-white">META AI</h3>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
