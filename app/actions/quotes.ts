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

export async function generateQuoteNumber() {
  const { supabase, company } = await getContext()

  const newCounter = (company.quote_counter ?? 0) + 1
  await supabase.from('companies').update({ quote_counter: newCounter }).eq('id', company.id)

  const year = new Date().getFullYear()
  const prefix = company.quote_prefix ?? 'DEV'
  return {
    number: `${prefix}-${year}-${String(newCounter).padStart(3, '0')}`,
    companyId: company.id,
    vatApplicable: company.vat_applicable,
    companyLegalMentions: company.legal_mentions ?? '',
  }
}

export type QuoteLine = {
  id?: string
  position: number
  label: string
  description: string
  quantity: number
  unit: string
  price_ht: number
  vat_rate: number
  line_total_ht: number
  line_total_ttc: number
}

export type QuoteData = {
  id?: string
  client_id: string | null
  number: string
  object: string
  issue_date: string
  validity_date: string
  notes: string
  terms: string
  discount_percent: number
  discount_amount: number
  subtotal_ht: number
  total_ht: number
  total_vat: number
  total_ttc: number
  deposit_percent: number | null
  lines: QuoteLine[]
}

export async function saveQuote(data: QuoteData) {
  const { supabase, company } = await getContext()

  const quotePayload = {
    company_id: company.id,
    client_id: data.client_id || null,
    number: data.number,
    object: data.object,
    issue_date: data.issue_date,
    validity_date: data.validity_date,
    notes: data.notes,
    terms: data.terms,
    discount_percent: data.discount_percent,
    discount_amount: data.discount_amount,
    subtotal_ht: data.subtotal_ht,
    total_ht: data.total_ht,
    total_vat: data.total_vat,
    total_ttc: data.total_ttc,
    deposit_percent: data.deposit_percent,
    status: 'draft',
  }

  let quoteId = data.id

  if (quoteId) {
    await supabase.from('quotes').update(quotePayload).eq('id', quoteId).eq('company_id', company.id)
  } else {
    const { data: newQuote } = await supabase.from('quotes').insert(quotePayload).select('id').single()
    quoteId = newQuote?.id
  }

  if (!quoteId) return { error: 'Erreur lors de la sauvegarde' }

  // Remplace toutes les lignes
  await supabase.from('quote_lines').delete().eq('quote_id', quoteId)
  if (data.lines.length > 0) {
    await supabase.from('quote_lines').insert(
      data.lines.map(line => ({
        quote_id: quoteId,
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

  // Enregistre l'événement
  await supabase.from('events').insert({
    company_id: company.id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: data.id ? 'updated' : 'created',
  })

  revalidatePath('/quotes')
  return { id: quoteId }
}

export async function updateQuoteStatus(id: string, status: string) {
  const { supabase, company } = await getContext()

  await supabase.from('quotes')
    .update({ status, responded_at: ['accepted', 'rejected'].includes(status) ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('company_id', company.id)

  await supabase.from('events').insert({
    company_id: company.id,
    entity_type: 'quote',
    entity_id: id,
    event_type: status === 'accepted' ? 'signed' : status === 'rejected' ? 'rejected' : 'updated',
  })

  revalidatePath(`/quotes/${id}`)
  revalidatePath('/quotes')
}

export async function deleteQuote(id: string) {
  const { supabase, company } = await getContext()
  await supabase.from('quotes').delete().eq('id', id).eq('company_id', company.id)
  revalidatePath('/quotes')
  redirect('/quotes')
}
