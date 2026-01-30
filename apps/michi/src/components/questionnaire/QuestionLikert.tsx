/**
 * Question Likert Component
 * For Likert scale questions (5-point or 10-point scales) with optional comment field (V5.0)
 * Supports both simple scales and multiple items
 */

import { Question, AnswerValue } from '@/types/questionnaire';
import CommentField from './CommentField';

interface QuestionLikertProps {
  question: Question;
  value: AnswerValue | Record<string, number>; // Support both old and new format
  onChange: (value: AnswerValue) => void;
}

export default function QuestionLikert({ question, value, onChange }: QuestionLikertProps) {
  const scaleSize = question.type === 'likert_10' ? 10 : 5;
  const scalePoints = Array.from({ length: scaleSize }, (_, i) => i + 1);

  // Normalize items to array (can be string or string[])
  const items: string[] = Array.isArray(question.items)
    ? question.items
    : (question.items ? question.items.split(',').map((s: string) => s.trim()) : []);

  // Normalize value to AnswerValue format
  const normalizedValue: AnswerValue = (value && typeof value === 'object' && 'value' in value)
    ? value as AnswerValue
    : { value: value || {}, comment: '' };

  // Parse scale labels (e.g., "Très difficiles → Très harmonieuses")
  const parseScaleLabels = (labels: string): { min: string; max: string } => {
    if (!labels) return { min: '', max: '' };

    // Handle format: "1 = Min → 10 = Max" or "Min → Max"
    const parts = labels.split('→').map(s => s.trim());
    if (parts.length === 2) {
      const min = parts[0].replace(/^\d+\s*=\s*/, '');
      const max = parts[1].replace(/^\d+\s*=\s*/, '');
      return { min, max };
    }
    return { min: '', max: '' };
  };

  const handleChange = (itemKey: string, scaleValue: number) => {
    onChange({
      ...normalizedValue,
      value: {
        ...(normalizedValue.value as Record<string, number>),
        [itemKey]: scaleValue,
      },
    });
  };

  const handleCommentChange = (comment: string) => {
    onChange({
      ...normalizedValue,
      comment,
    });
  };

  // Simple Likert scale (one scale with labels)
  if (items.length === 0 && question.scale_labels) {
    const labels = parseScaleLabels(question.scale_labels);
    const itemKey = 'value';
    const scaleValue = normalizedValue.value as Record<string, number>;

    return (
      <div className="space-y-4">
        <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels.min}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels.max}</span>
          </div>

          {/* Mobile-optimized: Force horizontal scroll for Likert-10 */}
          <div className={`${
            scaleSize === 10
              ? 'overflow-x-scroll overflow-y-hidden -mx-4 px-4 pb-2' // Force scroll + negative margin to break parent padding
              : ''
          } w-full`}>
            <div className={`${
              scaleSize === 10
                ? 'flex items-center gap-3 w-max' // Force width to content (520px for 10 buttons)
                : 'flex items-center justify-between gap-2' // Fit layout for 5-point scales
            }`}>
              {scalePoints.map((point) => (
                <label
                  key={point}
                  className="flex flex-col items-center cursor-pointer group touch-manipulation"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={point}
                    checked={scaleValue[itemKey] === point}
                    onChange={() => handleChange(itemKey, point)}
                    className="sr-only"
                    required={question.required}
                  />
                  <div
                    className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      scaleValue[itemKey] === point
                        ? 'bg-shinkofa-marine dark:bg-secondary-500 text-white scale-110'
                        : 'bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-200 group-hover:border-shinkofa-marine dark:group-hover:border-secondary-400 group-hover:scale-105'
                    }`}
                  >
                    {point}
                  </div>
                </label>
              ))}
            </div>
          </div>
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

  // Multiple Likert items (e.g., Chaleureuse/Froide, Calme/Conflictuelle)
  const scaleValue = normalizedValue.value as Record<string, number>;

  return (
    <div className="space-y-4">
      <div className="mt-6 space-y-6">
        {items.map((item: string, itemIndex: number) => {
          // Parse item labels (e.g., "Chaleureuse/Froide")
          const [minLabel, maxLabel] = item.split('/').map(s => s.trim());
          const itemKey = `item_${itemIndex}`;

          return (
            <div key={itemIndex} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{minLabel}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{maxLabel}</span>
              </div>

              {/* Mobile-optimized: Force horizontal scroll for Likert-10 */}
              <div className={`${
                scaleSize === 10
                  ? 'overflow-x-scroll overflow-y-hidden -mx-2 px-2 pb-2' // Force scroll
                  : ''
              } w-full`}>
                <div className={`${
                  scaleSize === 10
                    ? 'flex items-center gap-3 w-max' // Force width to content
                    : 'flex items-center justify-between gap-2' // Fit layout for 5-point scales
                }`}>
                  {scalePoints.map((point) => (
                    <label
                      key={point}
                      className="flex flex-col items-center cursor-pointer group touch-manipulation"
                    >
                      <input
                        type="radio"
                        name={`${question.id}_${itemKey}`}
                        value={point}
                        checked={scaleValue[itemKey] === point}
                        onChange={() => handleChange(itemKey, point)}
                        className="sr-only"
                        required={question.required}
                      />
                      <div
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          scaleValue[itemKey] === point
                            ? 'bg-shinkofa-marine dark:bg-secondary-500 text-white scale-110'
                            : 'bg-white dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-200 group-hover:border-shinkofa-marine dark:group-hover:border-secondary-400 group-hover:scale-105'
                        }`}
                      >
                        {point}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
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
