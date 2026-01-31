/**
 * Discord Service - Webhook Notifications
 * © 2025 La Voie Shinkofa
 */

import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Send notification to Discord
 */
export async function sendDiscordNotification(
  title: string,
  description: string,
  color: 'success' | 'warning' | 'error' | 'info' = 'info',
  fields?: Array<{ name: string; value: string; inline?: boolean }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    const colors = {
      success: 0x4caf50, // Green
      warning: 0xff9800, // Orange
      error: 0xf44336, // Red
      info: 0x4285f4, // Blue
    };

    const embed = {
      title,
      description,
      color: colors[color],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Family Hub - La Voie Shinkofa',
      },
      fields: fields || [],
    };

    await axios.post(webhookUrl, {
      embeds: [embed],
    });

    logger.info('Discord notification sent', { title });

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to send Discord notification', { error, title });
    return { success: false, error: error.message };
  }
}

/**
 * Send task completed notification
 */
export async function notifyTaskCompleted(
  taskTitle: string,
  completedBy: string
): Promise<void> {
  await sendDiscordNotification(
    '✅ Tâche complétée',
    `**${taskTitle}** a été complétée par ${completedBy}`,
    'success',
    [
      { name: 'Tâche', value: taskTitle, inline: true },
      { name: 'Complétée par', value: completedBy, inline: true },
    ]
  );
}

/**
 * Send shopping list completed notification
 */
export async function notifyShoppingCompleted(
  weekStart: string,
  completedBy: string,
  itemCount: number
): Promise<void> {
  await sendDiscordNotification(
    '🛒 Courses complétées',
    `Courses de la semaine du ${weekStart} terminées !`,
    'success',
    [
      { name: 'Articles', value: `${itemCount} articles`, inline: true },
      { name: 'Fait par', value: completedBy, inline: true },
    ]
  );
}

/**
 * Send event reminder notification
 */
export async function notifyEventReminder(
  eventTitle: string,
  startTime: Date,
  person: string
): Promise<void> {
  const timeString = startTime.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sendDiscordNotification(
    '📅 Rappel événement',
    `**${eventTitle}** commence bientôt !`,
    'info',
    [
      { name: 'Événement', value: eventTitle, inline: false },
      { name: 'Heure', value: timeString, inline: true },
      { name: 'Personne', value: person, inline: true },
    ]
  );
}

/**
 * Send crisis protocol alert
 */
export async function notifyCrisisAlert(
  person: string,
  crisisType: string
): Promise<void> {
  await sendDiscordNotification(
    '🚨 Alerte crise',
    `Protocole de crise activé pour ${person}`,
    'warning',
    [
      { name: 'Personne', value: person, inline: true },
      { name: 'Type de crise', value: crisisType, inline: true },
    ]
  );
}
