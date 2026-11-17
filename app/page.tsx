import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KwikLogo } from '@/components/kwik-logo'
import { ArrowRight, Check, Clock, FileText, PenLine, Send, Smartphone, Zap, Euro } from 'lucide-react'

const PLANS = [
  {
    name: 'Basique',
    price: '19,99',
    quota: '10 devis par mois',
    features: ['Factures illimitées', 'Signature électronique', 'PDF à votre image', 'Envoi par email au client', 'Tableau de bord'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29,99',
    quota: '30 devis par mois',
    features: ['Factures illimitées', 'Signature électronique', 'PDF à votre image', 'Envoi par email au client', 'Tableau de bord', 'Support prioritaire'],
    highlighted: true,
  },
  {
    name: 'Illimité',
    price: '39,99',
    quota: 'Devis illimités',
    features: ['Factures illimitées', 'Signature électronique', 'PDF à votre image', 'Envoi par email au client', 'Tableau de bord', 'Support prioritaire'],
    highlighted: false,
  },
]

const STEPS = [
  { icon: Smartphone, title: 'Vous faites le devis', desc: 'Choisissez vos prestations dans votre catalogue, ajustez les quantités. Les totaux HT, TVA et TTC se calculent seuls.' },
  { icon: Send, title: 'Il part par email', desc: 'Votre client reçoit un email soigné avec le PDF en pièce jointe et un lien pour le consulter en ligne.' },
  { icon: PenLine, title: 'Le client signe en ligne', desc: 'Depuis son téléphone, sans créer de compte. Vous êtes prévenu, et le devis devient une facture en un clic.' },
]

const REASONS = [
  { icon: Clock, title: 'Répondez avant les autres', desc: 'Le devis part le jour même, depuis le chantier ou le rendez-vous. Le prospect n’a pas le temps d’aller voir ailleurs.' },
  { icon: Zap, title: 'Rien à apprendre', desc: 'Un écran pour le devis, un bouton pour l’envoyer. La prise en main se fait en dix minutes, quel que soit votre métier.' },
  { icon: FileText, title: 'Du devis à la facture sans ressaisie', desc: 'Une fois signé, le devis se transforme en facture avec les mêmes lignes et une numérotation qui se suit.' },
  { icon: Euro, title: 'Pour tous les métiers de prestation', desc: 'Peintre, photographe, coach, paysagiste, graphiste, consultant : si vous vendez du temps ou un savoir-faire, Kwik vous convient.' },
]

const LINES = [
  { label: 'Peinture murs, 2 couches', qty: '42 m²', total: '1 260,00' },
  { label: 'Préparation des surfaces', qty: '1 forfait', total: '300,00' },
  { label: 'Protection des sols', qty: '1 forfait', total: '150,00' },
]

// Aperçu d'un devis tel qu'il apparaît dans Kwik (exemple)
function QuotePreview() {
  return (
    <div className="relative">
      <div className="rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(14,17,23,0.04),0_12px_32px_-12px_rgba(14,17,23,0.18)] overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-gray-200">
          <span className="font-mono text-[13px] text-gray-900">DEV-2026-042</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Accepté
          </span>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-gray-200 text-[13px]">
          <div>
            <p className="text-gray-500">Client</p>
            <p className="text-gray-900 font-medium mt-0.5">Martin Dupont</p>
          </div>
          <div>
            <p className="text-gray-500">Objet</p>
            <p className="text-gray-900 font-medium mt-0.5">Peinture du salon</p>
          </div>
        </div>
        <div className="px-5 py-2">
          {LINES.map(line => (
            <div key={line.label} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0 text-[13px]">
              <div className="min-w-0">
                <p className="text-gray-900 truncate">{line.label}</p>
                <p className="text-gray-500 text-xs">{line.qty}</p>
              </div>
              <span className="tabular text-gray-900">{line.total} €</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 space-y-1 text-[13px]">
          <div className="flex justify-between text-gray-500"><span>Total HT</span><span className="tabular">1 710,00 €</span></div>
          <div className="flex justify-between text-gray-500"><span>TVA 10 %</span><span className="tabular">171,00 €</span></div>
          <div className="flex justify-between pt-1.5 text-gray-900 font-semibold">
            <span>Total TTC</span><span className="font-display tabular text-lg">1 881,00 €</span>
          </div>
        </div>
      </div>

      {/* Signature reçue */}
      <div className="absolute -bottom-16 left-4 right-4 sm:left-auto sm:-right-4 sm:w-64 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-[0_12px_32px_-12px_rgba(14,17,23,0.25)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900">Signé par Martin Dupont</p>
            <p className="text-xs text-gray-500">Aujourd’hui à 14:32, depuis son téléphone</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <KwikLogo size="sm" />
          <nav className="hidden md:flex items-center gap-7 text-[14px] text-gray-500" aria-label="Sections">
            <a href="#fonctionnement" className="hover:text-gray-900">Fonctionnement</a>
            <a href="#avantages" className="hover:text-gray-900">Avantages</a>
            <a href="#tarifs" className="hover:text-gray-900">Tarifs</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex h-9 items-center px-3 text-[14px] font-medium text-gray-700 hover:text-gray-900">
              Connexion
            </Link>
            <Link href="/signup">
              <Button className="h-9 px-4">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Accroche */}
      <section className="border-b border-gray-200 bg-[linear-gradient(to_right,var(--color-gray-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-gray-100)_1px,transparent_1px)] bg-[size:48px_48px]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-14 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[13px] text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
              Devis, signature et facture
            </p>
            <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl md:text-[64px] font-semibold mt-6 text-balance">
              Le devis en 3 minutes, <span className="text-blue-600">signé</span> le jour même.
            </h1>
            <p className="text-lg text-gray-500 mt-6 max-w-xl leading-relaxed">
              Kwik permet aux indépendants et aux petites entreprises de prestation de faire un devis propre, de l’envoyer, de le faire signer en ligne puis de le facturer. Depuis le téléphone, sur place.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-9">
              <Link href="/signup">
                <Button className="h-11 px-5 text-[15px] gap-2 w-full sm:w-auto">
                  Essayer 14 jours gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="inline-flex h-11 items-center justify-center px-4 text-[15px] font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap">
                J’ai déjà un compte
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-[13px] text-gray-500">
              {['Sans engagement', 'Résiliable en un clic', 'Prise en main en 10 minutes'].map(t => (
                <li key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gray-900" />{t}</li>
              ))}
            </ul>
          </div>

          <div className="pb-16 sm:pr-4">
            <QuotePreview />
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium text-blue-600">Fonctionnement</p>
          <h2 className="font-display text-3xl md:text-[40px] leading-tight font-semibold mt-2 text-balance">
            De la visite à la signature, sans repasser par le bureau
          </h2>
        </div>
        <ol className="grid md:grid-cols-3 mt-12 border-t border-gray-200">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className={`pt-8 pb-2 md:pr-8 ${i > 0 ? 'md:pl-8 md:border-l border-gray-200' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-gray-400 tabular">0{i + 1}</span>
                <Icon className="h-4 w-4 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-[15px] text-gray-500 mt-2 leading-relaxed">{desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Avantages */}
      <section id="avantages" className="bg-gray-50 border-y border-gray-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[13px] font-medium text-blue-600">Avantages</p>
            <h2 className="font-display text-3xl md:text-[40px] leading-tight font-semibold mt-2 text-balance">
              Moins de paperasse, plus de devis signés
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 mt-12 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {REASONS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`p-6 md:p-8 ${i % 2 === 1 ? 'sm:border-l' : ''} ${i > 0 ? 'border-t' : ''} ${i === 1 ? 'sm:border-t-0' : ''} border-gray-200`}
              >
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold mt-4">{title}</h3>
                <p className="text-[15px] text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium text-blue-600">Tarifs</p>
          <h2 className="font-display text-3xl md:text-[40px] leading-tight font-semibold mt-2">Trois formules, sans surprise</h2>
          <p className="text-gray-500 mt-3">14 jours gratuits sur chaque formule. Prix TTC, sans engagement.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-xl bg-white p-6 flex flex-col ${plan.highlighted ? 'border border-gray-900 ring-1 ring-gray-900' : 'border border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-semibold">{plan.name}</p>
                {plan.highlighted && <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600">Le plus choisi</span>}
              </div>
              <div className="flex items-baseline gap-1 mt-5">
                <span className="font-display tabular text-4xl font-semibold">{plan.price} €</span>
                <span className="text-sm text-gray-500">/ mois</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{plan.quota}</p>
              <ul className="space-y-2.5 mt-6 pt-5 border-t border-gray-200 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8">
                <Button variant={plan.highlighted ? 'default' : 'outline'} className="w-full h-10">Essayer gratuitement</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Appel final */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-[40px] leading-tight font-semibold text-white">Votre prochain devis part aujourd’hui.</h2>
            <p className="text-gray-400 mt-3 text-lg">Créez votre compte en une minute. Aucun prélèvement pendant 14 jours.</p>
          </div>
          <Link href="/signup">
            <Button className="h-11 px-5 text-[15px] gap-2 bg-white text-gray-900 hover:bg-gray-100 w-full md:w-auto">
              Commencer l’essai <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-gray-500">
          <KwikLogo size="sm" />
          <p>© 2026 Kwik. Le devis en 3 minutes.</p>
          <div className="flex gap-5">
            <Link href="/cgu" className="hover:text-gray-900">CGU</Link>
            <Link href="/login" className="hover:text-gray-900">Connexion</Link>
            <Link href="/signup" className="hover:text-gray-900">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
