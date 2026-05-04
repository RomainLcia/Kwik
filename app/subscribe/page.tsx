export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscribeButton } from '@/components/subscribe-button'
import { ManageSubscriptionButton } from '@/components/manage-subscription-button'
import { CheckCircle } from 'lucide-react'

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Choisissez votre plan</h1>
        <p className="text-gray-500 mt-2">14 jours gratuits · Sans engagement · Annulable à tout moment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl p-6 shadow-sm flex flex-col ${
              plan.highlighted
                ? 'border-2 border-blue-600 shadow-lg'
                : 'border border-gray-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              </div>
            )}

            <div className="mb-4">
              <p className="font-semibold text-gray-500 text-sm mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price} €</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>
              <p className="text-sm text-blue-600 font-medium mt-1">{plan.quota}</p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive && currentPlan === plan.id ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-medium text-green-800">
                    {status === 'trial' ? '✓ Essai en cours' : '✓ Plan actuel'}
                  </p>
                </div>
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
        <p className="text-center text-sm text-red-500 mt-6">Votre abonnement a été annulé.</p>
      )}
      {status === 'past_due' && (
        <p className="text-center text-sm text-orange-500 mt-6">Paiement en retard — mettez à jour votre moyen de paiement.</p>
      )}
    </div>
  )
}
