/**
 * Question Name Split Component
 * Special component for Question 1 - Name question with separate surname and first names
 * V5.1 - Ensures proper name extraction for holistic profile
 * i18n - Supports FR/EN/ES
 */

import { Question, AnswerValue } from '@/types/questionnaire';
import { useTranslations } from 'next-intl';

interface QuestionNameSplitProps {
  question: Question;
  value: AnswerValue | string;
  onChange: (value: AnswerValue) => void;
}

interface NameValue {
  lastName: string;
  firstName: string;
}

export default function QuestionNameSplit({ question, value, onChange }: QuestionNameSplitProps) {
  const t = useTranslations('questionnaire.nameSplit');

  // Parse value - could be old format (string) or new format (AnswerValue with NameValue)
  const parseValue = (): NameValue => {
    if (!value) return { lastName: '', firstName: '' };

    // Handle AnswerValue format
    if (typeof value === 'object' && 'value' in value) {
      const answerValue = value as { value: unknown; comment?: string };

      // PRIORITY: Try to get structured data from comment field (contains JSON with separate fields)
      // This is the reliable source as it preserves lastName/firstName separately
      if (answerValue.comment) {
        try {
          const parsed = JSON.parse(answerValue.comment);
          if (parsed && typeof parsed === 'object' && ('lastName' in parsed || 'firstName' in parsed)) {
            return {
              lastName: parsed.lastName || '',
              firstName: parsed.firstName || '',
            };
          }
        } catch {
          // Invalid JSON, fall through to other methods
        }
      }

      const innerValue = answerValue.value;
      // If value is already NameValue object
      if (typeof innerValue === 'object' && innerValue !== null && 'lastName' in innerValue) {
        return innerValue as NameValue;
      }
      // If value is string "FirstName LastName" - only use as fallback for legacy data
      if (typeof innerValue === 'string' && innerValue.includes(' ')) {
        const parts = innerValue.split(' ');
        if (parts.length >= 2) {
          // Assume format: "FirstName(s) LastName"
          const lastName = parts[parts.length - 1];
          const firstName = parts.slice(0, -1).join(' ');
          return { lastName, firstName };
        }
      }
      // Single word without space - don't assume it's firstName (could be lastName)
      // Return empty and let user fill both fields
      return { lastName: '', firstName: '' };
    }

    // Handle old string format (legacy)
    if (typeof value === 'string') {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        const lastName = parts[parts.length - 1];
        const firstName = parts.slice(0, -1).join(' ');
        return { lastName, firstName };
      }
      // Single word - don't assume which field it belongs to
      return { lastName: '', firstName: '' };
    }

    return { lastName: '', firstName: '' };
  };

  const nameValue = parseValue();

  const handleChange = (field: 'lastName' | 'firstName', newValue: string) => {
    const updatedName: NameValue = {
      ...nameValue,
      [field]: newValue,
    };

    // Store as both structured object AND concatenated string for compatibility
    // The string format "FirstName LastName" is used by the backend
    const fullName = `${updatedName.firstName} ${updatedName.lastName}`.trim();

    onChange({
      value: fullName, // String for backend compatibility
      comment: JSON.stringify(updatedName), // Store structured data in comment for recovery
    });
  };

  return (
    <div className="space-y-6">
      {/* Last Name (Nom de famille) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('lastName.label')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nameValue.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-shinkofa-marine dark:focus:border-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 px-4 py-3 text-lg"
          placeholder={t('lastName.placeholder')}
          required={question.required}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('lastName.help')}
        </p>
      </div>

      {/* First Names (Prenoms) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('firstName.label')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nameValue.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-shinkofa-marine dark:focus:border-secondary-400 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 px-4 py-3 text-lg"
          placeholder={t('firstName.placeholder')}
          required={question.required}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('firstName.help')}
        </p>
      </div>

      {/* Preview */}
      {(nameValue.firstName || nameValue.lastName) && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <span className="font-semibold">{t('preview.label')}:</span>{' '}
            <span className="font-bold">{nameValue.firstName} {nameValue.lastName}</span>
          </p>
        </div>
      )}
    </div>
  );
}
