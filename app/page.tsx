import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Smartphone, FileText } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">Kwik</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">14 jours gratuits · Sans CB</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Le devis en 3 minutes<br />depuis votre téléphone
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Pour les artisans et prestataires terrain qui préfèrent être sur le chantier qu&apos;à leur bureau.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 py-6">
            Commencer gratuitement
          </Button>
        </Link>
        <p className="text-sm text-gray-400 mt-4">Aucune carte bancaire requise</p>
      </section>

      {/* Arguments */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: '3 minutes', desc: 'Pour créer et envoyer un devis complet depuis votre téléphone' },
            { icon: Smartphone, title: 'Mobile-first', desc: 'Pensé pour être utilisé sur chantier, pas derrière un bureau' },
            { icon: FileText, title: 'PDF pro', desc: 'Devis et factures à votre image, envoyés par email en un clic' },
            { icon: CheckCircle, title: '19 €/mois', desc: 'Sans engagement. 10× moins cher que les logiciels métiers' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-xl p-6">
              <Icon className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bas de page */}
      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à deviser plus vite ?</h2>
        <p className="text-blue-100 mb-8">Rejoignez les artisans qui signent leurs devis en 3 minutes.</p>
        <Link href="/signup">
          <Button size="lg" variant="secondary" className="text-base px-8">
            Essayer gratuitement 14 jours
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 Kwik · <Link href="/cgu" className="hover:text-gray-600">CGU</Link> · <Link href="/privacy" className="hover:text-gray-600">Confidentialité</Link></p>
      </footer>
    </div>
  )
}
