/**
 * @shinkofa/types
 * Shared TypeScript types for Shinkofa ecosystem
 */

// ============================================================================
// User & Profile Types
// ============================================================================

export type Locale = 'fr' | 'en' | 'es';

export type NeurodivergenceType =
  | 'TDAH'
  | 'TSA'
  | 'HPI'
  | 'Hypersensible'
  | 'Multipotentiel'
  | 'Autre';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  locale: Locale;
  neurodivergence: NeurodivergenceType[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Design Humain Types
// ============================================================================

export type DesignHumainType = 'Manifesteur' | 'Générateur' | 'Projecteur' | 'Réflecteur';
export type DesignHumainAutorite = 'Émotionnelle' | 'Splénique' | 'Sacrale' | 'Ego' | 'G' | 'Lunaire' | 'Aucune';
export type DesignHumainProfil = '1/3' | '1/4' | '2/4' | '2/5' | '3/5' | '3/6' | '4/6' | '4/1' | '5/1' | '5/2' | '6/2' | '6/3';

export interface DesignHumainProfile {
  type: DesignHumainType;
  autorite: DesignHumainAutorite;
  profil: DesignHumainProfil;
  strategie: string;
  definition?: string;
  centresDefinis: string[];
  portes: number[];
}

// ============================================================================
// Morphic Engine Types
// ============================================================================

export interface MorphicProfile {
  userId: string;
  designHumain: DesignHumainProfile;
  neurodivergence: NeurodivergenceType[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    contrastMode: boolean;
    reducedMotion: boolean;
  };
  cyclesEnergetiques: {
    optimal: string[]; // Heures optimales
    faible: string[]; // Heures basse énergie
  };
}

// ============================================================================
// App Configuration Types
// ============================================================================

export interface AppConfig {
  name: string;
  version: string;
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Re-export all for convenience
};
