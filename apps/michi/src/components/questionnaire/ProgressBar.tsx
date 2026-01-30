/**
 * Progress Bar Component
 * Visual indicator of questionnaire completion
 */

interface ProgressBarProps {
  current: number;
  total: number;
  blocTitle?: string;
}

export default function ProgressBar({ current, total, blocTitle }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {blocTitle && `${blocTitle} - `}
          Question {current} sur {total}
        </span>
        <span className="text-sm font-medium text-indigo-600">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
