'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')
  return { supabase, company }
}

export async function createInvoiceFromQuote(quoteId: string) {
  const { supabase } = await getContext()

  // Tout se fait dans une seule transaction côté base (voir la fonction SQL
  // create_invoice_from_quote) : numéro, facture, lignes et événement.
  // Pas de trou ni de doublon dans la numérotation, et un double clic renvoie la même facture.
  const { data: invoiceId, error } = await supabase.rpc('create_invoice_from_quote', { p_quote_id: quoteId })

  if (error || !invoiceId) return { error: 'Erreur lors de la création de la facture' }

  revalidatePath('/invoices')
  redirect(`/invoices/${invoiceId}`)
}

export async function markInvoicePaid(invoiceId: string) {
  const { supabase, company } = await getContext()

  await supabase.from('invoices')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoiceId)
    .eq('company_id', company.id)

  await supabase.from('events').insert({
    company_id: company.id,
    entity_type: 'invoice',
    entity_id: invoiceId,
    event_type: 'paid',
  })

  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/invoices')
}

export async function markInvoiceUnpaid(invoiceId: string) {
  const { supabase, company } = await getContext()

  await supabase.from('invoices')
    .update({ payment_status: 'unpaid', paid_at: null })
    .eq('id', invoiceId)
    .eq('company_id', company.id)

  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/invoices')
}
