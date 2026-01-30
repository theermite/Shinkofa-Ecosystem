/**
 * IPC Handlers (Main Process)
 */

import { ipcMain } from 'electron';
import { getUsers, createUser, updateUser, deleteUser } from '../db/operations';

export function initializeIPC() {
  // Database: Get users
  ipcMain.handle('database:getUsers', async () => {
    try {
      const users = getUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Database: Create user
  ipcMain.handle('database:createUser', async (event, data: { name: string; email: string }) => {
    try {
      if (!data.name || !data.email) {
        return { success: false, error: 'Missing required fields' };
      }

      const user = createUser(data);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Database: Update user
  ipcMain.handle('database:updateUser', async (event, id: number, data: Partial<{ name: string; email: string }>) => {
    try {
      updateUser(id, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Database: Delete user
  ipcMain.handle('database:deleteUser', async (event, id: number) => {
    try {
      deleteUser(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Log listener (no return)
  ipcMain.on('log:info', (event, message: string) => {
    console.log(`[Renderer] ${message}`);
  });
}
