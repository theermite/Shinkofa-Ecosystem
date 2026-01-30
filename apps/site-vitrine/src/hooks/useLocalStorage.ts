/**
 * Hook personnalisé pour gérer le localStorage de manière type-safe
 * Utilisé pour sauvegarder la progression du questionnaire
 */

import { useState } from 'react';

/**
 * Hook pour stocker et récupérer des données dans le localStorage
 * @param key - Clé de stockage dans le localStorage
 * @param initialValue - Valeur initiale si aucune donnée n'existe
 * @returns [valeur, setter, remove] - Tuple avec la valeur, la fonction de mise à jour, et la fonction de suppression
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // État local pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis le localStorage
      const item = window.localStorage.getItem(key);
      // Parser la valeur ou retourner la valeur initiale
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permet de passer une fonction pour la mise à jour
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Sauvegarder dans l'état
      setStoredValue(valueToStore);

      // Sauvegarder dans le localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Fonction pour supprimer la valeur du localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
