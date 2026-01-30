/**
 * Preload Script
 * Exposes safe API to Renderer Process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to Renderer
contextBridge.exposeInMainWorld('api', {
  // Invoke (Renderer → Main, with return value)
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // Send (Renderer → Main, no return value)
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  // On (Main → Renderer, listener)
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

// Type declaration for TypeScript
declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
