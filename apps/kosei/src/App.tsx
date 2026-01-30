import { Routes, Route } from 'react-router-dom';
import { useMorphicTheme } from '@shinkofa/morphic-engine';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { theme, reducedMotion } = useMorphicTheme();

  // Apply theme and accessibility preferences
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode - respect system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply reduced motion preference
    if (reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  }, [theme, reducedMotion]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
