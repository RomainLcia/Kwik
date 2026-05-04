import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { generateQuoteNumber } from '@/app/actions/quotes'
import { QuoteForm } from '@/components/quote-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewQuotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const [quoteNumberResult, clientsRes, catalogRes] = await Promise.all([
    generateQuoteNumber(),
    supabase.from('clients').select('id, name, email').eq('company_id', company.id).is('archived_at', null).order('name'),
    supabase.from('catalog_items').select('id, label, description, default_price_ht, default_unit, default_vat_rate').eq('company_id', company.id).is('archived_at', null).order('label'),
  ])

  if ('error' in quoteNumberResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Limite atteinte</h1>
        <p className="text-gray-500 mb-6">{quoteNumberResult.error}</p>
        <Link href="/subscribe">
          <Button className="bg-blue-600 hover:bg-blue-700">Changer de plan →</Button>
        </Link>
      </div>
    )
  }

  const { number, companyId, vatApplicable } = quoteNumberResult

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
