import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: company } = await supabase
    .from('companies')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!company?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: company.stripe_customer_id,
    return_url: 'https://www.kwik-devis.fr/subscribe',
  })

  return NextResponse.json({ url: session.url })
}
