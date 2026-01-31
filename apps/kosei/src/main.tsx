import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MorphicProvider } from '@shinkofa/morphic-engine';
import { initI18n } from '@shinkofa/i18n';
import App from './App';
import './styles/index.css';

// Import locale files
import frTranslation from './locales/fr.json';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Initialize i18n
initI18n({
  defaultLocale: 'fr',
  fallbackLocale: 'fr',
  debug: import.meta.env.DEV,
  resources: {
    fr: {
      translation: frTranslation,
    },
    en: {
      translation: enTranslation,
    },
    es: {
      translation: esTranslation,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MorphicProvider>
        <App />
      </MorphicProvider>
    </BrowserRouter>
  </React.StrictMode>
);
