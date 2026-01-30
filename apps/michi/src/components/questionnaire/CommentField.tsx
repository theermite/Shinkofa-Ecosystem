/**
 * Comment Field Component
 * Optional comment field for questions with comment_allowed = true
 */

interface CommentFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CommentField({ value, onChange, placeholder }: CommentFieldProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
      <label className="block mb-2">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-base">💬</span>
          <span>Commentaire libre (optionnel)</span>
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
          Ajoutez des précisions, nuances ou exemples concrets si vous le souhaitez
        </span>
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Partagez vos pensées, exemples, contexte..."}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-shinkofa-marine dark:focus:ring-secondary-400 focus:border-transparent resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Les commentaires enrichissent votre analyse
        </p>
        {value && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            {value.length} caractères
          </p>
        )}
      </div>
    </div>
  );
}
