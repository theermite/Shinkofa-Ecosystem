/**
 * Obsidian Export Service - Markdown Exports
 * © 2025 La Voie Shinkofa
 */

import { logger } from '../utils/logger';
import { Task, Meal, RepasLog, CoucheLog, BienEtreLog, ShoppingList, ShoppingItem } from '../types';

/**
 * Export tasks to Markdown
 */
export function exportTasksToMarkdown(tasks: Task[]): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let markdown = `---
date: ${now.toISOString().split('T')[0]}
tags: [family-hub, tasks, export]
---

# Tâches Ménagères - ${dateStr}

`;

  // Group by status
  const statuses = ['ouverte', 'assignée', 'en_cours', 'complétée', 'archivée'] as const;

  statuses.forEach((status) => {
    const tasksInStatus = tasks.filter((t) => t.status === status);
    if (tasksInStatus.length === 0) return;

    const statusEmoji = {
      ouverte: '⚪',
      assignée: '🔵',
      en_cours: '🟡',
      complétée: '✅',
      archivée: '📦',
    };

    markdown += `\n## ${statusEmoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)} (${tasksInStatus.length})\n\n`;

    tasksInStatus.forEach((task) => {
      const checkbox = status === 'complétée' ? '[x]' : '[ ]';
      const assignedText = task.assigned_to ? ` - 👤 Assigné` : '';
      const dueDateText = task.due_date
        ? ` - 📅 ${new Date(task.due_date).toLocaleDateString('fr-FR')}`
        : '';
      const priorityEmoji = { basse: '🟢', moyenne: '🟡', haute: '🔴' };

      markdown += `- ${checkbox} ${priorityEmoji[task.priority]} **${task.title}**${assignedText}${dueDateText}\n`;
      if (task.description) {
        markdown += `  > ${task.description}\n`;
      }
    });
  });

  markdown += `\n---\n*Exporté le ${dateStr} depuis Family Hub*\n`;

  logger.info('Tasks exported to Markdown', { count: tasks.length });

  return markdown;
}

/**
 * Export meals to Markdown
 */
export function exportMealsToMarkdown(meals: Meal[], weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStr = `${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  let markdown = `---
date: ${weekStart.toISOString().split('T')[0]}
tags: [family-hub, meals, planning, export]
---

# Planning Repas - Semaine du ${weekStr}

`;

  // Group by day
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  const mealsByDay: { [key: string]: Meal[] } = {};
  meals.forEach((meal) => {
    const date = new Date(meal.date);
    const dayOfWeek = date.getDay();
    const dayName = days[dayOfWeek === 0 ? 6 : dayOfWeek - 1];

    if (!mealsByDay[dayName]) {
      mealsByDay[dayName] = [];
    }
    mealsByDay[dayName].push(meal);
  });

  days.forEach((day) => {
    if (!mealsByDay[day] || mealsByDay[day].length === 0) return;

    markdown += `\n## ${day.charAt(0).toUpperCase() + day.slice(1)}\n\n`;

    const mealTypes = ['petit_déj', 'déjeuner', 'goûter', 'dîner'] as const;
    const mealEmojis = { petit_déj: '🥐', déjeuner: '🍽️', goûter: '🍪', dîner: '🌙' };

    mealTypes.forEach((type) => {
      const meal = mealsByDay[day].find((m) => m.meal_type === type);
      if (!meal) return;

      const cookText = meal.assigned_cook ? ` - 👨‍🍳 ${meal.assigned_cook}` : '';
      markdown += `- ${mealEmojis[type]} **${type.replace('_', ' ')}**: ${meal.dish_name || 'À définir'}${cookText}\n`;

      if (meal.notes) {
        markdown += `  > ${meal.notes}\n`;
      }
    });
  });

  markdown += `\n---\n*Exporté depuis Family Hub*\n`;

  logger.info('Meals exported to Markdown', { weekStart: weekStr, count: meals.length });

  return markdown;
}

/**
 * Export shopping list to Markdown
 */
