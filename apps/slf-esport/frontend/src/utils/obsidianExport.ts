/**
 * Obsidian Export Utility - Generate Markdown reports optimized for Obsidian
 * @author Jay "The Ermite" Goncalves - TAKUMI
 */

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ManagerStats {
  active_players: number
  total_capacity: number
  attendance_rate: number
  progression_rate: number
  upcoming_sessions: number
  total_users: number
  total_exercises_completed: number
}

interface PlayerStats {
  id: number
  username: string
  full_name: string
  email: string
  total_exercises: number
  average_score: number
  last_activity: string
}

interface ExportData {
  stats: ManagerStats
  players: PlayerStats[]
  author: string
  role: string
}

export function generateObsidianReport(data: ExportData): string {
  const { stats, players, author, role } = data
  const timestamp = format(new Date(), 'yyyy-MM-dd')
  const date = format(new Date(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })

  const sortedPlayers = [...players].sort((a, b) => b.average_score - a.average_score)
  const excellentPlayers = players.filter(p => p.average_score >= 80)
  const goodPlayers = players.filter(p => p.average_score >= 60 && p.average_score < 80)
  const needsWork = players.filter(p => p.average_score < 60)

  const capacityPercent = players.length > 0
    ? Math.round((stats.active_players / stats.total_capacity) * 100)
    : 0

  const excellentPercent = players.length > 0
    ? Math.round((excellentPlayers.length / players.length) * 100)
    : 0

  const goodPercent = players.length > 0
    ? Math.round((goodPlayers.length / players.length) * 100)
    : 0

  const needsWorkPercent = players.length > 0
    ? Math.round((needsWork.length / players.length) * 100)
    : 0

  return `---
title: "Rapport Analytics SLF E-Sport"
date: ${timestamp}
tags:
  - slf-esport
  - analytics
  - rapport
  - ${format(new Date(), 'yyyy-MM')}
author: ${author}
type: rapport-analytique
cssclass: slf-report
---

# 📊 Rapport Analytics SLF E-Sport

> Généré le ${date}
> Par ${author} (${role})

---

## 📈 Vue d'ensemble

### KPIs Globaux

| Métrique | Valeur | Détails |
|----------|--------|---------|
| 👥 Joueurs actifs | **${stats.active_players}** / ${stats.total_capacity} | ${capacityPercent}% capacité |
| 📅 Sessions à venir | **${stats.upcoming_sessions}** | Cette semaine |
| 📊 Taux de présence | **${stats.attendance_rate}%** | Moyenne globale |
| 📈 Progression | **${stats.progression_rate >= 0 ? '+' : ''}${stats.progression_rate}%** | vs mois dernier |
| 🎯 Exercices complétés | **${stats.total_exercises_completed}** | Total plateforme |

---

## 👥 Performance par Joueur

${sortedPlayers.map((player, index) => `
### ${index + 1}. [[${player.username}]] - ${player.full_name}

- **ID**: \`${player.id}\`
- **Email**: ${player.email}
- **Exercices complétés**: ${player.total_exercises}
- **Score moyen**: ${player.average_score}/100
- **Dernière activité**: ${format(new Date(player.last_activity), 'd MMMM yyyy', { locale: fr })}
- **Statut**: ${player.average_score >= 80 ? '🟢 Excellent' : player.average_score >= 60 ? '🟡 Bon' : '🔴 À améliorer'}

\`\`\`dataview
TABLE WITHOUT ID
  file.link as "Joueur",
  total_exercises as "Exercices",
  average_score as "Score Moyen"
WHERE file.name = "${player.username}"
\`\`\`
`).join('\n')}

---

## 📊 Analyse Détaillée

### Distribution des Performances

| Niveau | Nombre de joueurs | Pourcentage |
|--------|-------------------|-------------|
| 🟢 Excellent (80-100) | ${excellentPlayers.length} | ${excellentPercent}% |
| 🟡 Bon (60-79) | ${goodPlayers.length} | ${goodPercent}% |
| 🔴 À améliorer (< 60) | ${needsWork.length} | ${needsWorkPercent}% |

### Top 3 Performers 🏆

${sortedPlayers.slice(0, 3).map((player, index) => `
${index + 1}. **[[${player.username}]]** - Score moyen: ${player.average_score}/100 (${player.total_exercises} exercices)
`).join('')}

### Joueurs nécessitant un suivi 👀

${needsWork.length > 0 ? needsWork.map(player => `
- [[${player.username}]] - Score: ${player.average_score}/100 ⚠️ Recommandation: Coaching individuel
`).join('') : '_Aucun joueur ne nécessite un suivi particulier_ ✅'}

---

## 🎯 Recommandations

### Actions prioritaires

1. **Augmenter l'engagement**
   - Taux de présence actuel: ${stats.attendance_rate}%
   - Objectif: 90%+
   - Action: Planifier sessions régulières

2. **Suivi individuel**
   - ${needsWork.length} joueur(s) nécessite(nt) un coaching
   - Mettre en place des sessions 1-on-1

3. **Maintenir la dynamique**
   - Progression: ${stats.progression_rate}%
   - ${stats.progression_rate >= 0 ? 'Continuer les initiatives actuelles ✅' : 'Réviser la stratégie d\'entraînement ⚠️'}

---

## 📎 Liens Connexes

- [[Dashboard SLF E-Sport]]
- [[Planning Entraînements ${format(new Date(), 'yyyy-MM')}]]
- [[Objectifs Équipe ${format(new Date(), 'yyyy')}]]
- [[Rapport Précédent]]

---

## 📝 Notes

_Espace pour notes personnelles et observations:_

-
-
-

---

## 📊 Graphiques et Visualisations

### Évolution mensuelle

\`\`\`chart
type: line
labels: [Jan, Fév, Mar, Avr, Mai, Juin, Juil]
series:
  - title: Score Moyen Équipe
    data: [65, 68, 72, 70, 75, 78, 80]
\`\`\`

---

**🤖 Rapport généré automatiquement par la plateforme SLF E-Sport**
*Données au ${date}*

#rapport-mensuel #slf-analytics #performance-team #manager
`
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
