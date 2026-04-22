import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    await supabase
      .from('companies')
      .update({ subscription_status: 'active', stripe_customer_id: customerId })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const status = sub.status === 'trialing' ? 'trial'
      : sub.status === 'active' ? 'active'
      : sub.status === 'past_due' ? 'past_due'
      : 'canceled'
    await supabase
      .from('companies')
      .update({ subscription_status: status })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    await supabase
      .from('companies')
      .update({ subscription_status: 'canceled' })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
