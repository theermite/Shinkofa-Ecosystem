/**
 * Version Manager - Handles app version updates and data migrations
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

const APP_VERSION = '1.2.1';
const VERSION_KEY = 'app_version';

interface Migration {
  version: string;
  migrate: () => void;
  description: string;
}

class VersionManager {
  private migrations: Migration[] = [
    {
      version: '1.0.0',
      description: 'Initial version with brain training exercises',
      migrate: () => {
        console.log('[VersionManager] Initial version - no migration needed');
      }
    },
    {
      version: '1.1.0',
      description: 'Added auto-update system for seamless updates',
      migrate: () => {
        console.log('[VersionManager] Auto-update system activated');
      }
    },
    {
      version: '1.2.1',
      description: 'Media library now accessible to all users, Invitations and Availabilities moved to Profile tabs',
      migrate: () => {
        console.log('[VersionManager] Navigation updated - Media accessible to all, Invitations/Availabilities in Profile');
        // Force cache clear
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
      }
    }
  ];

  /**
   * Check if app version has changed and run migrations
   */
  checkVersion(): { updated: boolean; oldVersion: string | null; newVersion: string } {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion !== APP_VERSION) {
      console.log(`[VersionManager] Version changed: ${storedVersion || 'new install'} → ${APP_VERSION}`);

      if (storedVersion) {
        this.runMigrations(storedVersion, APP_VERSION);
      }

      localStorage.setItem(VERSION_KEY, APP_VERSION);

      return {
        updated: true,
        oldVersion: storedVersion,
        newVersion: APP_VERSION
      };
    }

    return {
      updated: false,
      oldVersion: storedVersion,
      newVersion: APP_VERSION
    };
  }

  /**
   * Run necessary migrations between versions
   */
  private runMigrations(fromVersion: string, toVersion: string): void {
    console.log(`[VersionManager] Running migrations from ${fromVersion} to ${toVersion}`);

    const fromParts = fromVersion.split('.').map(Number);
    const toParts = toVersion.split('.').map(Number);

    // Run migrations for versions between old and new
    this.migrations.forEach(migration => {
      const migrationParts = migration.version.split('.').map(Number);

      // Check if this migration should run
      const shouldRun = this.compareVersions(migrationParts, fromParts) > 0 &&
                        this.compareVersions(migrationParts, toParts) <= 0;

      if (shouldRun) {
        console.log(`[VersionManager] Running migration: ${migration.description}`);
        try {
          migration.migrate();
        } catch (error) {
          console.error(`[VersionManager] Migration failed for ${migration.version}:`, error);
        }
      }
    });
  }

  /**
   * Compare two version arrays
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: number[], v2: number[]): number {
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return APP_VERSION;
  }

  /**
   * Get stored version
   */
  getStoredVersion(): string | null {
    return localStorage.getItem(VERSION_KEY);
  }

  /**
   * Force reload the application
   */
  reloadApp(): void {
    window.location.reload();
  }
}

export const versionManager = new VersionManager();
