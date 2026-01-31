/**
 * MarkdownRenderer - Renders markdown text with proper formatting
 * Shinkofa Platform - UI Component
 *
 * Supports:
 * - Headers (##, ###)
 * - Bold (**text**)
 * - Lists (- item)
 * - Line breaks
 */

'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null

  // Process the content line by line
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // Skip empty lines but add spacing
    if (!trimmedLine) {
      elements.push(<div key={index} className="h-3" />)
      return
    }

    // Headers
    if (trimmedLine.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">
          {processInlineFormatting(trimmedLine.slice(4))}
        </h3>
      )
      return
    }

    if (trimmedLine.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-8 mb-4 border-b border-purple-200 dark:border-purple-800 pb-2">
          {processInlineFormatting(trimmedLine.slice(3))}
        </h2>
      )
      return
    }

    // List items
    if (trimmedLine.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-4 mb-2 list-disc list-inside">
          {processInlineFormatting(trimmedLine.slice(2))}
        </li>
      )
      return
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmedLine)) {
      const text = trimmedLine.replace(/^\d+\.\s/, '')
      elements.push(
        <li key={index} className="ml-4 mb-2 list-decimal list-inside">
          {processInlineFormatting(text)}
        </li>
      )
      return
    }

    // Horizontal rule
    if (trimmedLine === '---' || trimmedLine === '═══════════════════════════════════════════════════════════════') {
      elements.push(
        <hr key={index} className="my-6 border-gray-300 dark:border-gray-600" />
      )
      return
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="mb-3">
        {processInlineFormatting(trimmedLine)}
      </p>
    )
  })

  return <div className={className}>{elements}</div>
}

/**
 * Process inline formatting: **bold**, *italic*
 */
function processInlineFormatting(text: string): React.ReactNode {
  if (!text) return null

  const parts: React.ReactNode[] = []
  const _remaining = text
  let keyIndex = 0

  // Process **bold** text
  const boldPattern = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match

  while ((match = boldPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the bold text
    parts.push(
      <strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900 dark:text-white">
        {match[1]}
      </strong>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
