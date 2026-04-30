'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function signQuote(quoteId: string, signerName: string) {
  const supabase = createServiceClient()
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? 'unknown'
  const ua = hdrs.get('user-agent') ?? 'unknown'

  const signatureData = {
    name: signerName,
    ip,
    ua,
    signed_at: new Date().toISOString(),
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      status: 'accepted',
      signature_data: signatureData,
      responded_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select('*, clients(name, email)')
    .single()

  if (error || !quote) throw new Error('Erreur lors de la signature')

  await supabase.from('events').insert({
    company_id: quote.company_id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: 'signed',
  })

  // Récupérer les infos de l'entreprise
  const { data: company } = await supabase
    .from('companies')
    .select('name, contact_email')
    .eq('id', quote.company_id)
    .single()

  if (!company) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const signedAt = format(new Date(signatureData.signed_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })

  // Email au CLIENT — confirmation de signature
  const clientEmail = (quote.clients as any)?.email
  if (clientEmail) {
    await resend.emails.send({
      from: `${company.name} <${fromEmail}>`,
      to: [clientEmail],
      replyTo: company.contact_email ?? undefined,
      subject: `Confirmation — Devis ${quote.number} accepté`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#16A34A;color:white;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Devis accepté</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.85;">${company.name}</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour <strong>${signerName}</strong>,</p>
      <p style="margin:0 0 16px;font-size:14px;color:#4B5563;">Votre acceptation du devis <strong>${quote.number}</strong> a bien été enregistrée.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px;margin:0 0 20px;">
        <p style="margin:0 0 4px;font-size:13px;color:#166534;"><strong>Devis n° ${quote.number}</strong></p>
        ${quote.object ? `<p style="margin:0 0 4px;font-size:13px;color:#166534;">Objet : ${quote.object}</p>` : ''}
        <p style="margin:0 0 4px;font-size:13px;color:#166534;">Montant TTC : <strong>${Number(quote.total_ttc).toFixed(2)} €</strong></p>
        <p style="margin:0;font-size:12px;color:#16A34A;">Signé le ${signedAt}</p>
      </div>
      <p style="margin:0;font-size:13px;color:#9CA3AF;">Ce prestataire vous recontactera prochainement pour la suite.</p>
    </div>
    <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:16px 0 0;">Envoyé via Kwik</p>
  </div>
</body>
</html>`,
    })
  }

  // Email au PRESTATAIRE — notification de signature
  if (company.contact_email) {
    const clientName = (quote.clients as any)?.name ?? 'Votre client'
    await resend.emails.send({
      from: `Kwik <${fromEmail}>`,
      to: [company.contact_email],
      subject: `✅ ${clientName} a accepté le devis ${quote.number}`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#2563EB;color:white;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Devis signé !</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.85;">Kwik</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <p style="margin:0 0 12px;font-size:15px;"><strong>${clientName}</strong> a accepté votre devis <strong>${quote.number}</strong>.</p>
      <p style="margin:0 0 20px;font-size:14px;color:#4B5563;">Montant : <strong style="color:#2563EB;font-size:18px;">${Number(quote.total_ttc).toFixed(2)} €</strong></p>
      <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">Signé le ${signedAt} — IP : ${ip}</p>
    </div>
  </div>
</body>
</html>`,
    })
  }
}

export async function rejectQuote(quoteId: string) {
  const supabase = createServiceClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select('*, clients(name, email)')
    .single()

  if (error || !quote) throw new Error('Erreur lors du refus')

  await supabase.from('events').insert({
    company_id: quote.company_id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: 'rejected',
  })

  // Email au PRESTATAIRE — notification de refus
  const { data: company } = await supabase
    .from('companies')
    .select('name, contact_email')
    .eq('id', quote.company_id)
    .single()

  if (company?.contact_email) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const clientName = (quote.clients as any)?.name ?? 'Votre client'

    await resend.emails.send({
      from: `Kwik <${fromEmail}>`,
      to: [company.contact_email],
      subject: `Devis ${quote.number} refusé par ${clientName}`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#DC2626;color:white;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Devis refusé</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.85;">Kwik</p>
    </div>
    <div style="background:white;padding:28px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 10px 10px;">
      <p style="margin:0 0 12px;font-size:15px;"><strong>${clientName}</strong> a refusé votre devis <strong>${quote.number}</strong>${quote.object ? ` (${quote.object})` : ''}.</p>
      <p style="margin:0;font-size:14px;color:#6B7280;">Montant : ${Number(quote.total_ttc).toFixed(2)} €</p>
    </div>
  </div>
</body>
</html>`,
    })
  }
}
