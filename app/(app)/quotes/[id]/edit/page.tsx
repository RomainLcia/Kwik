import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuoteForm } from '@/components/quote-form'

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id, vat_applicable').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const [quoteRes, linesRes, clientsRes, catalogRes] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', id).eq('company_id', company.id).single(),
    supabase.from('quote_lines').select('*').eq('quote_id', id).order('position'),
    supabase.from('clients').select('id, name, email').eq('company_id', company.id).is('archived_at', null).order('name'),
    supabase.from('catalog_items').select('id, label, description, default_price_ht, default_unit, default_vat_rate').eq('company_id', company.id).is('archived_at', null).order('label'),
  ])

  if (!quoteRes.data) notFound()

  const existingQuote = {
    ...quoteRes.data,
    lines: linesRes.data ?? [],
  }

  return (
    <QuoteForm
      quoteNumber={existingQuote.number}
      companyId={company.id}
      vatApplicable={company.vat_applicable}
      clients={clientsRes.data ?? []}
      catalogItems={catalogRes.data ?? []}
      existingQuote={existingQuote}
    />
  )
}
