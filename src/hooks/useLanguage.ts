import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    settings: 'Settings',
    search: 'Search Settings',
    privacy: 'Privacy and Security',
    language: 'Language Settings',
    downloads: 'Downloads',
    appearance: 'Appearance',
    history: 'History',
    displayLanguage: 'Display Language',
    chooseLanguage: 'Choose your preferred language for the interface',
    autoTranslate: 'Auto-translate Search Results',
    autoTranslateDesc: 'Automatically translate search results to your preferred language',
    backToSearch: '← Back to Search',
    saveSettings: 'Save Settings'
  },
  hi: {
    settings: 'सेटिंग्स',
    search: 'खोज सेटिंग्स',
    privacy: 'गोपनीयता और सुरक्षा',
    language: 'भाषा सेटिंग्स',
    downloads: 'डाउनलोड',
    appearance: 'दिखावट',
    history: 'इतिहास',
    displayLanguage: 'प्रदर्शन भाषा',
    chooseLanguage: 'इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें',
    autoTranslate: 'स्वत: अनुवाद खोज परिणाम',
    autoTranslateDesc: 'खोज परिणामों का आपकी पसंदीदा भाषा में स्वचालित अनुवाद करें',
    backToSearch: '← खोज पर वापस जाएं',
    saveSettings: 'सेटिंग्स सहेजें'
  }
};

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('preferred-language', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return { language: currentLanguage, setLanguage, t };
}