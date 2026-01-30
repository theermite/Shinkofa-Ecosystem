/**
 * Question Radio Component
 * For single-choice questions with optional comment field (V5.0)
 */

import { Question, AnswerValue } from '@/types/questionnaire';
import CommentField from './CommentField';

interface QuestionRadioProps {
  question: Question;
  value: AnswerValue | string; // Support both old (string) and new (AnswerValue) format
  onChange: (value: AnswerValue) => void;
}

export default function QuestionRadio({ question, value, onChange }: QuestionRadioProps) {
  // Normalize options to array (can be string or string[])
  const options: string[] = Array.isArray(question.options)
    ? question.options
    : (question.options ? question.options.split(',').map((o: string) => o.trim()) : []);

  // Normalize value to AnswerValue format
  const normalizedValue: AnswerValue = typeof value === 'string'
    ? { value, comment: '' }
    : (value || { value: '', comment: '' });

  const handleRadioChange = (selectedOption: string) => {
    onChange({
      ...normalizedValue,
      value: selectedOption,
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
      <div className="mt-4 space-y-2">
        {options.map((option: string, index: number) => (
          <label
            key={index}
            className="flex items-center p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={normalizedValue.value === option}
              onChange={(e) => handleRadioChange(e.target.value)}
              className="h-4 w-4 text-shinkofa-marine dark:text-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 border-gray-300 dark:border-gray-500"
              required={question.required}
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
