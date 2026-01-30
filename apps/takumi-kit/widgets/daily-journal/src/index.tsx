/**
 * Daily Journal Widget - Entry point
 * Gratitude journal with mood check-ins
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import DailyJournalWidget from './DailyJournalWidget'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DailyJournalWidget />
  </React.StrictMode>
)
