'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  number: number
  text: string
  bloc: string
  module: string
  line_number: number
  type: string | null
  options: string
  annotation: string | null
}

interface QuestionsIndex {
  version: string
  total_questions: number
  questions: Question[]
}

interface SuperAdminQuestionsPanelProps {
  onGoToQuestion?: (questionNumber: number) => void
  onFillRandomAnswers?: () => Promise<void>
  sessionId?: string | null
}

export function SuperAdminQuestionsPanel({ onGoToQuestion, onFillRandomAnswers, sessionId }: SuperAdminQuestionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [questionsIndex, setQuestionsIndex] = useState<QuestionsIndex | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [questionNumber, setQuestionNumber] = useState('')
  const [isFilling, setIsFilling] = useState(false)
  const router = useRouter()

  // Load questions index on mount
  useEffect(() => {
    fetchQuestionsIndex()
  }, [])

  // Filter questions when search query changes
  useEffect(() => {
    if (!questionsIndex) return

    if (searchQuery.trim() === '') {
      setFilteredQuestions(questionsIndex.questions)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = questionsIndex.questions.filter(q =>
        q.text.toLowerCase().includes(query) ||
        (q.annotation && q.annotation.toLowerCase().includes(query)) ||
        (q.module && q.module.toLowerCase().includes(query)) ||
        q.number.toString().includes(query)
      )
      setFilteredQuestions(filtered)
    }
  }, [searchQuery, questionsIndex])

  async function fetchQuestionsIndex() {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/questions/index`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error ${response.status}:`, errorText)
        throw new Error(`Failed to fetch questions index: ${response.status}`)
      }

      const data = await response.json()
      setQuestionsIndex(data)
      setFilteredQuestions(data.questions)
    } catch (error) {
      console.error('[SuperAdmin] Error fetching questions index:', error)
    }
  }

  function goToQuestion(questionNum: number) {
    if (onGoToQuestion) {
      onGoToQuestion(questionNum)
      setIsOpen(false)
    } else {
      console.warn('onGoToQuestion callback not provided')
    }
  }

  function jumpToQuestionNumber() {
    const num = parseInt(questionNumber)
    if (!isNaN(num) && num > 0 && questionsIndex && num <= questionsIndex.total_questions) {
      goToQuestion(num)
      setQuestionNumber('')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        title="Panneau Super Admin - Navigation Questions"
      >
        🔧 Questions
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <h3 className="font-bold">Super Admin - Questions</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-purple-700 px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Fill Random Answers */}
        {onFillRandomAnswers && sessionId && (
          <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-3">
            <p className="text-xs text-orange-300 mb-2">Remplir toutes les questions avec des reponses aleatoires pour tester la generation.</p>
            <button
              onClick={async () => {
                if (confirm('Remplir TOUTES les questions avec des reponses aleatoires? Les reponses existantes seront ecrasees.')) {
                  setIsFilling(true)
                  try {
                    await onFillRandomAnswers()
                    alert('Questionnaire rempli avec succes!')
                  } catch (err) {
                    console.error('Fill random error:', err)
                    alert('Erreur: ' + (err instanceof Error ? err.message : 'Unknown error'))
                  } finally {
                    setIsFilling(false)
                  }
                }
              }}
              disabled={isFilling}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-4 py-2 rounded font-semibold transition"
            >
              {isFilling ? '⏳ Remplissage en cours...' : '🎲 Remplir Aleatoirement'}
            </button>
          </div>
        )}

        {/* Quick Jump */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Aller à la question :</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={questionsIndex?.total_questions || 999}
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && jumpToQuestionNumber()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              placeholder="N° question"
            />
            <button
              onClick={jumpToQuestionNumber}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            >
              ➜
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Rechercher :</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            placeholder="Texte, annotation, module..."
          />
        </div>

        {/* Stats */}
        {questionsIndex && (
          <div className="text-sm text-gray-400">
            {filteredQuestions.length} / {questionsIndex.total_questions} questions
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-2">
          {filteredQuestions.slice(0, 10).map(q => (
            <button
              key={q.number}
              onClick={() => goToQuestion(q.number)}
              className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded p-3 transition"
            >
              <div className="flex items-start gap-2">
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Q{q.number}
                </span>
                <div className="flex-1 text-sm">
                  <div className="font-medium">{q.text}</div>
                  {q.module && (
                    <div className="text-xs text-gray-400 mt-1">{q.module}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filteredQuestions.length > 10 && (
            <div className="text-xs text-gray-500 text-center py-2">
              + {filteredQuestions.length - 10} autres questions...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
