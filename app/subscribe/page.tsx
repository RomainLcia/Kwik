export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscribeButton } from '@/components/subscribe-button'
import { ManageSubscriptionButton } from '@/components/manage-subscription-button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { KwikLogo } from '@/components/kwik-logo'

const PLANS = [
  {
    id: 'basic',
    name: 'Basique',
    price: '19,99',
    quota: '10 devis / mois',
    features: [
      '10 devis par mois',
      'Signature électronique',
      'Génération PDF pro',
      'Envoi email au client',
      'Conversion devis → facture',
      'Dashboard KPIs',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29,99',
    quota: '30 devis / mois',
    features: [
      '30 devis par mois',
      'Signature électronique',
      'Génération PDF pro',
      'Envoi email au client',
      'Conversion devis → facture',
      'Dashboard KPIs',
      'Support prioritaire',
    ],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Illimité',
    price: '39,99',
    quota: 'Devis illimités',
    features: [
      'Devis illimités',
      'Signature électronique',
      'Génération PDF pro',
      'Envoi email au client',
      'Conversion devis → facture',
      'Dashboard KPIs',
      'Support prioritaire',
    ],
    highlighted: false,
  },
]

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('subscription_status, stripe_customer_id, plan')
    .eq('user_id', user.id)
    .single()

  const status = company?.subscription_status
  const hasStripeCustomer = !!company?.stripe_customer_id
  const isActive = (status === 'active' || status === 'trial') && hasStripeCustomer
  const currentPlan = company?.plan ?? 'basic'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between max-w-5xl mx-auto px-4 md:px-8 h-16">
        <KwikLogo href={isActive ? '/dashboard' : '/'} size="sm" />
        {isActive && (
          <Link href="/dashboard" className="text-[13px] font-medium text-gray-500 hover:text-gray-900">Retour à l&apos;app</Link>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Choisissez votre formule</h1>
          <p className="text-gray-500 mt-3">14 jours gratuits, sans engagement, résiliable à tout moment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl p-6 flex flex-col ${
                plan.highlighted ? 'border border-gray-900 ring-1 ring-gray-900' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-display text-base font-semibold text-gray-900">{plan.name}</p>
                {plan.highlighted && (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600">Le plus choisi</span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display tabular text-4xl font-semibold text-gray-900">{plan.price} €</span>
                <span className="text-gray-500 text-sm">/ mois</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 mb-6">{plan.quota}</p>

              <ul className="space-y-2.5 mb-8 flex-1 border-t border-gray-200 pt-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isActive && currentPlan === plan.id ? (
                <div className="space-y-2">
                  <p className="flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 py-2 text-sm font-medium text-gray-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    {status === 'trial' ? 'Essai en cours' : 'Votre formule actuelle'}
                  </p>
                  <ManageSubscriptionButton />
                </div>
              ) : isActive ? (
                <ManageSubscriptionButton />
              ) : (
                <SubscribeButton plan={plan.id} />
              )}
            </div>
          ))}
        </div>

        {status === 'canceled' && (
          <p className="text-center text-sm text-red-600 mt-6">Votre abonnement a été résilié. Choisissez une formule pour retrouver vos devis.</p>
        )}
        {status === 'past_due' && (
          <p className="text-center text-sm text-orange-600 mt-6">Le dernier paiement a échoué. Mettez à jour votre carte pour garder l&apos;accès.</p>
        )}
      </div>
    </div>
  )
}
