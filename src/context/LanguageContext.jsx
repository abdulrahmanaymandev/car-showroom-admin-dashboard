import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('lang', lang);
    }, [lang]);

    const toggleLanguage = () => {
        setLang(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage }}>
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
