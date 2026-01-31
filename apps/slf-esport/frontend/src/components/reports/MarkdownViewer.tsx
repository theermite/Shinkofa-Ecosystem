/**
 * Simple Markdown Viewer - Renders markdown content as HTML
 * Supports: headings, bold, italic, links, lists, code blocks, tables
 */

import { useMemo } from 'react'

interface MarkdownViewerProps {
  content: string
  className?: string
}

// Simple markdown to HTML converter
function parseMarkdown(markdown: string): string {
  let html = markdown

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">${code.trim()}</code></pre>`
  })

  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-primary-600 dark:text-primary-400">$1</code>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
  html = html.replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-t border-gray-200 dark:border-gray-700 my-6" />')

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li class="ml-4 list-disc">[\s\S]+?<\/li>)\n(?!<li)/g, '<ul class="my-4 space-y-1">$1</ul>\n')
  html = html.replace(/(<li class="ml-4 list-decimal">[\s\S]+?<\/li>)\n(?!<li)/g, '<ol class="my-4 space-y-1">$1</ol>\n')

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (_match, content) => {
    const cells = content.split('|').map((c: string) => c.trim())

    // Check if it's a separator row
    if (cells.every((c: string) => /^[-:]+$/.test(c))) {
      return '<!-- table-separator -->'
    }

    return `<tr>${cells.map((c: string) => `<td class="px-4 py-2 border border-gray-200 dark:border-gray-700">${c}</td>`).join('')}</tr>`
  })

  // Wrap tables
  html = html.replace(
    /(<tr>[\s\S]*?<\/tr>)\n<!-- table-separator -->\n([\s\S]*?)(?=\n\n|\n$|$)/g,
    '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse bg-white dark:bg-gray-800 rounded-lg overflow-hidden"><thead class="bg-gray-50 dark:bg-gray-700">$1</thead><tbody>$2</tbody></table></div>'
  )

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-r">$1</blockquote>')

  // Paragraphs (lines that aren't already wrapped)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="text-gray-700 dark:text-gray-300 my-3 leading-relaxed">$1</p>')

  // Clean up empty paragraphs
  html = html.replace(/<p class="[^"]*"><\/p>/g, '')

  return html
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content])

  return (
    <div
      className={`markdown-content prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
