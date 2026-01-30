/**
 * Additional hooks for Morphic Engine
 */

import { useState, useEffect } from 'react';
import { useMorphic } from './context';
import type { MorphicRecommendations } from './types';

/**
 * Hook to get current energy level with live updates
 */
export function useEnergyLevel() {
  const { energyLevel, adaptation } = useMorphic();
  const [currentLevel, setCurrentLevel] = useState(energyLevel);

  useEffect(() => {
    // Update every minute to reflect changing energy levels
    const interval = setInterval(() => {
      setCurrentLevel(energyLevel);
    }, 60000);

    return () => clearInterval(interval);
  }, [energyLevel]);

  return {
    energyLevel: currentLevel,
    isOptimal: currentLevel === 'optimal',
    isLow: currentLevel === 'low',
    optimalHours: adaptation?.preferences.optimalHours || [],
    lowEnergyHours: adaptation?.preferences.lowEnergyHours || [],
  };
}

/**
 * Hook to get Design Humain recommendations
 */
export function useDesignHumainGuidance(): {
  type: string;
  recommendations: MorphicRecommendations | null;
} {
  const { adaptation } = useMorphic();

  if (!adaptation) {
    return {
      type: '',
      recommendations: null,
    };
  }

  return {
    type: adaptation.profile.designHumain.type,
    recommendations: adaptation.recommendations,
  };
}

/**
 * Hook to get cognitive support recommendations
 */
export function useCognitiveSupport(): string[] {
  const { adaptation } = useMorphic();
  return adaptation?.recommendations.cognitiveSupport || [];
}

/**
 * Hook to get sensory considerations
 */
export function useSensoryConsiderations(): string[] {
  const { adaptation } = useMorphic();
  return adaptation?.recommendations.sensoryConsiderations || [];
}

/**
 * Hook to get focus strategies
 */
export function useFocusStrategies(): string[] {
  const { adaptation } = useMorphic();
  return adaptation?.recommendations.focusStrategies || [];
}

/**
 * Hook for adaptive animations
 */
export function useAdaptiveAnimation() {
  const { adaptation } = useMorphic();

  const getAnimationDuration = (baseMs: number): number => {
    if (!adaptation) return baseMs;

    const { animationSpeed, reducedMotion } = adaptation.preferences;

    if (reducedMotion) return 0;

    switch (animationSpeed) {
      case 'slow':
        return baseMs * 1.5;
      case 'fast':
        return baseMs * 0.5;
      case 'normal':
      default:
        return baseMs;
    }
  };

  const shouldAnimate = adaptation ? !adaptation.preferences.reducedMotion : true;

  return {
    getAnimationDuration,
    shouldAnimate,
    animationSpeed: adaptation?.preferences.animationSpeed || 'normal',
  };
}

/**
 * Hook for adaptive spacing
 */
export function useAdaptiveSpacing() {
  const { adaptation } = useMorphic();

  const spacing = adaptation?.preferences.spacing || 'normal';

  const spacingMultipliers = {
    compact: 0.75,
    normal: 1,
    comfortable: 1.25,
  };

  const getSpacing = (baseRem: number): number => {
    return baseRem * spacingMultipliers[spacing];
  };

  return {
    spacing,
    getSpacing,
    multiplier: spacingMultipliers[spacing],
  };
}

/**
 * Hook for adaptive font size
 */
export function useAdaptiveFontSize() {
  const { adaptation } = useMorphic();

  const fontSize = adaptation?.preferences.fontSize || 'medium';

  const fontSizeMultipliers = {
    small: 0.875, // 14px base
    medium: 1, // 16px base
    large: 1.125, // 18px base
  };

  const getFontSize = (baseRem: number): number => {
    return baseRem * fontSizeMultipliers[fontSize];
  };

  return {
    fontSize,
    getFontSize,
    multiplier: fontSizeMultipliers[fontSize],
  };
}

/**
 * Hook for Work Session Timer with energy-aware breaks
 */
export function useWorkSessionTimer() {
  const { energyLevel, adaptation } = useMorphic();
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  useEffect(() => {
    if (!adaptation) return;

    // Adjust session length based on energy level
    if (energyLevel === 'optimal') {
      setSessionMinutes(45); // Longer sessions when energy is high
      setBreakMinutes(10);
    } else if (energyLevel === 'low') {
      setSessionMinutes(15); // Shorter sessions when energy is low
      setBreakMinutes(10); // Longer breaks
    } else {
      setSessionMinutes(25); // Standard Pomodoro
      setBreakMinutes(5);
    }
  }, [energyLevel, adaptation]);

  return {
    sessionMinutes,
    breakMinutes,
    energyLevel,
  };
}

/**
 * Hook to check if step-by-step mode is enabled
 */
export function useStepByStepMode(): {
  enabled: boolean;
  showHelperText: boolean;
  showProgressIndicators: boolean;
} {
  const { adaptation } = useMorphic();

  return {
    enabled: adaptation?.preferences.stepByStepMode || false,
    showHelperText: adaptation?.preferences.showHelperText || false,
    showProgressIndicators: adaptation?.preferences.progressIndicators || false,
  };
}
