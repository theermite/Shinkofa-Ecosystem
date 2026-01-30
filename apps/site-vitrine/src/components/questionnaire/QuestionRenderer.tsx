/**
 * Composant pour rendre différents types de questions
 */

import type { Question, QuestionAnswer } from '../../types/questionnaire';

interface QuestionRendererProps {
  question: Question;
  answer: QuestionAnswer | undefined;
  onChange: (value: string | string[] | number) => void;
}

export function QuestionRenderer({ question, answer, onChange }: QuestionRendererProps) {
  const currentValue = answer?.value ?? '';

  switch (question.type) {
    case 'text':
      return (
        <input
          type={question.id === 'email' ? 'email' : 'text'}
          id={question.id}
          value={currentValue as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          required={question.required}
          className="w-full px-4 py-3 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur focus:border-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux/20 transition-all"
          aria-required={question.required}
          aria-describedby={question.description ? `${question.id}-desc` : undefined}
        />
      );

    case 'textarea':
      return (
        <textarea
          id={question.id}
          value={currentValue as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          required={question.required}
          rows={5}
          className="w-full px-4 py-3 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur focus:border-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux/20 transition-all resize-vertical"
          aria-required={question.required}
          aria-describedby={question.description ? `${question.id}-desc` : undefined}
        />
      );

    case 'radio':
      return (
        <div className="space-y-3" role="radiogroup" aria-required={question.required}>
          {question.options?.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <label
                key={optionValue}
                className="flex items-start p-4 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce hover:border-accent-lumineux cursor-pointer transition-all bg-blanc-pur dark:bg-bleu-profond has-[:checked]:border-accent-lumineux has-[:checked]:bg-accent-lumineux/5"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={optionValue}
                  checked={currentValue === optionValue}
                  onChange={(e) => onChange(e.target.value)}
                  required={question.required}
                  className="mt-1 w-4 h-4 text-accent-lumineux focus:ring-accent-lumineux focus:ring-2 border-beige-sable dark:border-bleu-fonce"
                />
                <span className="ml-3 text-bleu-profond dark:text-blanc-pur">{optionLabel}</span>
              </label>
            );
          })}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-3" role="group" aria-required={question.required}>
          {question.options?.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <label
                key={optionValue}
                className="flex items-start p-4 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce hover:border-accent-lumineux cursor-pointer transition-all bg-blanc-pur dark:bg-bleu-profond has-[:checked]:border-accent-lumineux has-[:checked]:bg-accent-lumineux/5"
              >
                <input
                  type="checkbox"
                  name={question.id}
                  value={optionValue}
                  checked={Array.isArray(currentValue) && currentValue.includes(optionValue)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentValue) ? currentValue : [];
                    if (e.target.checked) {
                      onChange([...currentArray, optionValue]);
                    } else {
                      onChange(currentArray.filter(v => v !== optionValue));
                    }
                  }}
                  className="mt-1 w-4 h-4 text-accent-lumineux focus:ring-accent-lumineux focus:ring-2 rounded border-beige-sable dark:border-bleu-fonce"
                />
                <span className="ml-3 text-bleu-profond dark:text-blanc-pur">{optionLabel}</span>
              </label>
            );
          })}
        </div>
      );

    case 'scale':
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              {question.min} - Très facile
            </span>
            <span className="text-2xl font-bold text-accent-lumineux">
              {currentValue || question.min}
            </span>
            <span className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              {question.max} - Très difficile
            </span>
          </div>
          <input
            type="range"
            id={question.id}
            min={question.min}
            max={question.max}
            value={(currentValue as number) || question.min}
            onChange={(e) => onChange(Number(e.target.value))}
            required={question.required}
            className="w-full h-3 bg-beige-sable dark:bg-bleu-fonce rounded-full appearance-none cursor-pointer accent-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux focus:ring-offset-2"
            aria-required={question.required}
            aria-valuemin={question.min}
            aria-valuemax={question.max}
            aria-valuenow={(currentValue as number) || question.min}
            aria-describedby={question.description ? `${question.id}-desc` : undefined}
          />
          <div className="flex justify-between text-xs text-bleu-profond/40 dark:text-blanc-pur/40">
            {Array.from({ length: (question.max ?? 10) - (question.min ?? 1) + 1 }, (_, i) => (
              <span key={i}>{(question.min ?? 1) + i}</span>
            ))}
          </div>
        </div>
      );

    case 'number':
      return (
        <input
          type="number"
          id={question.id}
          value={currentValue as number || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={question.min}
          max={question.max}
          required={question.required}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur focus:border-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux/20 transition-all"
          aria-required={question.required}
          aria-describedby={question.description ? `${question.id}-desc` : undefined}
        />
      );

    case 'likert-pairs':
      return (
        <div className="space-y-6">
          {question.pairs?.map((pair, index) => {
            const pairKey = `${question.id}_pair_${index}`;
            const pairValue = Array.isArray(currentValue) ? (Number(currentValue[index]) || 3) : 3;

            return (
              <div key={pairKey} className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-bleu-profond dark:text-blanc-pur">
                  <span>{pair.left}</span>
                  <span className="text-accent-lumineux">{pairValue}</span>
                  <span>{pair.right}</span>
                </div>
                <input
                  type="range"
                  id={pairKey}
                  min={1}
                  max={5}
                  value={pairValue}
                  onChange={(e) => {
                    const newValues = Array.isArray(currentValue) ? [...currentValue] : Array(question.pairs?.length || 0).fill(3);
                    newValues[index] = Number(e.target.value);
                    onChange(newValues);
                  }}
                  className="w-full h-3 bg-beige-sable dark:bg-bleu-fonce rounded-full appearance-none cursor-pointer accent-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux focus:ring-offset-2"
                  aria-label={`${pair.left} à ${pair.right}`}
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={pairValue}
                />
                <div className="flex justify-between text-xs text-bleu-profond/40 dark:text-blanc-pur/40">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          id={question.id}
          value={currentValue as string}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-4 py-3 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur focus:border-accent-lumineux focus:outline-none focus:ring-2 focus:ring-accent-lumineux/20 transition-all"
          aria-required={question.required}
        />
      );

    default:
      return <p className="text-red-500">Type de question non supporté : {question.type}</p>;
  }
}
