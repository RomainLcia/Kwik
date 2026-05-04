import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

const PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC!,
  pro: process.env.STRIPE_PRICE_ID_PRO!,
  unlimited: process.env.STRIPE_PRICE_ID_UNLIMITED!,
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const plan: string = body.plan && PRICE_IDS[body.plan] ? body.plan : 'basic'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: company } = await supabase
    .from('companies')
    .select('id, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!company) return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 400 })

  const stripe = getStripe()
  let customerId = company.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id, company_id: company.id },
    })
    customerId = customer.id
    await supabase.from('companies').update({ stripe_customer_id: customerId }).eq('id', company.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    metadata: { company_id: company.id, plan },
    success_url: 'https://www.kwik-devis.fr/dashboard?subscribed=true',
    cancel_url: 'https://www.kwik-devis.fr/subscribe',
  })

  return NextResponse.json({ url: session.url })
}
