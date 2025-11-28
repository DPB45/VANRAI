import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const currentLang = i18n.language;

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