/**
 * Hook personnalisé pour gérer le thème sombre/clair
 * Basé sur le système Shinkofa original
 */

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark';

/**
 * Hook pour gérer le thème de l'application
 * @returns [theme, toggleTheme] - Tuple avec le thème actuel et la fonction de basculement
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useLocalStorage<Theme>('shinkofa-theme', 'light');

  // Appliquer le thème au body lors du montage et des changements
  useEffect(() => {
    const root = document.documentElement;

    // Retirer toutes les classes de thème
    root.classList.remove('light', 'dark');

    // Ajouter la classe du thème actuel
    root.classList.add(theme);

    // Ajouter/retirer la classe dark sur le body pour Tailwind
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return [theme, toggleTheme];
}
