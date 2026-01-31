/**
 * Event Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as EventModel from '../models/event.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create event
 * POST /api/v1/events
 */
export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const eventData = {
      ...req.body,
      user_id: req.user.userId,
    };

    const eventId = await EventModel.createEvent(eventData);

    logger.info('Event created', { eventId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: { id: eventId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get all events for current user
 * GET /api/v1/events
 */
export async function getEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { start_date, end_date } = req.query;

    let events;
    if (start_date && end_date) {
      events = await EventModel.getEventsByDateRange(
        new Date(start_date as string),
        new Date(end_date as string)
      );
    } else {
      events = await EventModel.getEventsByUserId(req.user.userId);
    }

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get event by ID
 * GET /api/v1/events/:id
 */
export async function getEventById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const event = await EventModel.getEventById(id);

    if (!event) {
      throw new ApiError(404, 'Événement non trouvé');
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update event
 * PATCH /api/v1/events/:id
 */
export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await EventModel.getEventById(id);
    if (!event) {
      throw new ApiError(404, 'Événement non trouvé');
    }

    await EventModel.updateEvent(id, updates);

    logger.info('Event updated', { eventId: id, updates });

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete event
 * DELETE /api/v1/events/:id
 */
export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const event = await EventModel.getEventById(id);
    if (!event) {
      throw new ApiError(404, 'Événement non trouvé');
    }

    await EventModel.deleteEvent(id);

    logger.info('Event deleted', { eventId: id });

    res.json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}
