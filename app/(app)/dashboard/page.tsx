import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { NewQuoteButton } from '@/components/new-quote-button'
import { TrendingUp, Clock, Euro, CheckCircle, ArrowRight, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id, name').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [quotesRes, invoicesRes, recentQuotesRes] = await Promise.all([
    supabase.from('quotes').select('status, total_ttc').eq('company_id', company.id),
    supabase.from('invoices').select('payment_status, total_ttc, paid_at').eq('company_id', company.id),
    supabase.from('quotes')
      .select('id, number, status, total_ttc, issue_date, clients(name)')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const quotes = quotesRes.data ?? []
  const invoices = invoicesRes.data ?? []

  const caThisMonth = invoices
    .filter(i => i.payment_status === 'paid' && i.paid_at && i.paid_at >= startOfMonth)
    .reduce((sum, i) => sum + Number(i.total_ttc), 0)

  const quotesWaiting = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length

  const invoicesUnpaid = invoices
    .filter(i => i.payment_status === 'unpaid')
    .reduce((sum, i) => sum + Number(i.total_ttc), 0)

  const responded = quotes.filter(q => q.status === 'accepted' || q.status === 'rejected').length
  const accepted = quotes.filter(q => q.status === 'accepted').length
  const acceptRate = responded > 0 ? Math.round((accepted / responded) * 100) : null

  const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

  const kpis = [
    { label: 'Encaissé ce mois', value: eur(caThisMonth), hint: 'Factures payées', icon: TrendingUp },
    { label: 'Devis en attente', value: String(quotesWaiting), hint: 'Envoyés ou consultés', icon: Clock },
    { label: 'À encaisser', value: eur(invoicesUnpaid), hint: 'Factures non payées', icon: Euro },
    { label: "Taux d'acceptation", value: acceptRate !== null ? `${acceptRate} %` : '—', hint: 'Sur les devis répondus', icon: CheckCircle },
  ]

  const recent = recentQuotesRes.data ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">

      {/* En-tête */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div className="min-w-0">
          <p className="text-[13px] text-gray-500 capitalize">{format(now, 'EEEE d MMMM', { locale: fr })}</p>
          <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900 mt-0.5 truncate">{company.name}</h1>
        </div>
        <div className="md:hidden"><NewQuoteButton /></div>
      </div>

      {/* Indicateurs : une seule bande, séparée par des filets */}
      <section aria-label="Indicateurs" className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-gray-200 bg-white overflow-hidden mb-8">
        {kpis.map(({ label, value, hint, icon: Icon }, i) => (
          <div
            key={label}
            className={[
              'p-4 md:p-5',
              i % 2 === 1 ? 'border-l border-gray-200' : '',
              i >= 2 ? 'border-t border-gray-200 lg:border-t-0' : '',
              i === 2 ? 'lg:border-l' : '',
            ].join(' ')}
          >
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
              <Icon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
              {label}
            </div>
            <p className="font-display tabular text-2xl md:text-[28px] font-semibold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{hint}</p>
          </div>
        ))}
      </section>

      {/* Derniers devis */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-5 h-12 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Derniers devis</h2>
          <Link href="/quotes" className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700">
            Tous les devis <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 mb-4">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Faites votre premier devis</p>
            <p className="text-[13px] text-gray-500 mb-5">Trois minutes suffisent, depuis votre téléphone ou votre ordinateur.</p>
            <NewQuoteButton />
          </div>
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 h-9 items-center border-b border-gray-100 text-xs font-medium text-gray-500">
              <span className="col-span-3">Numéro</span>
              <span className="col-span-4">Client</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-2">Statut</span>
              <span className="col-span-1 text-right">TTC</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {recent.map(quote => {
                const client = (quote.clients as unknown as { name?: string } | null)?.name ?? '—'
                const amount = eur(Number(quote.total_ttc))
                return (
                  <li key={quote.id}>
                    <Link href={`/quotes/${quote.id}`} className="block hover:bg-gray-50 transition-colors">
                      <div className="md:hidden flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[13px] text-gray-900">{quote.number}</span>
                            <QuoteStatusBadge status={quote.status} />
                          </div>
                          <p className="text-sm text-gray-500 truncate">{client}</p>
                        </div>
                        <span className="tabular text-sm font-semibold text-gray-900 flex-shrink-0">{amount}</span>
                      </div>
                      <div className="hidden md:grid grid-cols-12 gap-4 px-5 h-12 items-center">
                        <span className="col-span-3 font-mono text-[13px] text-gray-900">{quote.number}</span>
                        <span className="col-span-4 text-sm text-gray-700 truncate">{client}</span>
                        <span className="col-span-2 text-sm text-gray-500">{format(new Date(quote.issue_date), 'd MMM yyyy', { locale: fr })}</span>
                        <span className="col-span-2"><QuoteStatusBadge status={quote.status} /></span>
                        <span className="col-span-1 tabular text-sm font-semibold text-gray-900 text-right whitespace-nowrap">{amount}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
