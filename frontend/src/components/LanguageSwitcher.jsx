import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  // The browser language detector can report a full locale like "en-US".
  // Normalize down to the base language code so it always matches one of
  // the <option> values below instead of showing a blank select.
  const currentLang = (i18n.language || 'en').split('-')[0];

  return (
    <div className="relative inline-flex text-gray-700">
      <GlobeAltIcon className="w-5 h-5 mr-1" />
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-white border-none focus:ring-0 focus:outline-none text-sm font-medium pr-6 py-0.5"
      >
        <option value="en">English (EN)</option>
        <option value="hi">हिन्दी (HI)</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;