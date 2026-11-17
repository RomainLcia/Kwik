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

const PLAN_LIMITS: Record<string, number> = {
  basic: 10,
  pro: 30,
  unlimited: Infinity,
}

type Company = Awaited<ReturnType<typeof getContext>>['company']
type Supabase = Awaited<ReturnType<typeof getContext>>['supabase']

// Vérifie le quota mensuel de devis selon le plan. Renvoie un message d'erreur si la limite est atteinte.
async function quotaError(supabase: Supabase, company: Company): Promise<string | null> {
  const plan = company.plan ?? 'basic'
  const limit = PLAN_LIMITS[plan] ?? 10
  if (limit === Infinity) return null
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .gte('created_at', startOfMonth.toISOString())
  if ((count ?? 0) >= limit) {
    return `Limite de ${limit} devis/mois atteinte (plan ${plan}). Passez à un plan supérieur.`
  }
  return null
}

// Appelé à l'ouverture de « Nouveau devis » : vérifie le quota sans consommer de numéro.
// Le numéro est attribué au premier enregistrement (voir saveQuote).
export async function prepareNewQuote() {
  const { supabase, company } = await getContext()
  const error = await quotaError(supabase, company)
  if (error) return { error }
  return {
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
  number?: string // lecture seule : attribué par la base au premier enregistrement
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

  // Entreprise non assujettie à la TVA (art. 293 B du CGI) : on impose 0 % de TVA
  // côté serveur, quel que soit ce que le formulaire a envoyé.
  if (!company.vat_applicable) {
    data = {
      ...data,
      total_vat: 0,
      total_ttc: data.total_ht,
      lines: data.lines.map(l => ({ ...l, vat_rate: 0, line_total_ttc: l.line_total_ht })),
    }
  }

  const quotePayload = {
    company_id: company.id,
    client_id: data.client_id || null,
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
  let number: string | undefined

  if (quoteId) {
    await supabase.from('quotes').update(quotePayload).eq('id', quoteId).eq('company_id', company.id)
  } else {
    // Nouveau devis : quota vérifié côté serveur, puis numéro attribué de façon atomique par la base
    const error = await quotaError(supabase, company)
    if (error) return { error }
    const { data: nextNumber, error: numberError } = await supabase.rpc('next_quote_number')
    if (numberError || !nextNumber) return { error: 'Erreur lors de la numérotation du devis' }
    number = nextNumber as string
    const { data: newQuote } = await supabase.from('quotes').insert({ ...quotePayload, number }).select('id').single()
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
  return { id: quoteId, number }
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
