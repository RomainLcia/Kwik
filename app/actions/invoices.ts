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
  const { supabase, company } = await getContext()

  const [{ data: quote }, { data: lines }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', quoteId).eq('company_id', company.id).single(),
    supabase.from('quote_lines').select('*').eq('quote_id', quoteId).order('position'),
  ])

  if (!quote) return { error: 'Devis introuvable' }

  // Génère le numéro de facture
  const newCounter = (company.invoice_counter ?? 0) + 1
  await supabase.from('companies').update({ invoice_counter: newCounter }).eq('id', company.id)
  const year = new Date().getFullYear()
  const prefix = company.invoice_prefix ?? 'FAC'
  const invoiceNumber = `${prefix}-${year}-${String(newCounter).padStart(3, '0')}`

  const today = new Date().toISOString().split('T')[0]
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const { data: invoice, error } = await supabase.from('invoices').insert({
    company_id: company.id,
    client_id: quote.client_id,
    quote_id: quoteId,
    number: invoiceNumber,
    object: quote.object,
    issue_date: today,
    due_date: in30Days,
    status: 'draft',
    payment_status: 'unpaid',
    subtotal_ht: quote.subtotal_ht,
    discount_amount: quote.discount_amount,
    discount_percent: quote.discount_percent,
    total_ht: quote.total_ht,
    total_vat: quote.total_vat,
    total_ttc: quote.total_ttc,
    notes: quote.notes,
    terms: quote.terms,
  }).select('id').single()

  if (error || !invoice) return { error: 'Erreur lors de la création de la facture' }

  if (lines && lines.length > 0) {
    await supabase.from('invoice_lines').insert(
      lines.map(line => ({
        invoice_id: invoice.id,
        position: line.position,
        label: line.label,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        price_ht: line.price_ht,
        vat_rate: line.vat_rate,
        line_total_ht: line.line_total_ht,
        line_total_ttc: line.line_total_ttc,
      }))
    )
  }

  await supabase.from('events').insert({
    company_id: company.id,
    entity_type: 'invoice',
    entity_id: invoice.id,
    event_type: 'converted',
  })

  revalidatePath('/invoices')
  redirect(`/invoices/${invoice.id}`)
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