export function exportShoppingListToMarkdown(
  list: ShoppingList,
  items: ShoppingItem[]
): string {
  const weekStr = new Date(list.week_start).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let markdown = `---
date: ${new Date(list.week_start).toISOString().split('T')[0]}
tags: [family-hub, shopping, courses, export]
location: ${list.location}
status: ${list.status}
---

# Liste de Courses - ${weekStr}

📍 **Lieu**: ${list.location}
📊 **Statut**: ${list.status}
${list.total_estimate ? `💰 **Estimation**: ${list.total_estimate}€` : ''}

`;

  // Group by category
  const categories = [
    'fruits',
    'légumes',
    'protéines',
    'produits_laitiers',
    'basiques',
    'autre',
  ] as const;

  const categoryEmojis = {
    fruits: '🍎',
    légumes: '🥕',
    protéines: '🍖',
    produits_laitiers: '🥛',
    basiques: '🍞',
    autre: '📦',
  };

  const categoryNames = {
    fruits: 'Fruits',
    légumes: 'Légumes',
    protéines: 'Protéines',
    produits_laitiers: 'Produits laitiers',
    basiques: 'Basiques',
    autre: 'Autres',
  };

  categories.forEach((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    if (categoryItems.length === 0) return;

    markdown += `\n## ${categoryEmojis[category]} ${categoryNames[category]}\n\n`;

    // Group by priority
    const priorities = ['essentiel', 'souhaité', 'optionnel'] as const;
    const priorityEmojis = { essentiel: '🔴', souhaité: '🟡', optionnel: '🟢' };

    priorities.forEach((priority) => {
      const priorityItems = categoryItems.filter((item) => item.priority === priority);
      if (priorityItems.length === 0) return;

      priorityItems.forEach((item) => {
        const checkbox = item.is_checked ? '[x]' : '[ ]';
        const quantityText = item.quantity ? ` (${item.quantity} ${item.unit})` : '';
        const priceText = item.price_estimate ? ` - ${item.price_estimate}€` : '';

        markdown += `- ${checkbox} ${priorityEmojis[priority]} ${item.name}${quantityText}${priceText}\n`;
      });
    });
  });

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.is_checked).length;

  markdown += `\n---\n📊 **Progression**: ${checkedItems}/${totalItems} articles (${Math.round((checkedItems / totalItems) * 100)}%)\n`;
  markdown += `\n*Exporté depuis Family Hub*\n`;

  logger.info('Shopping list exported to Markdown', { weekStart: weekStr, itemCount: items.length });

  return markdown;
}

/**
 * Export baby tracking logs to Markdown
 */
export function exportBabyLogsToMarkdown(
  baby: 'Evy' | 'Nami',
  repasLogs: RepasLog[],
  coucheLogs: CoucheLog[],
  bienEtreLogs: BienEtreLog[],
  date: Date
): string {
  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let markdown = `---
date: ${date.toISOString().split('T')[0]}
tags: [family-hub, baby, ${baby.toLowerCase()}, tracking, export]
---

# Suivi ${baby} - ${dateStr}

`;

  // Repas section
  if (repasLogs.length > 0) {
    markdown += `\n## 🍼 Repas (${repasLogs.length})\n\n`;

    repasLogs.forEach((log) => {
      const typeEmoji = log.type === 'biberon' ? '🍼' : '🍽️';
      const details =
        log.type === 'biberon'
          ? `${log.quantite_ml}ml`
          : `Assiette ${log.taille_assiette || 'non précisée'}`;
      const durationText = log.duration_minutes ? ` - ${log.duration_minutes} min` : '';

      markdown += `- ${typeEmoji} **${log.time}** - ${details}${durationText}\n`;
      if (log.notes) {
        markdown += `  > ${log.notes}\n`;
      }
    });
  }

  // Couches section
  if (coucheLogs.length > 0) {
    markdown += `\n## 🧷 Couches (${coucheLogs.length})\n\n`;

    coucheLogs.forEach((log) => {
      const typeEmoji = { pipi: '💧', caca: '💩', mixte: '💧💩' };
      markdown += `- ${typeEmoji[log.type]} **${log.time}**\n`;
      if (log.notes) {
        markdown += `  > ${log.notes}\n`;
      }
    });
  }

  // Bien-être section
  if (bienEtreLogs.length > 0) {
    markdown += `\n## 📝 Notes Bien-être\n\n`;

    bienEtreLogs.forEach((log) => {
      const categoryEmoji = {
        santé: '🏥',
        sommeil: '😴',
        comportement: '😊',
        développement: '📈',
        humeur: '💭',
        allergie: '⚠️',
        autre: '📌',
      };

      markdown += `- ${categoryEmoji[log.category]} **${log.category}**: ${log.observation}\n`;
    });
  }

  markdown += `\n---\n*Exporté le ${dateStr} depuis Family Hub*\n`;

  logger.info('Baby logs exported to Markdown', {
    baby,
    date: dateStr,
    repasCount: repasLogs.length,
    couchesCount: coucheLogs.length,
    bienEtreCount: bienEtreLogs.length,
  });

  return markdown;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  type: 'tasks' | 'meals' | 'shopping' | 'baby',
  date: Date,
  suffix?: string
): string {
  const dateStr = date.toISOString().split('T')[0];
  const suffixPart = suffix ? `-${suffix}` : '';
  return `${dateStr}-${type}${suffixPart}.md`;
}
