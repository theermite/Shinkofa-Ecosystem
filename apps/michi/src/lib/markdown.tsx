/**
 * Simple markdown parser for questionnaire annotations
 * Converts **bold** syntax to <strong> tags
 */

import React from 'react';

export function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Split by lines to preserve line breaks
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match **bold text**
    const boldPattern = /\*\*([^*]+)\*\*/g;
    let match;

    while ((match = boldPattern.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      // Add the bold text
      parts.push(
        <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    // Return the line with a line break (except for the last line)
    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {parts.length > 0 ? parts : line}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
