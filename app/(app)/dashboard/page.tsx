import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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

  const kpis = [
    {
      label: 'CA du mois',
      value: caThisMonth.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Devis en attente',
      value: String(quotesWaiting),
      icon: Clock,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'À encaisser',
      value: invoicesUnpaid.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €',
      icon: Euro,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-gray-900',
    },
    {
      label: "Taux d'acceptation",
      value: acceptRate !== null ? `${acceptRate} %` : '—',
      icon: CheckCircle,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      valueColor: 'text-gray-900',
    },
  ]

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400 mb-1 capitalize">{format(now, 'EEEE d MMMM yyyy', { locale: fr })}</p>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {company.name} 👋</h1>
        </div>
        <NewQuoteButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <Card key={label} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${iconBg} mb-4`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Derniers devis */}
      <Card className="border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Derniers devis</h2>
          <Link href="/quotes" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {(!recentQuotesRes.data || recentQuotesRes.data.length === 0) ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 mb-4">
              <FileText className="h-5 w-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Aucun devis pour l&apos;instant</p>
            <p className="text-xs text-gray-400 mb-5">Créez votre premier devis en moins de 3 minutes</p>
            <NewQuoteButton />
          </div>
        ) : (
          <div>
            {/* En-tête table */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100">
              <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Numéro</span>
              <span className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</span>
              <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Montant</span>
            </div>
            <div className="divide-y divide-gray-50">
              {recentQuotesRes.data.map(quote => (
                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                  <div className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer items-center">
                    <span className="col-span-3 text-sm font-semibold text-gray-900">{quote.number}</span>
                    <span className="col-span-4 text-sm text-gray-600 truncate">{(quote.clients as any)?.name ?? '—'}</span>
                    <span className="col-span-2 text-sm text-gray-400">{format(new Date(quote.issue_date), 'd MMM', { locale: fr })}</span>
                    <span className="col-span-2"><QuoteStatusBadge status={quote.status} /></span>
                    <span className="col-span-1 text-sm font-bold text-gray-900 text-right">
                      {Number(quote.total_ttc).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
