import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Smartphone, FileText, Star, ArrowRight, Zap, Send, Euro } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">Kwik</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <Star className="h-3.5 w-3.5 fill-blue-700" />
          14 jours gratuits
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Le devis en 3 minutes<br />
          <span className="text-blue-600">où que vous soyez</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Pour tous les indépendants et petites entreprises qui vendent des prestations : devis pro, PDF brandé, signature électronique et suivi en temps réel — depuis votre téléphone.
        </p>
        <div className="flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base px-8 py-6">
              Commencer gratuitement <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">14 jours gratuits · Annulable à tout moment</p>
      </section>

      {/* Mockup app */}
      <section id="demo" className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl p-6 md:p-10">
          <p className="text-center text-sm font-medium text-blue-600 mb-6 uppercase tracking-wide">L'app en action</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Écran 1 — Nouveau devis */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-blue-600 px-4 py-3">
                <p className="text-white text-xs font-semibold">Nouveau devis</p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Client</p>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-800">Martin Dupont</div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Prestations</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Peinture mur 2 couches', price: '1 500 €' },
                      { label: 'Préparation surface', price: '300 €' },
                      { label: 'Protection sol', price: '150 €' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-700">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-xs text-gray-500">Total TTC</span>
                  <span className="text-sm font-bold text-blue-600">1 950 €</span>
                </div>
                <div className="bg-blue-600 text-white text-center text-xs font-semibold py-2 rounded-lg">
                  Envoyer par email →
                </div>
              </div>
            </div>

            {/* Écran 2 — Email reçu */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gray-800 px-4 py-3">
                <p className="text-white text-xs font-semibold">Email reçu par le client</p>
              </div>
              <div className="p-4">
                <div className="bg-blue-600 rounded-t-xl p-4 text-white text-center mb-0">
                  <p className="font-bold text-sm">Martin Conseil</p>
                  <p className="text-xs opacity-80 mt-0.5">vous a envoyé un devis</p>
                </div>
                <div className="border border-t-0 border-gray-100 rounded-b-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-900">Devis n° DEV-2026-042</p>
                  <p className="text-xs text-gray-500">Objet : Travaux de peinture salon</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">Montant :</span>
                    <span className="text-lg font-bold text-blue-600">1 950 €</span>
                  </div>
                  <div className="bg-blue-600 text-white text-center text-xs font-semibold py-2 rounded-lg">
                    Consulter le devis →
                  </div>
                  <p className="text-xs text-gray-400 text-center">Valable jusqu&apos;au 22 mai 2026</p>
                </div>
              </div>
            </div>

            {/* Écran 3 — Signature */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-green-600 px-4 py-3">
                <p className="text-white text-xs font-semibold">Signature client</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Prestations</p>
                  {['Peinture mur 2 couches', 'Préparation surface', 'Protection sol'].map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-xs text-gray-500">Total TTC</span>
                  <span className="text-sm font-bold text-blue-600">1 950 €</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700">Martin Dupont</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm flex-shrink-0" />
                    <span className="text-xs text-gray-600">J&apos;accepte ce devis</span>
                  </div>
                </div>
                <div className="bg-green-600 text-white text-center text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Devis accepté !
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">De la visite à la signature en 3 minutes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: Smartphone, title: 'Créez le devis en 3 minutes', desc: 'Sélectionnez vos prestations depuis votre catalogue, ajustez les quantités. Le total se calcule automatiquement.' },
            { step: '2', icon: Send, title: 'Envoyez par email', desc: 'Un email pro avec le PDF en pièce jointe part instantanément à votre client, depuis n\'importe où.' },
            { step: '3', icon: CheckCircle, title: 'Le client signe en ligne', desc: 'Votre client consulte et signe le devis depuis son téléphone, sans créer de compte. Vous êtes notifié immédiatement.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step}
                </div>
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Arguments */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Pourquoi Kwik ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: 'Signez avant la concurrence', desc: 'Le premier prestataire à envoyer le devis l\'emporte 6 fois sur 10. Kwik vous met toujours en tête, où que vous soyez.' },
              { icon: Zap, title: 'Aucune formation nécessaire', desc: 'Interface pensée pour les indépendants. Prise en main en 10 minutes, quel que soit votre métier.' },
              { icon: FileText, title: 'Documents 100% conformes', desc: 'Mentions légales, TVA, SIRET, conditions de paiement : tout est inclus automatiquement selon votre profil.' },
              { icon: Euro, title: 'Pour tous les métiers de prestation', desc: 'Photographe, coach, paysagiste, graphiste, pisciniste, consultant… Si vous vendez des prestations, Kwik est fait pour vous.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 flex gap-4">
                <div className="bg-blue-50 rounded-xl p-3 h-fit">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Un prix simple, sans surprise</h2>
        <p className="text-gray-500 mb-12">Tout inclus. Sans engagement. Annulable à tout moment.</p>
        <div className="max-w-sm mx-auto bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-lg">
          <p className="font-semibold text-gray-500 mb-2">Plan Solo</p>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-5xl font-bold text-gray-900">19,99</span>
            <span className="text-2xl text-gray-900">€</span>
            <span className="text-gray-400">/mois</span>
          </div>
          <p className="text-sm text-blue-600 font-medium mb-8">14 jours gratuits</p>
          <ul className="space-y-3 text-left mb-8">
            {[
              'Devis illimités',
              'Factures illimitées',
              'Signature électronique',
              'PDF pro à votre image',
              'Envoi email au client',
              'Dashboard & KPIs',
              'Support par email',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/signup">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base">
              Commencer l&apos;essai gratuit →
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-blue-600 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Votre prochain devis part en 3 minutes.
        </h2>
        <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
          Rejoignez les indépendants et petites entreprises qui ne laissent plus un prospect partir sans devis.
        </p>
        <Link href="/signup">
          <Button size="lg" variant="secondary" className="text-base px-10 py-6">
            Essayer gratuitement — 14 jours
          </Button>
        </Link>
        <p className="text-blue-200 text-sm mt-4">14 jours gratuits · Sans engagement</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-bold text-gray-900">Kwik</span>
          <p>© 2026 Kwik — Le devis en 3 minutes</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-600">Connexion</Link>
            <Link href="/signup" className="hover:text-gray-600">S&apos;inscrire</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
