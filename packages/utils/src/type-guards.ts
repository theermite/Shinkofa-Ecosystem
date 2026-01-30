/**
 * TypeScript type guards for Shinkofa ecosystem
 */

import type {
  Locale,
  NeurodivergenceType,
  DesignHumainType,
  UserProfile,
  DesignHumainProfile,
  MorphicProfile,
} from '@shinkofa/types';

/**
 * Check if value is a valid Locale
 */
export function isLocale(value: unknown): value is Locale {
  return value === 'fr' || value === 'en' || value === 'es';
}

/**
 * Check if value is a valid NeurodivergenceType
 */
export function isNeurodivergenceType(value: unknown): value is NeurodivergenceType {
  return (
    value === 'TDAH' ||
    value === 'TSA' ||
    value === 'HPI' ||
    value === 'Hypersensible' ||
    value === 'Multipotentiel' ||
    value === 'Autre'
  );
}

/**
 * Check if value is a valid DesignHumainType
 */
export function isDesignHumainType(value: unknown): value is DesignHumainType {
  return (
    value === 'Manifesteur' ||
    value === 'Générateur' ||
    value === 'Projecteur' ||
    value === 'Réflecteur'
  );
}

/**
 * Check if value is a valid UserProfile
 */
export function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    isLocale(obj.locale) &&
    Array.isArray(obj.neurodivergence) &&
    obj.neurodivergence.every(isNeurodivergenceType) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

/**
 * Check if value is a valid DesignHumainProfile
 */
export function isDesignHumainProfile(value: unknown): value is DesignHumainProfile {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    isDesignHumainType(obj.type) &&
    typeof obj.autorite === 'string' &&
    typeof obj.profil === 'string' &&
    typeof obj.strategie === 'string' &&
    Array.isArray(obj.centresDefinis) &&
    obj.centresDefinis.every((c) => typeof c === 'string') &&
    Array.isArray(obj.portes) &&
    obj.portes.every((p) => typeof p === 'number')
  );
}

/**
 * Check if value is a valid MorphicProfile
 */
export function isMorphicProfile(value: unknown): value is MorphicProfile {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.userId === 'string' &&
    isDesignHumainProfile(obj.designHumain) &&
    Array.isArray(obj.neurodivergence) &&
    obj.neurodivergence.every(isNeurodivergenceType) &&
    typeof obj.preferences === 'object' &&
    obj.preferences !== null &&
    typeof obj.cyclesEnergetiques === 'object' &&
    obj.cyclesEnergetiques !== null
  );
}

/**
 * Check if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Check if value is an array of specific type
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is a Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    value instanceof Promise ||
    (typeof value === 'object' &&
      value !== null &&
      'then' in value &&
      typeof (value as { then: unknown }).then === 'function')
  );
}
