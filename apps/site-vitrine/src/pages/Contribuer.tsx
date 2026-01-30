/**
 * Page Contribuer - Offres de soutien au projet Shinkofa
 */

export function Contribuer() {
  return (
    <div className="container-shinkofa py-12">
      {/* En-tête */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          Rejoins l'Aventure Shinkofa
        </h1>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 max-w-3xl mx-auto">
          Shinkofa se construit avec sa communauté. Plusieurs façons de participer et de soutenir le projet.
        </p>
      </section>

      {/* Packs de Contribution */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-4">
          Packs de Contribution
        </h2>
        <p className="text-center text-bleu-profond/80 dark:text-blanc-pur/80 mb-12 max-w-3xl mx-auto">
          Aide-nous à développer et à maintenir Shinkofa accessible à tous les neurodivergents. Choisis le pack qui résonne avec toi.
        </p>

        {/* Soutien Libre */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card text-center bg-gradient-to-br from-accent-doux/10 to-transparent">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              Soutien Libre
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Contribue au montant de ton choix pour soutenir le développement de Shinkofa. Chaque geste compte !
            </p>
            <a
              href="https://www.paypal.com/donate/?hosted_button_id=T72J2876UEUKE"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              💙 Don Libre via PayPal
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Explorateur Mensuel */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
                🧭 Explorateur Mensuel
              </h3>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Contribution mensuelle pour soutenir le développement continu de Shinkofa.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://donate.stripe.com/9B6fZh0og3Ca5Sa3xsbjW05"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                💳 Payer par Carte
              </a>
              <a
                href="https://www.patreon.com/cw/TheErmite"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                🎨 Patreon
              </a>
            </div>
          </div>

          {/* Ambassadeur Mensuel */}
          <div className="card border-2 border-accent-lumineux">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
                👑 Ambassadeur Mensuel
              </h3>
              <span className="text-sm px-3 py-1 bg-accent-lumineux text-blanc-pur rounded-full">
                Populaire
              </span>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Contribution mensuelle renforcée avec reconnaissance spéciale dans la communauté.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://donate.stripe.com/8x26oH6MEgoW6We1pkbjW06"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                💳 Payer par Carte
              </a>
              <a
                href="https://www.patreon.com/cw/TheErmite"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                🎨 Patreon
              </a>
            </div>
          </div>

          {/* Visionnaire Lifetime */}
          <div className="card bg-gradient-to-br from-accent-lumineux/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
                ⭐ Visionnaire Lifetime
              </h3>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Contribution unique pour un accès lifetime à l'écosystème Shinkofa.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.paypal.com/donate/?hosted_button_id=4YNDEGGLH78X6"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                💙 PayPal
              </a>
              <a
                href="https://donate.stripe.com/eVq3cv9YQ6OmcgygkebjW07"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                💳 Payer par Carte
              </a>
            </div>
          </div>

          {/* Légende Lifetime */}
          <div className="card bg-gradient-to-br from-accent-lumineux/10 to-transparent border-2 border-accent-lumineux">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur">
                🏆 Légende Lifetime
              </h3>
              <span className="text-sm px-3 py-1 bg-accent-lumineux text-blanc-pur rounded-full">
                Elite
              </span>
            </div>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Contribution unique maximale avec reconnaissance permanente et avantages exclusifs lifetime.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.paypal.com/donate/?hosted_button_id=W8ZTD4BU6ZY2L"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                💙 PayPal
              </a>
              <a
                href="https://donate.stripe.com/8x25kD9YQ5KieoGaZUbjW08"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center"
              >
                💳 Payer par Carte
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-bleu-profond/50 dark:text-blanc-pur/50 max-w-2xl mx-auto">
          💝 Toutes les contributions sont gérées de manière transparente et sécurisée.
          Merci de croire en la vision Shinkofa !
        </p>
      </section>

      {/* Autres moyens de contribuer */}
      <section className="py-12 border-t border-beige-sable dark:border-bleu-fonce">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-12">
          Autres Moyens de Contribuer
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Bêta-Testeur */}
          <div className="card">
            <div className="text-4xl mb-4">🧪</div>
            <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              Devenir Bêta-Testeur
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Sois parmi les premiers à tester les nouvelles fonctionnalités et à influencer directement le développement de Shinkofa.
            </p>
            <a href="mailto:contact@shinkofa.com?subject=Candidature Bêta-Testeur" className="btn-primary inline-block">
              Candidater
            </a>
          </div>

          {/* Partage d'Expérience */}
          <div className="card">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              Partage ton Expérience
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Ton témoignage peut aider d'autres neurodivergents à se sentir moins seuls et à mieux se comprendre.
            </p>
            <ul className="space-y-2 text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Témoignage anonyme ou public</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Contribue à la documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Aide la communauté</span>
              </li>
            </ul>
            <a href="mailto:contact@shinkofa.com?subject=Partage de Témoignage" className="btn-primary inline-block">
              Partager
            </a>
          </div>

          {/* Communauté */}
          <div className="card">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
              Rejoindre la Communauté
            </h3>
            <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              Participe aux discussions, partage tes idées et construis Shinkofa avec nous. La communauté est active sur Telegram !
            </p>
            <ul className="space-y-2 text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Groupe Telegram actif</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Discord communautaire (bientôt)</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-lumineux mr-2">✓</span>
                <span>Événements en ligne et entraide</span>
              </li>
            </ul>
            <a
              href="https://t.me/+ZOl7NJphLEw4YzQ0"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              💬 Rejoindre le Telegram
            </a>
          </div>
        </div>
      </section>

      {/* CTA Contact */}
      <section className="py-12 text-center border-t border-beige-sable dark:border-bleu-fonce mt-12">
        <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
          Une Autre Idée ?
        </h2>
        <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6 max-w-2xl mx-auto">
          Tu as une idée de contribution qui ne rentre dans aucune de ces catégories ? On serait ravi d'en discuter !
        </p>
        <a href="mailto:contact@shinkofa.com" className="btn-primary inline-block">
          Nous Contacter
        </a>
      </section>

      {/* Valeurs */}
      <section className="py-12 border-t border-beige-sable dark:border-bleu-fonce mt-12">
        <h2 className="text-3xl font-bold text-center text-bleu-profond dark:text-blanc-pur mb-8">
          Nos Valeurs
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">Authenticité</h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              Honorer son design unique
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">Croissance</h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              Amélioration continue (Kaizen)
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-bold text-bleu-profond dark:text-blanc-pur mb-2">Neurodiversité</h3>
            <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
              Force dans la différence
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
