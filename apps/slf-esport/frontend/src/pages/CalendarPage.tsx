/**
 * Calendar Page - Modern Training session calendar
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui'
import sessionService from '@/services/sessionService'
import { useAuthStore } from '@/store/authStore'
import type { Session, SessionType, SessionStatus } from '@/types/session'
import {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_EMOJIS,
  SESSION_TYPE_COLORS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  RESPONSE_STATUS_LABELS,
  RESPONSE_STATUS_COLORS,
} from '@/types/session'
import SessionModal from '@/components/sessions/SessionModal'
import SessionDetailModal from '@/components/sessions/SessionDetailModal'
import AvailabilitiesTab from '@/components/profile/AvailabilitiesTab'
import TeamAvailabilitiesTab from '@/components/coaching/TeamAvailabilitiesTab'
import TeamAvailabilityCalendar from '@/components/coaching/TeamAvailabilityCalendar'

import 'react-big-calendar/lib/css/react-big-calendar.css'

// Configure date-fns localizer with Monday as first day of week
const locales = { 'fr': fr }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Monday
  getDay,
  locales,
})

// Custom event for react-big-calendar
interface CalendarEvent extends Event {
  session: Session
}

type TabType = 'calendar' | 'my-availabilities' | 'team-availabilities' | 'team-calendar'

export default function CalendarPage() {
  const { user } = useAuthStore()

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('calendar')

  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('week')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // Filters
  const [typeFilter, setTypeFilter] = useState<SessionType | null>(null)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | null>(null)
  const [participationFilter, setParticipationFilter] = useState<string | null>(null) // pending, confirmed, maybe, declined

  const canCreateSessions = user?.role === 'COACH' || user?.role === 'MANAGER'
  const canViewTeamAvailabilities = user?.role === 'COACH' || user?.role === 'MANAGER'

  useEffect(() => {
    loadSessions()
  }, [typeFilter, statusFilter])

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const response = await sessionService.getMySessions({
        session_type: typeFilter || undefined,
        status: statusFilter || undefined,
      })
      setSessions(response.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Convert sessions to calendar events with participation filter
  const events: CalendarEvent[] = useMemo(() => {
    // Filter sessions by participation status if filter is active
    let filteredSessions = sessions

    if (participationFilter && user) {
      filteredSessions = sessions.filter((session) => {
        const myParticipation = session.participants?.find(p => p.user_id === user.id)
        return myParticipation?.response_status === participationFilter
      })
    }

    return filteredSessions.map((session) => {
      // IMPORTANT: Backend returns dates in UTC but without 'Z' suffix
      // Force interpretation as UTC by adding 'Z' if missing
      const startStr = session.start_time.endsWith('Z') ? session.start_time : `${session.start_time}Z`
      const endStr = session.end_time.endsWith('Z') ? session.end_time : `${session.end_time}Z`

      return {
        title: `${SESSION_TYPE_EMOJIS[session.session_type]} ${session.title}`,
        start: new Date(startStr),
        end: new Date(endStr),
        session,
      }
    })
  }, [sessions, participationFilter, user])

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedSession(event.session)
    setIsDetailModalOpen(true)
  }

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    if (!canCreateSessions) return

    createNewSession(start)
  }

  const createNewSession = (startDate: Date = new Date()) => {
    if (!user) return

    const start = new Date(startDate)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // +1 hour

    setSelectedSession({
      id: 0,
      title: '',
      session_type: 'solo' as SessionType,
      status: 'pending' as SessionStatus,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      created_by_id: user.id,
      participants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = async () => {
    setIsCreateModalOpen(false)

    // If a session was selected (edit or just created), navigate to its date
    if (selectedSession && selectedSession.start_time) {
      setCurrentDate(new Date(selectedSession.start_time))
    }

    setSelectedSession(null)
    await loadSessions()
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedSession(null)
    loadSessions()
  }

  const handleEditSession = () => {
    // Close detail modal and open edit modal
    setIsDetailModalOpen(false)
    setIsCreateModalOpen(true)
    // selectedSession is already set, so edit modal will open with it
  }

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const { session } = event
    let backgroundColor = '#1c3049'
    let borderColor = '#1c3049'

    // Color by status
    switch (session.status) {
      case 'confirmed':
        backgroundColor = '#10b981'
        borderColor = '#059669'
        break
      case 'cancelled':
        backgroundColor = '#ef4444'
        borderColor = '#dc2626'
        break
      case 'completed':
        backgroundColor = '#6b7280'
        borderColor = '#4b5563'
        break
      case 'pending':
        backgroundColor = '#f59e0b'
        borderColor = '#d97706'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderLeft: `4px solid ${borderColor}`,
        opacity: session.status === 'cancelled' ? 0.6 : 1,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
      },
    }
  }

  // Quick create buttons for today and tomorrow
  const quickCreateButtons = useMemo(() => {
    if (!canCreateSessions) return []

    const today = new Date()
    const tomorrow = addDays(today, 1)

    return [
      {
        label: "Aujourd'hui",
        date: today,
        time: '18:00',
      },
      {
        label: 'Demain',
        date: tomorrow,
        time: '18:00',
      },
    ]
  }, [canCreateSessions])

  const handleQuickCreate = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const sessionDate = new Date(date)
    sessionDate.setHours(hours, minutes, 0, 0)
    createNewSession(sessionDate)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Chargement du calendrier...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Modern Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                  📅 Calendrier d'entraînement
                </h1>
                <p className="text-primary-100 text-lg">
                  Planifie et gère tes sessions d'entraînement
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    {sessions.length} sessions
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    📍 Vue {currentView === 'week' ? 'semaine' : currentView === 'month' ? 'mois' : currentView === 'day' ? 'jour' : 'agenda'}
                  </span>
                </div>
              </div>

              {canCreateSessions && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Quick create buttons */}
                  {quickCreateButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickCreate(btn.date, btn.time)}
                      className="group relative overflow-hidden bg-white/90 hover:bg-white text-primary-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-2">
                        <span>⚡</span>
                        <div className="text-left">
                          <div className="text-sm font-semibold">{btn.label}</div>
                          <div className="text-xs text-gray-600">{btn.time}</div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Regular create button */}
                  <button
                    onClick={() => createNewSession()}
                    className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Nouvelle session</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📅 Calendrier
          </button>
          <button
            onClick={() => setActiveTab('my-availabilities')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'my-availabilities'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🗓️ Mes Disponibilités
          </button>
          {canViewTeamAvailabilities && (
            <>
              <button
                onClick={() => setActiveTab('team-availabilities')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'team-availabilities'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                👥 Disponibilités Team
              </button>
              <button
                onClick={() => setActiveTab('team-calendar')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'team-calendar'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📊 Vue Calendrier Team
              </button>
            </>
          )}
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <>
        {/* Modern Filters */}
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Type filters */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Type de session
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      typeFilter === null
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Tous
                  </button>
                  {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key as SessionType)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        typeFilter === key
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{SESSION_TYPE_EMOJIS[key as SessionType]}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filters */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Statut de la session
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      statusFilter === null
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Tous
                  </button>
                  {Object.entries(SESSION_STATUS_LABELS).map(([key, label]) => {
                    const statusColor = SESSION_STATUS_COLORS[key as SessionStatus]
                    return (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key as SessionStatus)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          statusFilter === key
                            ? `bg-${statusColor}-500 text-white shadow-md`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Participation status filters (for players only) */}
              {!canCreateSessions && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Ma participation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setParticipationFilter(null)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        participationFilter === null
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Toutes mes sessions
                    </button>
                    {Object.entries(RESPONSE_STATUS_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setParticipationFilter(key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          participationFilter === key
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Calendar */}
        <Card>
          <CardBody>
            <div className="calendar-modern-wrapper" style={{ minHeight: '850px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                onNavigate={setCurrentDate}
                culture="fr"
                messages={{
                  next: 'Suivant',
                  previous: 'Précédent',
                  today: "Aujourd'hui",
                  month: 'Mois',
                  week: 'Semaine',
                  day: 'Jour',
                  agenda: 'Agenda',
                  date: 'Date',
                  time: 'Heure',
                  event: 'Session',
                  noEventsInRange: 'Aucune session dans cette période',
                  showMore: (total) => `+ ${total} sessions`,
                }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onView={setCurrentView}
                selectable={canCreateSessions}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="week"
                step={30}
                timeslots={2}
                min={new Date(2000, 1, 1, 8, 0, 0)}
                max={new Date(2000, 1, 1, 23, 0, 0)}
                style={{ height: '850px' }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Help Card */}
        <Card>
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Comment utiliser le calendrier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <p>Clique sur une session pour voir les détails et t'inscrire</p>
                  </div>
                  {canCreateSessions && (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <p>Utilise les boutons "⚡" pour créer rapidement une session</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <p>Clique sur un créneau vide pour créer une session personnalisée</p>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs">
                      {canCreateSessions ? '4' : '2'}
                    </span>
                    <p>Filtre par type ou statut pour trouver ce qui t'intéresse</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
          </>
        )}

        {/* My Availabilities Tab */}
        {activeTab === 'my-availabilities' && <AvailabilitiesTab />}

        {/* Team Availabilities Tab */}
        {activeTab === 'team-availabilities' && canViewTeamAvailabilities && <TeamAvailabilitiesTab />}

        {/* Team Calendar Tab */}
        {activeTab === 'team-calendar' && canViewTeamAvailabilities && <TeamAvailabilityCalendar />}
      </div>

      {/* Modals */}
      {isCreateModalOpen && selectedSession && (
        <SessionModal
          session={selectedSession}
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
        />
      )}

      {isDetailModalOpen && selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={canCreateSessions ? handleEditSession : undefined}
        />
      )}

      {/* Custom styles for modern calendar */}
      <style>{`
        .calendar-modern-wrapper .rbc-calendar {
          font-family: inherit;
          background: white;
        }

        .dark .calendar-modern-wrapper .rbc-calendar {
          background: #1f2937;
        }

        /* Headers - Better visibility */
        .calendar-modern-wrapper .rbc-header {
          padding: 16px 8px;
          font-weight: 700;
          font-size: 15px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-bottom: 3px solid #1c3049;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dark .calendar-modern-wrapper .rbc-header {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-bottom-color: #60a5fa;
          color: #ffffff; /* WCAG AAA: 18.5:1 ratio */
        }

        /* Today highlight - More visible */
        .calendar-modern-wrapper .rbc-today {
          background-color: #dbeafe !important;
        }

        .dark .calendar-modern-wrapper .rbc-today {
          background-color: #1e40af !important;
        }

        /* Events - Better visibility and contrast */
        .calendar-modern-wrapper .rbc-event {
          border-radius: 8px;
          border: none !important;
          padding: 6px 10px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          cursor: pointer;
          line-height: 1.4;
        }

        .calendar-modern-wrapper .rbc-event:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.25);
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }

        /* Event labels - Better readability */
        .calendar-modern-wrapper .rbc-event-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .calendar-modern-wrapper .rbc-event-content {
          font-size: 14px;
          font-weight: 600;
        }

        /* Toolbar - Modern buttons */
        .calendar-modern-wrapper .rbc-toolbar {
          padding: 16px 0;
          margin-bottom: 16px;
        }

        .calendar-modern-wrapper .rbc-toolbar button {
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .calendar-modern-wrapper .rbc-toolbar button:hover {
          background: #1c3049;
          color: white;
          border-color: #1c3049;
          transform: translateY(-1px);
        }

        .dark .calendar-modern-wrapper .rbc-toolbar button:hover {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .calendar-modern-wrapper .rbc-toolbar button.rbc-active {
          background: #1c3049;
          color: white;
          box-shadow: 0 4px 6px rgba(28, 48, 73, 0.4);
          border-color: #1c3049;
        }

        .dark .calendar-modern-wrapper .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
        }

        /* Time slots - More space */
        .calendar-modern-wrapper .rbc-time-slot {
          min-height: 50px;
        }

        .calendar-modern-wrapper .rbc-timeslot-group {
          min-height: 100px;
          border-left: 1px solid #e5e7eb;
        }

        .dark .calendar-modern-wrapper .rbc-timeslot-group {
          border-left-color: #6b7280; /* WCAG AAA: Borders more visible */
        }

        /* Time labels - Better visibility */
        .calendar-modern-wrapper .rbc-time-slot {
          font-weight: 600;
          color: #4b5563;
        }

        .dark .calendar-modern-wrapper .rbc-time-slot {
          color: #f3f4f6; /* WCAG AAA: 17.3:1 ratio */
        }

        /* Grid lines - More visible */
        .calendar-modern-wrapper .rbc-time-content {
          border-top: 2px solid #e5e7eb;
        }

        .dark .calendar-modern-wrapper .rbc-time-content {
          border-top-color: #6b7280; /* WCAG AAA: Borders more visible */
        }

        .calendar-modern-wrapper .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }

        .dark .calendar-modern-wrapper .rbc-day-slot .rbc-time-slot {
          border-top-color: #4b5563; /* WCAG AAA: Subtle but visible */
        }

        /* Current time indicator */
        .calendar-modern-wrapper .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 3px;
        }

        /* Month view improvements */
        .calendar-modern-wrapper .rbc-month-view {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .dark .calendar-modern-wrapper .rbc-month-view {
          border-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        .calendar-modern-wrapper .rbc-month-row {
          border-color: #e5e7eb;
          min-height: 120px;
        }

        .dark .calendar-modern-wrapper .rbc-month-row {
          border-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        .calendar-modern-wrapper .rbc-date-cell {
          padding: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
        }

        .dark .calendar-modern-wrapper .rbc-date-cell {
          color: #ffffff; /* WCAG AAA: 18.5:1 ratio */
        }

        .calendar-modern-wrapper .rbc-off-range {
          color: #9ca3af;
        }

        .dark .calendar-modern-wrapper .rbc-off-range {
          color: #9ca3af; /* WCAG AAA: 7.5:1 ratio (was #6b7280 = 4.9:1) */
        }

        /* Week/Day view improvements */
        .calendar-modern-wrapper .rbc-time-view {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .dark .calendar-modern-wrapper .rbc-time-view {
          border-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        .dark .calendar-modern-wrapper .rbc-time-header-content {
          border-left-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        .dark .calendar-modern-wrapper .rbc-day-bg {
          background-color: #111827;
        }

        .dark .calendar-modern-wrapper .rbc-time-column {
          color: #f3f4f6; /* WCAG AAA: 17.3:1 ratio */
        }

        /* Agenda view improvements */
        .calendar-modern-wrapper .rbc-agenda-view {
          border-radius: 12px;
          overflow: hidden;
        }

        .calendar-modern-wrapper .rbc-agenda-view table {
          border: 2px solid #e5e7eb;
        }

        .dark .calendar-modern-wrapper .rbc-agenda-view table {
          border-color: #6b7280; /* WCAG AAA: More visible borders */
          background-color: #1f2937;
        }

        .calendar-modern-wrapper .rbc-agenda-date-cell,
        .calendar-modern-wrapper .rbc-agenda-time-cell {
          font-weight: 600;
          font-size: 14px;
        }

        .dark .calendar-modern-wrapper .rbc-agenda-date-cell,
        .dark .calendar-modern-wrapper .rbc-agenda-time-cell {
          color: #ffffff; /* WCAG AAA: 18.5:1 ratio */
          border-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        .calendar-modern-wrapper .rbc-agenda-event-cell {
          font-size: 14px;
        }

        .dark .calendar-modern-wrapper .rbc-agenda-event-cell {
          color: #f3f4f6; /* WCAG AAA: 17.3:1 ratio */
          border-color: #6b7280; /* WCAG AAA: More visible borders */
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .calendar-modern-wrapper .rbc-toolbar {
            flex-direction: column;
            gap: 12px;
          }

          .calendar-modern-wrapper .rbc-toolbar-label {
            margin: 8px 0;
            font-size: 18px;
            font-weight: 700;
          }

          .calendar-modern-wrapper .rbc-event {
            font-size: 12px;
            padding: 4px 6px;
          }
        }
      `}</style>
    </MainLayout>
  )
}
