/**
 * Telegram Service - Bot Notifications
 * © 2025 La Voie Shinkofa
 */

import axios from 'axios';
import { logger } from '../utils/logger';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Send message via Telegram bot
 */
export async function sendTelegramMessage(
  message: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<{ success: boolean; error?: string }> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      logger.warn('Telegram bot not configured');
      return { success: false, error: 'Telegram bot not configured' };
    }

    const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;

    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
    });

    logger.info('Telegram message sent');

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to send Telegram message', { error });
    return { success: false, error: error.message };
  }
}

/**
 * Send task reminder
 */
export async function sendTaskReminder(
  taskTitle: string,
  assignedTo: string,
  dueDate?: Date
): Promise<void> {
  const dueDateStr = dueDate
    ? dueDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'aucune échéance';

  const message = `
📋 *Rappel Tâche*

**${taskTitle}**
👤 Assigné à: ${assignedTo}
📅 Échéance: ${dueDateStr}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Send meal planning reminder
 */
export async function sendMealPlanningReminder(
  day: string,
  meals: Array<{ type: string; dish: string; cook?: string }>
): Promise<void> {
  const mealsText = meals
    .map((m) => `  • ${m.type}: ${m.dish}${m.cook ? ` (${m.cook})` : ''}`)
    .join('\n');

  const message = `
🍽️ *Menu du jour - ${day}*

${mealsText}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Send shopping list reminder
 */
export async function sendShoppingReminder(
  itemCount: number,
  essentialItems: string[]
): Promise<void> {
  const essentialText =
    essentialItems.length > 0
      ? `\n\n🔴 *Essentiels*:\n${essentialItems.map((item) => `  • ${item}`).join('\n')}`
      : '';

  const message = `
🛒 *Rappel Courses*

Total: ${itemCount} articles${essentialText}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Send baby tracking summary
 */
export async function sendBabyTrackingSummary(
  baby: string,
  repasCount: number,
  couchesCount: number
): Promise<void> {
  const message = `
👶 *Résumé ${baby} - Aujourd'hui*

🍼 Repas: ${repasCount}
🧷 Couches: ${couchesCount}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Send crisis alert
 */
export async function sendCrisisAlert(
  person: string,
  crisisType: string,
  immediateResponse: string
): Promise<void> {
  const message = `
🚨 *ALERTE CRISE*

👤 Personne: ${person}
⚠️ Type: ${crisisType}

📋 *Action immédiate*:
${immediateResponse}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Send daily summary
 */
export async function sendDailySummary(summary: {
  date: string;
  tasksCompleted: number;
  eventsToday: number;
  babySummary?: { evy: { repas: number; couches: number }; nami: { repas: number; couches: number } };
}): Promise<void> {
  const babyText = summary.babySummary
    ? `

👶 *Bébés*:
  • Evy: ${summary.babySummary.evy.repas} repas, ${summary.babySummary.evy.couches} couches
  • Nami: ${summary.babySummary.nami.repas} repas, ${summary.babySummary.nami.couches} couches`
    : '';

  const message = `
📊 *Résumé du jour - ${summary.date}*

✅ Tâches complétées: ${summary.tasksCompleted}
📅 Événements: ${summary.eventsToday}${babyText}
  `.trim();

  await sendTelegramMessage(message);
}
