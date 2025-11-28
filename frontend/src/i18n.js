import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hindi translations
const hiTranslation = {
  translation: {
    'Vanrai Spices': 'वनराई मसाले',
    'Home': 'होम',
    'Shop': 'दुकान',
    'Recipes': 'रेसिपी',
    'About Us': 'हमारे बारे में',
    'Contact Us': 'संपर्क करें',
    'Cart': 'कार्ट',
    'Account': 'खाता',
    'Welcome back, {{name}}!': 'वापस स्वागत है, {{name}}!',
    'Taste Bhi, Health Bhi': 'स्वाद भी, स्वास्थ्य भी',
    'Authentic Spices from Vanrai!': 'वनराई से प्रामाणिक मसाले!',
    'Add to Cart': 'कार्ट में जोड़ें',
    'Logout': 'लॉग आउट',
  },
};

// English translations
const enTranslation = {
  translation: {
    'Vanrai Spices': 'Vanrai Spices',
    'Home': 'Home',
    'Shop': 'Shop',
    'Recipes': 'Recipes',
    'About Us': 'About Us',
    'Contact Us': 'Contact Us',
    'Cart': 'Cart',
    'Account': 'Account',
    'Welcome back, {{name}}!': 'Welcome back, {{name}}!',
    'Taste Bhi, Health Bhi': 'Taste Bhi, Health Bhi',
    'Authentic Spices from Vanrai!': 'Authentic Spices from Vanrai!',
    'Add to Cart': 'Add to Cart',
    'Logout': 'Logout',
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslation,
      hi: hiTranslation,
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    debug: true, // Helpful for debugging
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;