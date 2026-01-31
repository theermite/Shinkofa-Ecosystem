/**
 * Task Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createTaskSchema, updateTaskSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create new task
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskSchema),
  asyncHandler(taskController.createTask)
);

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all active tasks (optionally filter by status or assigned_to)
 * @query   status, assigned_to (optional)
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(taskController.getTasks)
);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(taskController.getTaskById)
);

/**
 * @route   PATCH /api/v1/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask)
);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(taskController.deleteTask)
);

/**
 * @route   POST /api/v1/tasks/:id/complete
 * @desc    Mark task as completed
 * @access  Private
 */
router.post(
  '/:id/complete',
  asyncHandler(taskController.completeTask)
);

/**
 * @route   POST /api/v1/tasks/:id/archive
 * @desc    Archive task
 * @access  Private
 */
router.post(
  '/:id/archive',
  asyncHandler(taskController.archiveTask)
);

export default router;
