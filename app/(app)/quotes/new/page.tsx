import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { generateQuoteNumber } from '@/app/actions/quotes'
import { QuoteForm } from '@/components/quote-form'

export default async function NewQuotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const [{ number, companyId, vatApplicable }, clientsRes, catalogRes] = await Promise.all([
    generateQuoteNumber(),
    supabase.from('clients').select('id, name, email').eq('company_id', company.id).is('archived_at', null).order('name'),
    supabase.from('catalog_items').select('id, label, description, default_price_ht, default_unit, default_vat_rate').eq('company_id', company.id).is('archived_at', null).order('label'),
  ])

  return (
    <QuoteForm
      quoteNumber={number}
      companyId={companyId}
      vatApplicable={vatApplicable}
      clients={clientsRes.data ?? []}
      catalogItems={catalogRes.data ?? []}
    />
  )
}
