/**
 * Page Conditions Générales de Vente (CGV)
 */

import { useTranslation } from 'react-i18next';

export function CGV() {
  const { t } = useTranslation();

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-8">
          {t('cgv.title')}
        </h1>

        <div className="card space-y-8">
          {/* Introduction */}
          <section>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>{t('cgv.intro')}</p>
              <p>{t('cgv.acceptance')}</p>
            </div>
          </section>

          {/* Éditeur */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              1. Éditeur et fournisseur de services
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-2">
              <p>
                <strong>Nom commercial :</strong> La Voie Shinkofa
              </p>
              <p>
                <strong>Fondateur et développeur :</strong> Jay "The Ermite"
              </p>
              <p>
                <strong>Siège social :</strong> Espagne
              </p>
              <p>
                <strong>Email :</strong>{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://shinkofa.com
                </a>
              </p>
            </div>
          </section>

          {/* Services proposés */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              2. Services proposés
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>Shinkofa propose un écosystème intelligent comprenant :</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>Questionnaire holistique :</strong> 155 questions pour établir votre
                  profil neurodivergent personnalisé (gratuit)
                </li>
                <li>
                  <strong>Shizen IA :</strong> Compagnon IA empathique et coach holistique adapté
                  aux neurodivergents
                </li>
                <li>
                  <strong>Planner Shinkofa :</strong> Système de planification intelligent respectant
                  vos cycles énergétiques (Design Humain)
                </li>
                <li>
                  <strong>Communauté :</strong> Accès aux espaces communautaires (Telegram, Discord)
                </li>
                <li>
                  <strong>Futures fonctionnalités :</strong> Outils créatifs, exercices cognitifs,
                  suite digitale complète
                </li>
              </ul>
              <p className="font-semibold text-accent-lumineux">
                Disclaimer : Shinkofa n'est pas un service médical. Les outils proposés sont
                conçus pour l'accompagnement personnel et le bien-être, mais ne remplacent en
                aucun cas un diagnostic ou un traitement médical professionnel. Consultez toujours
                un professionnel de santé pour des questions médicales.
              </p>
            </div>
          </section>

          {/* Tarifs et abonnements */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              3. Tarifs et abonnements
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                <strong>Offre Samurai Plan (offre complète) :</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Tarif standard : 19,99€/mois (TTC)</li>
                <li>
                  Offre Pionniers Alpha 2026 (100 premières places) : 14,99€/mois (TTC) à vie
                </li>
              </ul>
              <p>
                <strong>Questionnaire holistique :</strong> Gratuit pour tous les utilisateurs
              </p>
              <p className="font-semibold">
                Les tarifs sont indiqués en euros (€) et incluent la TVA applicable.
              </p>
              <p>
                Les prix peuvent être modifiés à tout moment, mais les abonnements en cours
                conservent leur tarif actuel jusqu'à résiliation. Les Pionniers Alpha conservent
                leur tarif réduit (-25%) à vie, tant qu'ils maintiennent leur abonnement actif.
              </p>
            </div>
          </section>

          {/* Modalités de paiement */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              4. Modalités de paiement
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong>Prestataire de paiement :</strong> Stripe (paiements sécurisés PCI-DSS)
                </li>
                <li>
                  <strong>Moyens de paiement acceptés :</strong> Cartes bancaires (CB, Visa,
                  Mastercard), prélèvement SEPA
                </li>
                <li>
                  <strong>Facturation :</strong> Mensuelle, renouvelée automatiquement chaque mois
                </li>
                <li>
                  <strong>Prélèvement :</strong> Le montant est prélevé à la date anniversaire de
                  votre abonnement
                </li>
                <li>
                  <strong>Facture :</strong> Disponible dans votre espace personnel après chaque
                  paiement
                </li>
              </ul>
              <p>
                Nous ne stockons aucune coordonnée bancaire sur nos serveurs. Toutes les
                transactions sont traitées de manière sécurisée par Stripe.
              </p>
            </div>
          </section>

          {/* Période d'essai et résiliation */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              5. Garantie satisfait ou remboursé et résiliation
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                <strong>Garantie 30 jours satisfait ou remboursé :</strong>
              </p>
              <p>
                Si vous n'êtes pas satisfait de nos services dans les 30 premiers jours suivant
                votre inscription, nous vous remboursons intégralement, sans poser de questions.
                Envoyez simplement un email à{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>{' '}
                avec la mention "Remboursement".
              </p>
              <p>
                <strong>Résiliation de l'abonnement :</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  Vous pouvez résilier votre abonnement à tout moment depuis votre espace
                  personnel
                </li>
                <li>La résiliation prend effet à la fin de la période en cours (pas de prorata)</li>
                <li>
                  Après résiliation, vous conservez l'accès aux services jusqu'à la date de fin de
                  facturation
                </li>
                <li>
                  <strong>Pionniers Alpha :</strong> Si vous résiliez votre abonnement Pionnier
                  Alpha, vous perdez définitivement le tarif réduit (-25%). En cas de
                  réabonnement ultérieur, le tarif standard de 19,99€/mois s'appliquera.
                </li>
              </ul>
            </div>
          </section>

          {/* Droit de rétractation */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              6. Droit de rétractation (14 jours légaux)
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                Conformément à la législation européenne, vous disposez d'un délai de 14 jours à
                compter de la souscription pour exercer votre droit de rétractation, sans avoir à
                justifier de motifs ni à payer de pénalités.
              </p>
              <p>
                Pour exercer ce droit, contactez-nous à{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
                .
              </p>
              <p>
                Ce droit de rétractation s'ajoute à notre garantie "satisfait ou remboursé 30
                jours".
              </p>
            </div>
          </section>

          {/* Obligations de l'utilisateur */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              7. Obligations de l'utilisateur
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>En utilisant nos services, vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Fournir des informations exactes et à jour lors de votre inscription</li>
                <li>
                  Maintenir la confidentialité de vos identifiants de connexion (email, mot de
                  passe)
                </li>
                <li>
                  Ne pas partager votre compte avec des tiers (un abonnement = un utilisateur)
                </li>
                <li>
                  Utiliser les services de manière conforme à la loi et dans le respect d'autrui
                </li>
                <li>
                  Ne pas tenter d'accéder à des parties du système auxquelles vous n'êtes pas
                  autorisé
                </li>
                <li>Ne pas utiliser les services à des fins illégales ou frauduleuses</li>
              </ul>
            </div>
          </section>

          {/* Disponibilité et maintenance */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              8. Disponibilité et maintenance
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                Nous nous efforçons d'assurer une disponibilité optimale de nos services 24h/24,
                7j/7. Cependant, nous ne pouvons garantir une disponibilité absolue en raison de :
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Opérations de maintenance programmées (vous serez prévenus à l'avance)</li>
                <li>Cas de force majeure (pannes réseau, défaillances matérielles, etc.)</li>
                <li>
                  Mises à jour critiques de sécurité (peuvent nécessiter une interruption brève)
                </li>
              </ul>
              <p>
                En cas d'interruption prolongée (plus de 48h cumulées sur un mois), un
                remboursement prorata du mois en cours pourra être demandé.
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              9. Propriété intellectuelle
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                L'ensemble des éléments de la plateforme Shinkofa (logos, graphismes, textes,
                code, IA, algorithmes) sont la propriété exclusive de La Voie Shinkofa, sauf
                mention contraire.
              </p>
              <p>
                Toute reproduction, distribution ou utilisation commerciale sans autorisation
                expresse est strictement interdite.
              </p>
              <p>
                <strong>Vos données personnelles vous appartiennent :</strong> Vous conservez
                l'entière propriété des données que vous saisissez (réponses au questionnaire,
                contenus créés). Vous pouvez les exporter ou les supprimer à tout moment.
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              10. Limitation de responsabilité
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>La Voie Shinkofa ne peut être tenue responsable :</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  De l'utilisation inappropriée des services par l'utilisateur (Shinkofa n'est pas
                  un service médical)
                </li>
                <li>Des dommages résultant d'une interruption temporaire des services</li>
                <li>
                  Des pertes de données résultant d'une faute de l'utilisateur (ex : suppression
                  volontaire de compte)
                </li>
                <li>
                  Des dysfonctionnements causés par des équipements ou connexions Internet de
                  l'utilisateur
                </li>
              </ul>
              <p className="font-semibold">
                Disclaimer médical : Les conseils et suggestions fournis par l'IA Shizen et les
                outils Shinkofa sont destinés à l'accompagnement personnel et au bien-être, mais
                ne remplacent en aucun cas un diagnostic, traitement ou avis médical professionnel.
                En cas de problème de santé, consultez toujours un professionnel qualifié.
              </p>
            </div>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              11. Protection des données personnelles (RGPD)
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                Vos données personnelles sont traitées conformément au RGPD et à notre Politique
                de Confidentialité (
                <a
                  href="/politique-confidentialite"
                  className="text-accent-lumineux hover:underline"
                >
                  consultable ici
                </a>
                ).
              </p>
              <p className="font-semibold text-accent-lumineux">
                Engagement fondamental : Vos données ne seront JAMAIS revendues ou utilisées à des
                fins commerciales. SI cette règle change, tous les utilisateurs seront prévenus et
                cela ne sera fait qu'avec votre consentement explicite.
              </p>
              <p>
                Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité
                et d'opposition sur vos données. Pour exercer ces droits :{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
            </div>
          </section>

          {/* Modifications des CGV */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              12. Modifications des CGV
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                Nous nous réservons le droit de modifier les présentes CGV à tout moment. En cas
                de modification substantielle, vous serez informé par email et/ou notification sur
                la plateforme au moins 30 jours avant l'entrée en vigueur des nouvelles
                conditions.
              </p>
              <p>
                Si vous refusez les nouvelles CGV, vous pouvez résilier votre abonnement avant
                leur entrée en vigueur et obtenir un remboursement prorata de la période non
                utilisée.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              13. Droit applicable et litiges
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>
                Les présentes CGV sont régies par le droit espagnol et européen. En cas de litige, une
                solution amiable sera recherchée avant toute action judiciaire.
              </p>
              <p>
                En l'absence d'accord amiable, les tribunaux espagnols seront seuls compétents.
              </p>
              <p>
                Conformément à la réglementation européenne, vous pouvez également recourir à la
                plateforme de règlement des litiges en ligne de la Commission européenne :{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              14. Contact
            </h2>
            <div className="text-bleu-profond/80 dark:text-blanc-pur/80 space-y-3">
              <p>Pour toute question concernant ces CGV ou nos services :</p>
              <p>
                <strong>Email :</strong>{' '}
                <a
                  href="mailto:contact@shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                >
                  contact@shinkofa.com
                </a>
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://shinkofa.com"
                  className="text-accent-lumineux hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://shinkofa.com
                </a>
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60">
              <strong>{t('cgv.lastUpdate')}</strong> {t('cgv.january2026')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
