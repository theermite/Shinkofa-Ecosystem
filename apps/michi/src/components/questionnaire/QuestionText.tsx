/**
 * Question Text Component
 * For open-ended text responses (V5.0)
 */

import { Question, AnswerValue } from '@/types/questionnaire';

interface QuestionTextProps {
  question: Question;
  value: AnswerValue | string; // Support both old and new format
  onChange: (value: AnswerValue) => void;
}

export default function QuestionText({ question, value, onChange }: QuestionTextProps) {
  // Normalize value to AnswerValue format
  const normalizedValue: AnswerValue = typeof value === 'string'
    ? { value, comment: '' }
    : (value || { value: '', comment: '' });

  const handleTextChange = (text: string) => {
    onChange({
      ...normalizedValue,
      value: text,
    });
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <textarea
          value={normalizedValue.value as string || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          className="mt-3 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-shinkofa-marine dark:focus:border-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          rows={4}
          placeholder="Votre réponse..."
          required={question.required}
        />
      </label>
    </div>
  );
}
