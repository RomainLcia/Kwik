import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { NewQuoteButton } from '@/components/new-quote-button'
import { FileText, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const search = params.q ?? ''

  let query = supabase
    .from('quotes')
    .select('*, clients(name)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (search) query = query.ilike('number', `%${search}%`)

  const { data: quotes } = await query

  const STATUSES = [
    { value: 'all', label: 'Tous' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'sent', label: 'Envoyés' },
    { value: 'viewed', label: 'Consultés' },
    { value: 'accepted', label: 'Acceptés' },
    { value: 'rejected', label: 'Refusés' },
  ]

  const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900">Devis</h1>
          <p className="text-[13px] text-gray-500 mt-0.5 tabular">{quotes?.length ?? 0} devis</p>
        </div>
        <NewQuoteButton />
      </div>

      {/* Filtres par statut */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5" role="tablist">
          {STATUSES.map(({ value, label }) => {
            const active = statusFilter === value
            return (
              <Link
                key={value}
                href={`/quotes?status=${value}`}
                role="tab"
                aria-selected={active}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {!quotes || quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white text-center py-16 px-4">
          <FileText className="h-6 w-6 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">
            {statusFilter === 'all' ? 'Aucun devis pour le moment' : 'Aucun devis avec ce statut'}
          </p>
          <p className="text-[13px] text-gray-500 mt-1 mb-5">Un devis se fait en trois minutes.</p>
          <Link href="/quotes/new">
            <Button variant="outline" className="h-9 gap-1.5"><Plus className="h-4 w-4" />Créer un devis</Button>
          </Link>
        </div>
      ) : (
        <ul className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {quotes.map((quote: any) => (
            <li key={quote.id}>
              <Link href={`/quotes/${quote.id}`} className="flex items-center justify-between gap-4 px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[13px] text-gray-900">{quote.number}</span>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  <p className="text-sm text-gray-900 truncate">
                    {quote.clients?.name ?? <span className="text-gray-400">Sans client</span>}
                    {quote.object && <span className="text-gray-500"> · {quote.object}</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="tabular text-sm font-semibold text-gray-900">{eur(Number(quote.total_ttc))}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{format(new Date(quote.issue_date), 'd MMM yyyy', { locale: fr })}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
