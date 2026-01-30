/**
 * API Module - Centralized exports
 * Shinkofa Platform - Frontend
 */

// Client & Auth
export {
  default as apiClient,
  setUserId,
  getUserId,
  clearUserId,
  isAuthenticated,
} from './client'

// Tasks API
export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from './tasks'

// Projects API
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from './projects'

// Journals API
export {
  getJournals,
  getJournalByDate,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
} from './journals'

// Rituals API
export {
  getRituals,
  getRitual,
  createRitual,
  updateRitual,
  deleteRitual,
  resetRituals,
} from './rituals'
