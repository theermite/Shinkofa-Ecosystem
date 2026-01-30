/**
 * Task Manager Widget - Entry point
 * Standalone task and project manager with KAIDA principle
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import TaskManagerWidget from './TaskManagerWidget'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TaskManagerWidget />
  </React.StrictMode>
)
