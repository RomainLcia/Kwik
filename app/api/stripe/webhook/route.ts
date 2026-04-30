import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // checkout.session.completed : on s'assure juste que stripe_customer_id est bien enregistré.
  // Le statut réel (trial/active) est géré par customer.subscription.created/updated.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const companyId = session.metadata?.company_id
    if (customerId && companyId) {
      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', companyId)
    }
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

  // Email J-3 avant fin d'essai
  if (event.type === 'customer.subscription.trial_will_end') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    const { data: company } = await supabase
      .from('companies')
      .select('name, contact_email')
      .eq('stripe_customer_id', customerId)
      .single()

    if (company?.contact_email) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

      await resend.emails.send({
        from: `Kwik <${fromEmail}>`,
        to: [company.contact_email],
        subject: 'Votre essai Kwik se termine dans 3 jours',
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#F59E0B;color:white;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Votre essai se termine bientôt</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.85;">Plus que 3 jours</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${company.name}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">Votre période d'essai gratuite se termine dans <strong>3 jours</strong>. Pour continuer à utiliser Kwik sans interruption, votre abonnement à <strong>19,99 €/mois</strong> sera activé automatiquement.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#4B5563;">Vous pouvez gérer ou annuler votre abonnement à tout moment depuis votre espace.</p>
      <a href="https://www.kwik-devis.fr/subscribe" style="display:inline-block;background:#2563EB;color:white;padding:13px 26px;border-radius:7px;text-decoration:none;font-weight:600;font-size:15px;">Gérer mon abonnement →</a>
    </div>
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:16px 0 0;">Kwik — Le devis en 3 minutes</p>
  </div>
</body>
</html>`,
      })
    }
  }

  return NextResponse.json({ received: true })
}
