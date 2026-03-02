import "./header.css";
import { MenuIcon, XIcon, UserIcon, SunIcon, MoonIcon, LanguagesIcon } from "./Icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";

export default function Header({ isOpen, setIsMenuOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const t = translations[lang];

  return (
    <header className={`header-bar ${isOpen ? "shifted" : ""}`}>
      <button className={isOpen ? "menu-btn open-btn" : "menu-btn"} onClick={() => setIsMenuOpen(!isOpen)}>
        {isOpen ? <XIcon /> : <MenuIcon />}
      </button>
      <div className="header-right">
        <button className="theme-toggle-btn" onClick={toggleLanguage} title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}>
          <LanguagesIcon size={20} />
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </button>
        <div className="user-info">
          <UserIcon size={18} />
          <span>{t.admin}</span>
        </div>
      </div>
    </header>
  );
}
