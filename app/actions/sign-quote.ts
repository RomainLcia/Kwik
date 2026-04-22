'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'

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
    .select('company_id')
    .single()

  if (error) throw new Error('Erreur lors de la signature')

  await supabase.from('events').insert({
    company_id: quote.company_id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: 'signed',
  })
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
    .select('company_id')
    .single()

  if (error) throw new Error('Erreur lors du refus')

  await supabase.from('events').insert({
    company_id: quote.company_id,
    entity_type: 'quote',
    entity_id: quoteId,
    event_type: 'rejected',
  })
}
