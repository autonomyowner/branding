import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="font-medium"
    >
      {i18n.language === 'en' ? 'العربية' : 'English'}
    </Button>
  );
}
