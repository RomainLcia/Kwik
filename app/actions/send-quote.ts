'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuoteDocument } from '@/components/quote-pdf'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

export async function sendQuoteByEmail(quoteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
  if (!company) return { error: 'Entreprise introuvable' }

  const [{ data: quote }, { data: lines }] = await Promise.all([
    supabase.from('quotes')
      .select('*, clients(name, email, phone, address_street, address_zip, address_city), public_token')
      .eq('id', quoteId)
      .eq('company_id', company.id)
      .single(),
    supabase.from('quote_lines').select('*').eq('quote_id', quoteId).order('position'),
  ])

  if (!quote) return { error: 'Devis introuvable' }
  if (!quote.clients?.email) return { error: "Ce client n'a pas d'adresse email renseignée." }

  // Génération du PDF
  const pdfBuffer = await renderToBuffer(
    React.createElement(QuoteDocument, {
      quote,
      lines: lines ?? [],
      company,
      client: quote.clients,
    })
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kwik.vercel.app'
  const publicUrl = `${appUrl}/q/${quote.public_token}`

  const validityFormatted = new Date(quote.validity_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#2563EB;color:white;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">${company.name}</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.85;">vous a envoyé un devis</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <h2 style="margin:0 0 16px;font-size:20px;">Devis n° ${quote.number}</h2>
      ${quote.object ? `<p style="color:#6B7280;margin:0 0 12px;font-size:14px;">Objet : ${quote.object}</p>` : ''}
      <p style="margin:0 0 4px;font-size:14px;">Montant total TTC : <strong style="color:#2563EB;font-size:20px;">${Number(quote.total_ttc).toFixed(2)} €</strong></p>
      <p style="color:#6B7280;font-size:13px;margin:0 0 24px;">Valable jusqu'au ${validityFormatted}</p>
      <a href="${publicUrl}" style="display:inline-block;background:#2563EB;color:white;padding:13px 26px;border-radius:7px;text-decoration:none;font-weight:600;font-size:15px;">Consulter le devis →</a>
      <p style="color:#9CA3AF;font-size:12px;margin:20px 0 0;">Le devis est également joint en pièce jointe au format PDF.</p>
    </div>
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:16px 0 0;">Envoyé via Kwik</p>
  </div>
</body>
</html>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const { error: resendError } = await resend.emails.send({
    from: `${company.name} <${fromEmail}>`,
    to: [quote.clients.email],
    replyTo: company.contact_email ?? undefined,
    subject: `Votre devis ${quote.number} — ${company.name}`,
    html: emailHtml,
    attachments: [{
      filename: `devis-${quote.number}.pdf`,
      content: pdfBuffer,
    }],
  })

  if (resendError) return { error: `Erreur d'envoi : ${resendError.message}` }

  // Passer le statut à "envoyé" si c'était un brouillon
  if (quote.status === 'draft') {
    await supabase.from('quotes').update({ status: 'sent' }).eq('id', quoteId)
  }

  await supabase.from('events').insert({
    company_id: company.id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: 'sent',
  })

  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/quotes')

  return { success: true }
}
