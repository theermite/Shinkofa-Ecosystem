/**
 * Question Checkbox Component
 * For multiple-choice questions with optional comment field (V5.0)
 */

import { Question, AnswerValue } from '@/types/questionnaire';
import CommentField from './CommentField';

interface QuestionCheckboxProps {
  question: Question;
  value: AnswerValue | string[]; // Support both old (string[]) and new (AnswerValue) format
  onChange: (value: AnswerValue) => void;
}

export default function QuestionCheckbox({ question, value, onChange }: QuestionCheckboxProps) {
  // Normalize options to array (can be string or string[])
  const options: string[] = Array.isArray(question.options)
    ? question.options
    : (question.options ? question.options.split(',').map((o: string) => o.trim()) : []);

  // Normalize value to AnswerValue format
  const normalizedValue: AnswerValue = Array.isArray(value)
    ? { value, comment: '' }
    : (value || { value: [], comment: '' });

  const handleToggle = (option: string) => {
    const currentValues = normalizedValue.value as string[];
    const newValues = currentValues.includes(option)
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option];

    onChange({
      ...normalizedValue,
      value: newValues,
    });
  };

  const handleCommentChange = (comment: string) => {
    onChange({
      ...normalizedValue,
      comment,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Vous pouvez sélectionner plusieurs réponses
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {options.map((option: string, index: number) => (
          <label
            key={index}
            className="flex items-center p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <input
              type="checkbox"
              checked={(normalizedValue.value as string[]).includes(option)}
              onChange={() => handleToggle(option)}
              className="h-4 w-4 text-shinkofa-marine dark:text-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 border-gray-300 dark:border-gray-500 rounded"
            />
            <span className="ml-3 text-sm text-gray-900 dark:text-gray-100">{option}</span>
          </label>
        ))}
      </div>

      {question.comment_allowed && (
        <CommentField
          value={normalizedValue.comment || ''}
          onChange={handleCommentChange}
          placeholder={question.annotation || "Ajoutez vos précisions..."}
        />
      )}
    </div>
  );
}
