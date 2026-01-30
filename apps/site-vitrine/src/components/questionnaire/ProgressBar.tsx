/**
 * Barre de progression pour le questionnaire
 */

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-bleu-profond dark:text-blanc-pur">
          Question {current} sur {total}
        </span>
        <span className="text-sm font-medium text-accent-lumineux">
          {percentage}%
        </span>
      </div>
      <div className="w-full h-3 bg-beige-sable dark:bg-bleu-fonce rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-lumineux to-dore-principal transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progression du questionnaire : ${percentage} pourcent`}
        />
      </div>
    </div>
  );
}
