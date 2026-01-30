import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MorphicProvider } from '@shinkofa/morphic-engine';
import { initI18n } from '@shinkofa/i18n';
import App from './App';
import './styles/index.css';

// Initialize i18n
initI18n({
  defaultLocale: 'fr',
  fallbackLocale: 'fr',
  debug: import.meta.env.DEV,
  resources: {
    fr: {
      translation: require('./locales/fr.json'),
    },
    en: {
      translation: require('./locales/en.json'),
    },
    es: {
      translation: require('./locales/es.json'),
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
