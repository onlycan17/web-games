import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector">
      <button
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
        aria-label="English"
      >
        🇺🇸 EN
      </button>
      <button
        className={i18n.language === 'ko' ? 'active' : ''}
        onClick={() => changeLanguage('ko')}
        aria-label="한국어"
      >
        🇰🇷 KO
      </button>
    </div>
  );
}

export default LanguageSelector;