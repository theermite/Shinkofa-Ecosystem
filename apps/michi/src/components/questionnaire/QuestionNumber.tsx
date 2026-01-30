/**
 * Question Number Component
 * For numeric input (age, etc.) - V5.0
 */

import { Question, AnswerValue } from '@/types/questionnaire';

interface QuestionNumberProps {
  question: Question;
  value: AnswerValue | number | ''; // Support both old and new format
  onChange: (value: AnswerValue) => void;
}

export default function QuestionNumber({ question, value, onChange }: QuestionNumberProps) {
  // Normalize value to AnswerValue format
  const normalizedValue: AnswerValue = (typeof value === 'number' || value === '')
    ? { value, comment: '' }
    : (value || { value: '', comment: '' });

  const handleNumberChange = (num: number | '') => {
    onChange({
      ...normalizedValue,
      value: num,
    });
  };

  return (
    <div className="space-y-4">
      <label className="block">
        {question.annotation && (
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 italic">{question.annotation}</p>
        )}

        <input
          type="number"
          value={normalizedValue.value as number | ''}
          onChange={(e) => handleNumberChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="mt-3 block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-shinkofa-marine dark:focus:border-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="Votre réponse..."
          required={question.required}
          min={0}
        />
      </label>
    </div>
  );
}
