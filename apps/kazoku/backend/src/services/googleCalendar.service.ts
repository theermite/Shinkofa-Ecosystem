/**
 * Google Calendar Service
 * © 2025 La Voie Shinkofa
 */

import { google } from 'googleapis';
import { logger } from '../utils/logger';
import * as EventModel from '../models/event.model';
import { Event } from '../types';

const calendar = google.calendar('v3');

/**
 * Get OAuth2 client
 */
function getOAuth2Client(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

/**
 * Sync event to Google Calendar
 */
export async function syncEventToGoogle(
  event: Event,
  refreshToken: string
): Promise<{ success: boolean; googleCalendarId?: string; error?: string }> {
  try {
    const auth = getOAuth2Client(refreshToken);

    const googleEvent = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.start_time.toISOString(),
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: event.end_time.toISOString(),
        timeZone: 'Europe/Madrid',
      },
      colorId: getGoogleColorId(event.color),
    };

    // Add recurrence rule if exists
    if (event.is_recurring && event.recurrence_rule) {
      (googleEvent as any).recurrence = [`RRULE:${event.recurrence_rule}`];
    }

    let googleCalendarId: string;

    if (event.google_calendar_id) {
      // Update existing event
      const response = await calendar.events.update({
        auth,
        calendarId: 'primary',
        eventId: event.google_calendar_id,
        requestBody: googleEvent,
      });
      googleCalendarId = response.data.id!;
    } else {
      // Create new event
      const response = await calendar.events.insert({
        auth,
        calendarId: 'primary',
        requestBody: googleEvent,
      });
      googleCalendarId = response.data.id!;
    }

    // Update sync status
    await EventModel.updateSyncStatus(event.id, 'synced', googleCalendarId, null);

    logger.info('Event synced to Google Calendar', {
      eventId: event.id,
      googleCalendarId,
    });

    return { success: true, googleCalendarId };
  } catch (error: any) {
    logger.error('Failed to sync event to Google Calendar', { error, eventId: event.id });

    // Update sync status to error
    await EventModel.updateSyncStatus(
      event.id,
      'error',
      event.google_calendar_id,
      error.message
    );

    return { success: false, error: error.message };
  }
}

/**
 * Delete event from Google Calendar
 */
export async function deleteEventFromGoogle(
  googleCalendarId: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getOAuth2Client(refreshToken);

    await calendar.events.delete({
      auth,
      calendarId: 'primary',
      eventId: googleCalendarId,
    });

    logger.info('Event deleted from Google Calendar', { googleCalendarId });

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to delete event from Google Calendar', { error, googleCalendarId });
    return { success: false, error: error.message };
  }
}

/**
 * Import events from Google Calendar
 */
export async function importEventsFromGoogle(
  userId: string,
  refreshToken: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const auth = getOAuth2Client(refreshToken);

    const timeMin = startDate?.toISOString() || new Date().toISOString();
    const timeMax = endDate?.toISOString() || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

    const response = await calendar.events.list({
      auth,
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    let importedCount = 0;

    for (const googleEvent of events) {
      if (!googleEvent.start?.dateTime || !googleEvent.end?.dateTime) {
        continue; // Skip all-day events
      }

      // Check if event already imported
      const existingEvents = await EventModel.getEventsByUserId(userId);
      const alreadyImported = existingEvents.some(
        (e) => e.google_calendar_id === googleEvent.id
      );

      if (alreadyImported) {
        continue;
      }

      // Create event in database
      await EventModel.createEvent({
        user_id: userId,
        title: googleEvent.summary || 'Sans titre',
        description: googleEvent.description || null,
        start_time: new Date(googleEvent.start.dateTime),
        end_time: new Date(googleEvent.end.dateTime),
        category: 'autre',
        color: getHexColorFromGoogleColorId(googleEvent.colorId ?? undefined),
        is_recurring: !!googleEvent.recurrence,
        recurrence_rule: googleEvent.recurrence?.[0]?.replace('RRULE:', '') || null,
      });

      importedCount++;
    }

    logger.info('Events imported from Google Calendar', { count: importedCount, userId });

    return { success: true, count: importedCount };
  } catch (error: any) {
    logger.error('Failed to import events from Google Calendar', { error, userId });
    return { success: false, error: error.message };
  }
}

/**
 * Map hex color to Google Calendar color ID (approximation)
 */
function getGoogleColorId(hexColor: string): string {
  const colorMap: { [key: string]: string } = {
    '#4285f4': '9', // Blue
    '#9c27b0': '3', // Purple
    '#4caf50': '10', // Green
    '#ff9800': '6', // Orange
    '#f44336': '11', // Red
  };
  return colorMap[hexColor] || '9'; // Default blue
}

/**
 * Map Google Calendar color ID to hex color
 */
function getHexColorFromGoogleColorId(colorId?: string): string {
  const colorMap: { [key: string]: string } = {
    '9': '#4285f4', // Blue
    '3': '#9c27b0', // Purple
    '10': '#4caf50', // Green
    '6': '#ff9800', // Orange
    '11': '#f44336', // Red
  };
  return colorMap[colorId || '9'] || '#4285f4';
}

/**
 * Get authorization URL for OAuth2
 */
export function getAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(
  code: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Missing tokens');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  } catch (error) {
    logger.error('Failed to exchange code for tokens', { error });
    return null;
  }
}
