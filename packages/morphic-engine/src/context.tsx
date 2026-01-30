/**
 * React Context for Morphic Engine
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MorphicProfile } from '@shinkofa/types';
import type { MorphicAdaptation, MorphicPreferences } from './types';
import {
  generateMorphicAdaptation,
  updateMorphicPreferences,
  isOptimalTime,
  getCurrentEnergyLevel,
} from './engine';

interface MorphicContextValue {
  adaptation: MorphicAdaptation | null;
  setProfile: (profile: MorphicProfile) => void;
  updatePreferences: (overrides: Partial<MorphicPreferences>) => void;
  isOptimalTime: boolean;
  energyLevel: 'optimal' | 'low' | 'normal';
  isLoading: boolean;
}

const MorphicContext = createContext<MorphicContextValue | undefined>(undefined);

interface MorphicProviderProps {
  children: ReactNode;
  initialProfile?: MorphicProfile;
  storageKey?: string;
}

/**
 * Morphic Provider - Wrap your app with this
 */
export function MorphicProvider({
  children,
  initialProfile,
  storageKey = 'shinkofa_morphic_adaptation',
}: MorphicProviderProps) {
  const [adaptation, setAdaptation] = useState<MorphicAdaptation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved adaptation from localStorage
  useEffect(() => {
    const loadSavedAdaptation = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          parsed.lastUpdated = new Date(parsed.lastUpdated);
          parsed.profile.createdAt = new Date(parsed.profile.createdAt);
          parsed.profile.updatedAt = new Date(parsed.profile.updatedAt);
          setAdaptation(parsed);
        } else if (initialProfile) {
          const generated = generateMorphicAdaptation(initialProfile);
          setAdaptation(generated);
          localStorage.setItem(storageKey, JSON.stringify(generated));
        }
      } catch (error) {
        console.error('Failed to load morphic adaptation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedAdaptation();
  }, [initialProfile, storageKey]);

  // Save adaptation to localStorage whenever it changes
  useEffect(() => {
    if (adaptation) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(adaptation));
      } catch (error) {
        console.error('Failed to save morphic adaptation:', error);
      }
    }
  }, [adaptation, storageKey]);

  const setProfile = (profile: MorphicProfile) => {
    const generated = generateMorphicAdaptation(profile);
    setAdaptation(generated);
  };

  const updatePreferences = (overrides: Partial<MorphicPreferences>) => {
    if (!adaptation) return;
    const updated = updateMorphicPreferences(adaptation, overrides);
    setAdaptation(updated);
  };

  const contextValue: MorphicContextValue = {
    adaptation,
    setProfile,
    updatePreferences,
    isOptimalTime: adaptation ? isOptimalTime(adaptation) : false,
    energyLevel: adaptation ? getCurrentEnergyLevel(adaptation) : 'normal',
    isLoading,
  };

  return <MorphicContext.Provider value={contextValue}>{children}</MorphicContext.Provider>;
}

/**
 * Hook to access morphic context
 */
export function useMorphic(): MorphicContextValue {
  const context = useContext(MorphicContext);
  if (!context) {
    throw new Error('useMorphic must be used within a MorphicProvider');
  }
  return context;
}

/**
 * Hook to access morphic preferences
 */
export function useMorphicPreferences(): MorphicPreferences | null {
  const { adaptation } = useMorphic();
  return adaptation?.preferences || null;
}

/**
 * Hook to check if user should take a break
 */
export function useBreakReminder(): {
  shouldShowReminder: boolean;
  message: string;
} {
  const { adaptation, energyLevel } = useMorphic();

  if (!adaptation || !adaptation.preferences.breakReminders) {
    return { shouldShowReminder: false, message: '' };
  }

  const shouldShowReminder = energyLevel === 'low';
  const message =
    energyLevel === 'low'
      ? 'Tu es dans une période de basse énergie. Pense à faire une pause.'
      : '';

  return { shouldShowReminder, message };
}

/**
 * Hook for adaptive theme based on morphic preferences
 */
export function useMorphicTheme(): {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  reducedMotion: boolean;
} {
  const preferences = useMorphicPreferences();

  return {
    theme: preferences?.theme || 'auto',
    fontSize: preferences?.fontSize || 'medium',
    spacing: preferences?.spacing || 'normal',
    reducedMotion: preferences?.reducedMotion || false,
  };
}
