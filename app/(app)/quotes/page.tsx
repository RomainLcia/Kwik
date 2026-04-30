import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500 text-sm mt-1">{quotes?.length ?? 0} devis</p>
        </div>
        <NewQuoteButton />
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {STATUSES.map(({ value, label }) => (
          <Link key={value} href={`/quotes?status=${value}`}>
            <button className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
              {label}
            </button>
          </Link>
        ))}
      </div>

      {/* Liste */}
      {!quotes || quotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun devis</p>
            <p className="text-sm text-gray-400 mb-4">Créez votre premier devis en 3 minutes</p>
            <Link href="/quotes/new">
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Créer un devis</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote: any) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{quote.number}</span>
                      <QuoteStatusBadge status={quote.status} />
                    </div>
                    <p className="text-gray-700 truncate">{quote.clients?.name ?? 'Sans client'}</p>
                    {quote.object && <p className="text-sm text-gray-400 truncate">{quote.object}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{Number(quote.total_ttc).toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(quote.issue_date), 'd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
