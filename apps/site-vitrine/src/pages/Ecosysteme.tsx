/**
 * Page Écosystème Shinkofa V5.0
 * Vue d'ensemble complète de tous les composants de l'écosystème Shinkofa
 * Mise à jour : Janvier 2026 - Vision écosystème complet
 */

import { useTranslation } from 'react-i18next';
import {
  Brain, Calendar, Users, Mic, Gamepad2, Video,
  MessageSquare, Briefcase, Film, Trophy,
  FileText, Monitor, Cloud, Zap
} from 'lucide-react';

export function Ecosysteme() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          {t('ecosystem.hero.title')}
        </h1>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto mb-8">
          {t('ecosystem.hero.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://app.shinkofa.com"
            className="btn-primary"
          >
            {t('ecosystem.hero.ctaPrimary')}
          </a>
          <a
            href="https://app.shinkofa.com/questionnaire"
            className="btn-secondary"
          >
            {t('ecosystem.hero.ctaQuestionnaire')}
          </a>
        </div>
      </div>

      {/* Shizen AI - Cœur de l'Écosystème */}
      <div className="mb-20">
        <div className="card bg-gradient-to-br from-accent-lumineux/20 to-dore-principal/20 border-2 border-accent-lumineux/50">
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-gradient-to-br from-accent-lumineux to-dore-principal rounded-full mb-4">
              <Brain className="w-16 h-16 text-blanc-pur" />
            </div>
            <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              {t('ecosystem.shizen.title')}
            </h2>
            <p className="text-sm text-accent-lumineux font-bold mb-2">
              {t('ecosystem.shizen.subtitle')}
            </p>
          </div>
          <p className="text-lg text-bleu-profond/90 dark:text-blanc-pur/90 mb-6 text-center max-w-4xl mx-auto">
            {t('ecosystem.shizen.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blanc-pur/50 dark:bg-bleu-fonce/50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.shizen.feature1.title')}
              </h4>
              <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('ecosystem.shizen.feature1.description')}
              </p>
            </div>
            <div className="bg-blanc-pur/50 dark:bg-bleu-fonce/50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.shizen.feature2.title')}
              </h4>
              <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('ecosystem.shizen.feature2.description')}
              </p>
            </div>
            <div className="bg-blanc-pur/50 dark:bg-bleu-fonce/50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.shizen.feature3.title')}
              </h4>
              <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('ecosystem.shizen.feature3.description')}
              </p>
            </div>
            <div className="bg-blanc-pur/50 dark:bg-bleu-fonce/50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.shizen.feature4.title')}
              </h4>
              <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
                {t('ecosystem.shizen.feature4.description')}
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-bleu-profond/70 dark:text-blanc-pur/70 italic">
            {t('ecosystem.shizen.status')}
          </p>
        </div>
      </div>

      {/* Michi Shinkofa - Hub Central */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('ecosystem.michi.title')}
          </h2>
          <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto">
            {t('ecosystem.michi.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Calendrier Universel */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-dore-principal to-accent-doux rounded-full mb-4">
                <Calendar className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.calendar.title')}
              </h3>
              <p className="text-sm text-accent-lumineux font-medium mb-4">
                ✅ {t('ecosystem.michi.calendar.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.calendar.description')}
            </p>
            <ul className="space-y-2 text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              <li>• {t('ecosystem.michi.calendar.feature1')}</li>
              <li>• {t('ecosystem.michi.calendar.feature2')}</li>
              <li>• {t('ecosystem.michi.calendar.feature3')}</li>
            </ul>
          </div>

          {/* Questionnaire + Coaching */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-accent-lumineux to-dore-principal rounded-full mb-4">
                <Brain className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.coaching.title')}
              </h3>
              <p className="text-sm text-accent-lumineux font-medium mb-4">
                ✅ {t('ecosystem.michi.coaching.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.coaching.description')}
            </p>
            <a
              href="https://app.shinkofa.com/questionnaire"
              className="btn-primary w-full text-center inline-block"
            >
              {t('ecosystem.michi.coaching.cta')}
            </a>
          </div>

          {/* Planneur + Journal + Rituels */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-bleu-profond to-bleu-fonce rounded-full mb-4">
                <FileText className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.planner.title')}
              </h3>
              <p className="text-sm text-accent-lumineux font-medium mb-4">
                ✅ {t('ecosystem.michi.planner.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.planner.description')}
            </p>
            <a
              href="https://app.shinkofa.com/planner"
              className="btn-primary w-full text-center inline-block"
            >
              {t('ecosystem.michi.planner.cta')}
            </a>
          </div>

          {/* Kazoku Hub (Famille) */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-accent-doux to-dore-principal rounded-full mb-4">
                <Users className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.family.title')}
              </h3>
              <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-4">
                🚧 {t('ecosystem.michi.family.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.family.description')}
            </p>
          </div>

          {/* Gaming Hub */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-accent-lumineux to-bleu-profond rounded-full mb-4">
                <Gamepad2 className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.gaming.title')}
              </h3>
              <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-4">
                🚧 {t('ecosystem.michi.gaming.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.gaming.description')}
            </p>
          </div>

          {/* Nakama Hub (Social) */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-gradient-to-br from-dore-principal to-accent-lumineux rounded-full mb-4">
                <Users className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.michi.social.title')}
              </h3>
              <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-4">
                🚧 {t('ecosystem.michi.social.status')}
              </p>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 mb-4">
              {t('ecosystem.michi.social.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Apps Séparées - Disponibles/En Développement */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-12 text-center">
          {t('ecosystem.apps.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Hibiki Dictate */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-bleu-profond to-bleu-fonce rounded-lg">
                <Mic className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.hibiki.title')}
                </h3>
                <p className="text-xs text-accent-lumineux font-medium mb-2">
                  🚧 {t('ecosystem.apps.hibiki.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('ecosystem.apps.hibiki.description')}
            </p>
          </div>

          {/* Sakusei Studio */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-accent-lumineux to-dore-principal rounded-lg">
                <Film className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.sakusei.title')}
                </h3>
                <p className="text-xs text-accent-lumineux font-medium mb-2">
                  🚧 {t('ecosystem.apps.sakusei.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('ecosystem.apps.sakusei.description')}
            </p>
          </div>

          {/* Hikari Stream */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-dore-principal to-accent-doux rounded-lg">
                <Video className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.hikari.title')}
                </h3>
                <p className="text-xs text-accent-lumineux font-medium mb-2">
                  🔮 {t('ecosystem.apps.hikari.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('ecosystem.apps.hikari.description')}
            </p>
          </div>

          {/* SLF eSport */}
          <div className="card hover:shadow-shinkofa-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-accent-lumineux to-bleu-profond rounded-lg">
                <Trophy className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.slf.title')}
                </h3>
                <p className="text-xs text-accent-lumineux font-medium mb-2">
                  ✅ {t('ecosystem.apps.slf.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
              {t('ecosystem.apps.slf.description')}
            </p>
            <a
              href="https://slf-esport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-center inline-block"
            >
              {t('ecosystem.apps.slf.cta')}
            </a>
          </div>

          {/* Communication Apps */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-bleu-profond to-accent-lumineux rounded-lg">
                <MessageSquare className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.communication.title')}
                </h3>
                <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-2">
                  🔮 {t('ecosystem.apps.communication.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-3">
              {t('ecosystem.apps.communication.description')}
            </p>
            <ul className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 space-y-1">
              <li>• Tegami Mail - {t('ecosystem.apps.communication.tegami')}</li>
              <li>• Musubu Hub - {t('ecosystem.apps.communication.musubu')}</li>
              <li>• Kaigi Meet - {t('ecosystem.apps.communication.kaigi')}</li>
            </ul>
          </div>

          {/* Productivity Apps */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-dore-principal to-bleu-profond rounded-lg">
                <Briefcase className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.productivity.title')}
                </h3>
                <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-2">
                  🔮 {t('ecosystem.apps.productivity.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-3">
              {t('ecosystem.apps.productivity.description')}
            </p>
            <ul className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 space-y-1">
              <li>• Kōdo Hub - {t('ecosystem.apps.productivity.kodo')}</li>
              <li>• Kankei CRM - {t('ecosystem.apps.productivity.kankei')}</li>
              <li>• Jimu Suite - {t('ecosystem.apps.productivity.jimu')}</li>
              <li>• Dezain Suite - {t('ecosystem.apps.productivity.dezain')}</li>
            </ul>
          </div>

          {/* Media & System Apps */}
          <div className="card bg-beige-sable/30 dark:bg-bleu-fonce/30 border-2 border-dashed border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-accent-doux to-accent-lumineux rounded-lg">
                <Monitor className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.media.title')}
                </h3>
                <p className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 font-medium mb-2">
                  🔮 {t('ecosystem.apps.media.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-3">
              {t('ecosystem.apps.media.description')}
            </p>
            <ul className="text-xs text-bleu-profond/60 dark:text-blanc-pur/60 space-y-1">
              <li>• Media Kura - {t('ecosystem.apps.media.kura')}</li>
              <li>• Tobira Launcher - {t('ecosystem.apps.media.tobira')}</li>
              <li>• Seigyo/Shirei Admin - {t('ecosystem.apps.media.admin')}</li>
            </ul>
          </div>

          {/* Shin OS */}
          <div className="card bg-gradient-to-br from-dore-principal/10 to-accent-lumineux/10 border-2 border-dashed border-dore-principal/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-dore-principal to-accent-lumineux rounded-lg">
                <Zap className="w-6 h-6 text-blanc-pur" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                  {t('ecosystem.apps.shinOS.title')}
                </h3>
                <p className="text-xs text-dore-principal font-medium mb-2">
                  🌟 {t('ecosystem.apps.shinOS.status')}
                </p>
              </div>
            </div>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              {t('ecosystem.apps.shinOS.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Roadmap Visuelle */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            {t('ecosystem.roadmap.title')}
          </h2>
          <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto">
            {t('ecosystem.roadmap.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Phase 1 - Actuellement Disponible */}
          <div className="card bg-gradient-to-br from-accent-lumineux/20 to-dore-principal/20 border-2 border-accent-lumineux/50">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-accent-lumineux to-dore-principal rounded-full mb-4">
                <Zap className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.roadmap.priority1.title')}
              </h3>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 leading-relaxed">
              {t('ecosystem.roadmap.priority1.items')}
            </p>
          </div>

          {/* Phase 2 - Prochaines Étapes */}
          <div className="card bg-gradient-to-br from-bleu-profond/10 to-bleu-fonce/10 border-2 border-bleu-profond/30 dark:border-blanc-pur/30">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-bleu-profond to-bleu-fonce rounded-full mb-4">
                <Film className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.roadmap.priority2.title')}
              </h3>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 leading-relaxed">
              {t('ecosystem.roadmap.priority2.items')}
            </p>
          </div>

          {/* Phase 3 - Connexions et Collaboration */}
          <div className="card bg-gradient-to-br from-accent-doux/10 to-dore-principal/10 border-2 border-dashed border-accent-doux/50">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-accent-doux to-dore-principal rounded-full mb-4">
                <Users className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.roadmap.priority3.title')}
              </h3>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 leading-relaxed">
              {t('ecosystem.roadmap.priority3.items')}
            </p>
          </div>

          {/* Phase 4 - Vision Long Terme */}
          <div className="card bg-gradient-to-br from-beige-sable/30 to-dore-principal/10 border-2 border-dashed border-dore-principal/50">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-dore-principal to-accent-lumineux rounded-full mb-4">
                <Cloud className="w-8 h-8 text-blanc-pur" />
              </div>
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.roadmap.priority4.title')}
              </h3>
            </div>
            <p className="text-bleu-profond/80 dark:text-blanc-pur/80 leading-relaxed">
              {t('ecosystem.roadmap.priority4.items')}
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Philosophie */}
      <div className="card bg-gradient-to-br from-accent-lumineux/20 to-dore-principal/20 border-2 border-accent-lumineux/50 mb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
            {t('ecosystem.vision.title')}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-bleu-profond/90 dark:text-blanc-pur/90">
            {t('ecosystem.vision.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.vision.personalization.title')}
              </h3>
              <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('ecosystem.vision.personalization.description')}
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.vision.interconnection.title')}
              </h3>
              <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('ecosystem.vision.interconnection.description')}
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">💚</div>
              <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">
                {t('ecosystem.vision.kindness.title')}
              </h3>
              <p className="text-sm text-bleu-profond/80 dark:text-blanc-pur/80">
                {t('ecosystem.vision.kindness.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs Finaux */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
          {t('ecosystem.cta.title')}
        </h2>
        <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 mb-8">
          {t('ecosystem.cta.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <a
            href="https://app.shinkofa.com/questionnaire"
            className="btn-primary"
          >
            {t('ecosystem.cta.questionnaire')}
          </a>
          <a
            href="https://app.shinkofa.com"
            className="btn-secondary"
          >
            {t('ecosystem.cta.discover')}
          </a>
        </div>
        <div className="mt-8">
          <a
            href="https://shinkofa.com/soutenir"
            className="inline-flex items-center gap-2 text-accent-lumineux hover:text-dore-principal font-medium"
          >
            💚 {t('ecosystem.cta.support')}
          </a>
        </div>
      </div>
    </div>
  );
}
