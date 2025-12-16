
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, Language } from '../constants';

interface LanguageContextType {
  language: Language;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLangCode, setCurrentLangCode] = useState<string>('ar');

  useEffect(() => {
    // 1. Check Local Storage
    const savedLang = localStorage.getItem('nel_app_language');
    
    if (savedLang) {
      setCurrentLangCode(savedLang);
    } else {
      // 2. Auto-detect from Browser
      const browserLang = navigator.language.split('-')[0];
      const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === browserLang);
      if (isSupported) {
        setCurrentLangCode(browserLang);
      } else {
        setCurrentLangCode('ar'); // Default Fallback
      }
    }
  }, []);

  const language = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  // Update HTML Dir and Lang attributes
  useEffect(() => {
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.dir;
    localStorage.setItem('nel_app_language', language.code);
  }, [language]);

  const setLanguage = (code: string) => {
    setCurrentLangCode(code);
  };

  // Translation Function
  const t = (key: string): string => {
    const dict = TRANSLATIONS[language.code] || TRANSLATIONS['en']; // Fallback to English if lang not fully translated
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir: language.dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
