/**
 * Task Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as TaskModel from '../models/task.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create task
 * POST /api/v1/tasks
 */
export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const taskData = {
      ...req.body,
      created_by: req.user.userId,
    };

    const taskId = await TaskModel.createTask(taskData);

    logger.info('Task created', { taskId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Tâche créée avec succès',
      data: { id: taskId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get all active tasks or filter by status/assigned
 * GET /api/v1/tasks
 */
export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, assigned_to } = req.query;

    let tasks;
    if (status) {
      tasks = await TaskModel.getTasksByStatus(status as any);
    } else if (assigned_to) {
      tasks = await TaskModel.getTasksByAssignedUser(assigned_to as string);
    } else {
      tasks = await TaskModel.getAllActiveTasks();
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get task by ID
 * GET /api/v1/tasks/:id
 */
export async function getTaskById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const task = await TaskModel.getTaskById(id);

    if (!task) {
      throw new ApiError(404, 'Tâche non trouvée');
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update task
 * PATCH /api/v1/tasks/:id
 */
export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await TaskModel.getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Tâche non trouvée');
    }

    await TaskModel.updateTask(id, updates);

    logger.info('Task updated', { taskId: id, updates });

    res.json({
      success: true,
      message: 'Tâche mise à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete task
 * DELETE /api/v1/tasks/:id
 */
export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const task = await TaskModel.getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Tâche non trouvée');
    }

    await TaskModel.deleteTask(id);

    logger.info('Task deleted', { taskId: id });

    res.json({
      success: true,
      message: 'Tâche supprimée avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Complete task
 * POST /api/v1/tasks/:id/complete
 */
export async function completeTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { id } = req.params;

    const task = await TaskModel.getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Tâche non trouvée');
    }

    await TaskModel.completeTask(id, req.user.userId);

    logger.info('Task completed', { taskId: id, completedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Tâche complétée avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Archive task
 * POST /api/v1/tasks/:id/archive
 */
export async function archiveTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const task = await TaskModel.getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Tâche non trouvée');
    }

    await TaskModel.archiveTask(id);

    logger.info('Task archived', { taskId: id });

    res.json({
      success: true,
      message: 'Tâche archivée avec succès',
    });
  } catch (error) {
    throw error;
  }
}
