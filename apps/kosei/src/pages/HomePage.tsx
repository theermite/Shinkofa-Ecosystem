import { Button, Card, CardHeader, CardBody } from '@shinkofa/ui';
import { useTranslation, useLocale } from '@shinkofa/i18n';
import {
  useMorphic,
  useEnergyLevel,
  useDesignHumainGuidance,
} from '@shinkofa/morphic-engine';
import { Brain, Sparkles, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const { locale, changeLanguage } = useLocale();
  const { adaptation } = useMorphic();
  const { energyLevel, isOptimal } = useEnergyLevel();
  const { type, recommendations } = useDesignHumainGuidance();

  return (
    <div className="min-h-screen bg-beige-sable dark:bg-bleu-fonce p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-accent-lumineux" />
              <h1 className="text-3xl font-bold text-bleu-profond dark:text-blanc-pur">
                Shizen
              </h1>
            </div>

            {/* Language Selector */}
            <div className="flex gap-2">
              {(['fr', 'en', 'es'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={locale === lang ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => changeLanguage(lang)}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader
            title="Bienvenue sur Shizen"
            subtitle="Ton compagnon IA personnalisé"
          />
          <CardBody>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-dore-principal" />
              <p className="text-bleu-profond/80 dark:text-blanc-pur/80">
                Shizen s'adapte à ton profil holistique pour t'accompagner au quotidien
              </p>
            </div>

            {/* Energy Level Indicator */}
            {adaptation && (
              <div className="flex items-center gap-3 p-4 bg-beige-sable/50 dark:bg-bleu-profond/30 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOptimal
                      ? 'bg-green-500 animate-pulse'
                      : energyLevel === 'low'
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                />
                <span className="text-sm text-bleu-profond dark:text-blanc-pur">
                  Niveau d'énergie:{' '}
                  <strong>
                    {energyLevel === 'optimal'
                      ? 'Optimal'
                      : energyLevel === 'low'
                      ? 'Faible'
                      : 'Normal'}
                  </strong>
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Design Humain Guidance (if profile exists) */}
        {type && recommendations && (
          <Card variant="bordered" padding="lg" className="mb-6">
            <CardHeader title={`Design Humain: ${type}`} />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                    Guidance pour la prise de décision
                  </h4>
                  <p className="text-bleu-profond/80 dark:text-blanc-pur/80 text-sm">
                    {recommendations.decisionMakingGuidance}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                    Style de travail
                  </h4>
                  <p className="text-bleu-profond/80 dark:text-blanc-pur/80 text-sm">
                    {recommendations.workStyle}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Chat Interface (Placeholder) */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Discute avec Shizen" />
          <CardBody>
            <div className="flex items-center gap-3 p-6 bg-beige-sable/50 dark:bg-bleu-profond/30 rounded-lg text-center">
              <MessageSquare className="w-6 h-6 text-accent-lumineux" />
              <p className="text-bleu-profond/60 dark:text-blanc-pur/60">
                Interface de chat à venir
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
