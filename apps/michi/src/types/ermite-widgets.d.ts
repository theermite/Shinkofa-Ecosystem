/**
 * Type declarations for @ermite-widgets packages
 * These widgets are from takumi-kit but not yet configured as proper npm packages
 * TODO: Configure takumi-kit widgets as workspace packages
 */

declare module '@ermite-widgets/daily-journal/src/DailyJournalWidget' {
  import { ComponentType } from 'react';
  const DailyJournalWidget: ComponentType;
  export default DailyJournalWidget;
}

declare module '@ermite-widgets/daily-journal/src/store' {
  interface ApiSyncConfig {
    enabled: boolean;
    userId: string;
    token?: string;
  }

  interface MoodCheckIn {
    physical: number;
    emotional: number;
    mental: number;
    note?: string;
  }

  interface JournalData {
    journals: Record<string, unknown>;
    lastUpdated: string;
  }

  interface JournalStore {
    journals: Record<string, unknown>;
    lastUpdated: string;
    importData: (data: string) => void;
    addMoodCheckIn: (date: string, checkIn: MoodCheckIn) => void;
  }

  export function configureApiSync(config: ApiSyncConfig): void;
  export function loadFromApi(): Promise<JournalData | null>;
  export function useJournalStore(): JournalStore;
  export namespace useJournalStore {
    function getState(): JournalStore;
  }
}

declare module '@ermite-widgets/task-manager/src/TaskManagerWidget' {
  import { ComponentType } from 'react';
  const TaskManagerWidget: ComponentType;
  export default TaskManagerWidget;
}

declare module '@ermite-widgets/task-manager/src/store' {
  interface ApiSyncConfig {
    enabled: boolean;
    userId: string;
    token?: string;
  }

  interface TaskData {
    tasks: unknown[];
    projects: unknown[];
    lastUpdated: string;
  }

  interface TaskStore {
    tasks: unknown[];
    projects: unknown[];
    lastUpdated: string;
    importData: (data: string) => void;
  }

  export function configureApiSync(config: ApiSyncConfig): void;
  export function loadFromApi(): Promise<TaskData | null>;
  export function useTaskStore(): TaskStore;
  export namespace useTaskStore {
    function getState(): TaskStore;
  }
}
