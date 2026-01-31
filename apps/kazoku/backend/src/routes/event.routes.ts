/**
 * Event Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createEventSchema, updateEventSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private
 */
router.post(
  '/',
  validate(createEventSchema),
  asyncHandler(eventController.createEvent)
);

/**
 * @route   GET /api/v1/events
 * @desc    Get all events for current user (optionally filter by date range)
 * @query   start_date, end_date (optional)
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(eventController.getEvents)
);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(eventController.getEventById)
);

/**
 * @route   PATCH /api/v1/events/:id
 * @desc    Update event
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateEventSchema),
  asyncHandler(eventController.updateEvent)
);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(eventController.deleteEvent)
);

export default router;
