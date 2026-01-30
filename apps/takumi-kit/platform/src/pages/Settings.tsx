/**
 * Settings Page - Application settings and export
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Download, Copy, Check, RefreshCw, Database, FileJson, Bell } from 'lucide-react'
import { useWidgetStore } from '@/stores/widgetStore'

export default function Settings() {
  const { widgets, notes, features } = useWidgetStore()
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const generateContext = () => {
    const context = {
      generatedAt: new Date().toISOString(),
      widgets: widgets.map((widget) => {
        const widgetNotes = notes.filter((n) => n.widgetId === widget.id)
        const widgetFeatures = features.filter((f) => f.widgetId === widget.id)

        return {
          name: widget.name,
          displayName: widget.displayName,
          status: widget.status,
          version: widget.version,
          notes: widgetNotes.map((n) => n.content).join('\n\n'),
          pendingFeatures: widgetFeatures
            .filter((f) => f.status !== 'done')
            .map((f) => ({ title: f.title, priority: f.priority })),
          completedFeatures: widgetFeatures.filter((f) => f.status === 'done').length,
        }
      }),
      summary: {
        totalWidgets: widgets.length,
        totalNotes: notes.length,
        totalFeatures: features.length,
        pendingFeatures: features.filter((f) => f.status !== 'done').length,
      },
    }

    return JSON.stringify(context, null, 2)
  }

  const handleCopyContext = async () => {
    const context = generateContext()
    await navigator.clipboard.writeText(context)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportContext = () => {
    setExporting(true)
    const context = generateContext()
    const blob = new Blob([context], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ermite-context-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(false), 1000)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ermite-text">Settings</h1>
        <p className="text-ermite-text-secondary mt-1">Manage your Control Center</p>
      </div>

      {/* Context Export */}
      <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-ermite-primary/20 flex items-center justify-center flex-shrink-0">
            <FileJson className="w-6 h-6 text-ermite-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-ermite-text">Claude Code Context Export</h3>
            <p className="text-sm text-ermite-text-secondary mt-1">
              Export your widget notes, features, and roadmap as a JSON file for use with Claude Code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyContext}
            className="flex items-center gap-2 px-4 py-2 bg-ermite-card hover:bg-ermite-card-hover border border-ermite-border text-ermite-text rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-ermite-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleExportContext}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download JSON
          </button>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <p className="text-sm text-ermite-text-secondary mb-2">Preview:</p>
          <pre className="bg-ermite-bg-secondary p-4 rounded-lg overflow-auto max-h-64 text-xs text-ermite-text-secondary">
            {generateContext()}
          </pre>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-ermite-accent/20 flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-ermite-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-ermite-text">Data Statistics</h3>
            <p className="text-sm text-ermite-text-secondary mt-1">
              Overview of stored data in your Control Center
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-ermite-bg-secondary rounded-lg p-4">
            <p className="text-2xl font-bold text-ermite-text">{widgets.length}</p>
            <p className="text-sm text-ermite-text-secondary">Widgets</p>
          </div>
          <div className="bg-ermite-bg-secondary rounded-lg p-4">
            <p className="text-2xl font-bold text-ermite-text">{notes.length}</p>
            <p className="text-sm text-ermite-text-secondary">Notes</p>
          </div>
          <div className="bg-ermite-bg-secondary rounded-lg p-4">
            <p className="text-2xl font-bold text-ermite-text">{features.length}</p>
            <p className="text-sm text-ermite-text-secondary">Features</p>
          </div>
          <div className="bg-ermite-bg-secondary rounded-lg p-4">
            <p className="text-2xl font-bold text-ermite-text">
              {features.filter((f) => f.status === 'done').length}
            </p>
            <p className="text-sm text-ermite-text-secondary">Completed</p>
          </div>
        </div>
      </div>

      {/* Notifications (Future) */}
      <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border opacity-60">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-ermite-text-secondary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-ermite-text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-ermite-text">Notifications</h3>
            <p className="text-sm text-ermite-text-secondary mt-1">
              Coming soon - Get notified about widget updates and milestones
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-ermite-text-secondary">
        <p>Ermite Control Center v1.0.0</p>
        <p className="mt-1">Built with React + TypeScript + Tailwind CSS</p>
      </div>
    </div>
  )
}
