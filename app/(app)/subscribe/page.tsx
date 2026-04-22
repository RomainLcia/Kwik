import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscribeButton } from '@/components/subscribe-button'
import { ManageSubscriptionButton } from '@/components/manage-subscription-button'
import { CheckCircle } from 'lucide-react'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single()

  const status = company?.subscription_status
  const isActive = status === 'active' || status === 'trial'

  const features = [
    'Devis illimités',
    'Signature électronique',
    'Génération PDF pro',
    'Envoi email au client',
    'Conversion devis → facture',
    'Dashboard KPIs',
  ]

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plan Solo</h1>
        <p className="text-gray-500 mt-2">Tout ce qu&apos;il faut pour deviser en 3 minutes</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-gray-900">19 €</span>
          <span className="text-gray-500">/mois</span>
          <p className="text-sm text-blue-600 mt-1 font-medium">14 jours gratuits, sans CB requise</p>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {isActive ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">
                {status === 'trial' ? '✓ Période d\'essai en cours' : '✓ Abonnement actif'}
              </p>
            </div>
            <ManageSubscriptionButton />
          </div>
        ) : (
          <SubscribeButton />
        )}
      </div>

      {status === 'canceled' && (
        <p className="text-center text-sm text-red-500 mt-4">Votre abonnement a été annulé.</p>
      )}
      {status === 'past_due' && (
        <p className="text-center text-sm text-orange-500 mt-4">Paiement en retard — mettez à jour votre moyen de paiement.</p>
      )}
    </div>
  )
}
