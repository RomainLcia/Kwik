import Link from 'next/link'

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">Kwik</Link>
          <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-900">Retour</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : avril 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Objet</h2>
          <p className="text-gray-600 leading-relaxed">Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service Kwik, application SaaS de création et gestion de devis professionnels, éditée par Kwik (ci-après « l'Éditeur »). Toute utilisation du service implique l'acceptation pleine et entière des présentes CGU.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description du service</h2>
          <p className="text-gray-600 leading-relaxed">Kwik est une application web permettant aux professionnels indépendants et petites entreprises de créer, envoyer et gérer des devis et factures professionnels, incluant la signature électronique et la conversion devis/facture.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accès au service</h2>
          <p className="text-gray-600 leading-relaxed mb-3">L'accès au service est réservé aux professionnels (entreprises, micro-entrepreneurs, travailleurs indépendants). L'utilisateur s'engage à fournir des informations exactes lors de son inscription et à maintenir ces informations à jour.</p>
          <p className="text-gray-600 leading-relaxed">Une période d'essai de 14 jours est proposée à tout nouvel utilisateur. À l'issue de cette période, l'accès aux fonctionnalités payantes est conditionné à la souscription d'un abonnement.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Abonnement et facturation</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Le service est proposé sous forme d'abonnement mensuel. Le tarif en vigueur est affiché sur la page de souscription. Le paiement est géré par Stripe et soumis aux conditions de ce prestataire.</p>
          <p className="text-gray-600 leading-relaxed">L'abonnement est résiliable à tout moment depuis l'espace de gestion. La résiliation prend effet à la fin de la période en cours.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Signature électronique</h2>
          <p className="text-gray-600 leading-relaxed">La signature électronique proposée par Kwik est une signature simple au sens du règlement eIDAS. Elle convient aux transactions courantes. Pour les montants supérieurs à 1 500 € ou les contrats à enjeux importants, l'Éditeur recommande le recours à une signature électronique avancée ou qualifiée auprès d'un prestataire de confiance agréé.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Données personnelles</h2>
          <p className="text-gray-600 leading-relaxed mb-3">L'Éditeur collecte et traite les données personnelles nécessaires au fonctionnement du service conformément au Règlement Général sur la Protection des Données (RGPD).</p>
          <p className="text-gray-600 leading-relaxed mb-3">Les données sont hébergées en Europe (Supabase). Elles ne sont pas cédées à des tiers à des fins commerciales.</p>
          <p className="text-gray-600 leading-relaxed">L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données. Pour exercer ces droits, contacter : <a href="mailto:contact@kwik-devis.fr" className="text-blue-600">contact@kwik-devis.fr</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Responsabilités</h2>
          <p className="text-gray-600 leading-relaxed mb-3">L'utilisateur est seul responsable du contenu des devis et factures générés via Kwik, ainsi que de leur conformité aux obligations légales qui lui sont applicables (mentions obligatoires, TVA, etc.).</p>
          <p className="text-gray-600 leading-relaxed">L'Éditeur ne saurait être tenu responsable des pertes de données en cas de force majeure, ni des dommages indirects résultant de l'utilisation du service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Propriété intellectuelle</h2>
          <p className="text-gray-600 leading-relaxed">L'ensemble des éléments constitutifs du service (interface, code, marque, logo) est la propriété exclusive de l'Éditeur. Toute reproduction ou utilisation sans autorisation préalable est interdite.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Modification des CGU</h2>
          <p className="text-gray-600 leading-relaxed">L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles CGU.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Droit applicable</h2>
          <p className="text-gray-600 leading-relaxed">Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p className="text-gray-600 leading-relaxed">Pour toute question relative aux présentes CGU : <a href="mailto:contact@kwik-devis.fr" className="text-blue-600">contact@kwik-devis.fr</a></p>
        </section>
      </div>
    </div>
  )
}
