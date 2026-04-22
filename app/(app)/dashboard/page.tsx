import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { FileText, Plus, TrendingUp, Clock, Euro, CheckCircle } from 'lucide-react'
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
      .limit(5),
  ])

  const quotes = quotesRes.data ?? []
  const invoices = invoicesRes.data ?? []

  // KPI 1 — CA du mois (factures payées ce mois)
  const caThisMonth = invoices
    .filter(i => i.payment_status === 'paid' && i.paid_at && i.paid_at >= startOfMonth)
    .reduce((sum, i) => sum + Number(i.total_ttc), 0)

  // KPI 2 — Devis en attente de réponse
  const quotesWaiting = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length

  // KPI 3 — Factures à encaisser
  const invoicesUnpaid = invoices
    .filter(i => i.payment_status === 'unpaid')
    .reduce((sum, i) => sum + Number(i.total_ttc), 0)

  // KPI 4 — Taux d'acceptation
  const responded = quotes.filter(q => q.status === 'accepted' || q.status === 'rejected').length
  const accepted = quotes.filter(q => q.status === 'accepted').length
  const acceptRate = responded > 0 ? Math.round((accepted / responded) * 100) : null

  const kpis = [
    {
      label: 'CA du mois',
      value: `${caThisMonth.toFixed(2)} €`,
      color: 'text-green-600',
      icon: TrendingUp,
      bg: 'bg-green-50',
    },
    {
      label: 'Devis en attente',
      value: String(quotesWaiting),
      color: 'text-blue-600',
      icon: Clock,
      bg: 'bg-blue-50',
    },
    {
      label: 'À encaisser',
      value: `${invoicesUnpaid.toFixed(2)} €`,
      color: 'text-orange-600',
      icon: Euro,
      bg: 'bg-orange-50',
    },
    {
      label: "Taux d'acceptation",
      value: acceptRate !== null ? `${acceptRate} %` : '—',
      color: 'text-purple-600',
      icon: CheckCircle,
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-0.5">{format(now, 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <Link href="/quotes/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />Nouveau devis
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map(({ label, value, color, icon: Icon, bg }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="pt-4 pb-3">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Derniers devis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Derniers devis</CardTitle>
            <Link href="/quotes" className="text-xs text-blue-600 hover:underline">Voir tout</Link>
          </div>
        </CardHeader>
        <CardContent>
          {(!recentQuotesRes.data || recentQuotesRes.data.length === 0) ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Aucun devis pour l&apos;instant</p>
              <p className="text-xs text-gray-400 mb-3">Créez votre premier devis en moins de 3 minutes</p>
              <Link href="/quotes/new">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />Créer un devis
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuotesRes.data.map(quote => (
                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                  <div className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{quote.number}</p>
                          <QuoteStatusBadge status={quote.status} />
                        </div>
                        <p className="text-xs text-gray-400">
                          {(quote.clients as any)?.name ?? 'Sans client'} · {format(new Date(quote.issue_date), 'd MMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0 ml-3">
                      {Number(quote.total_ttc).toFixed(2)} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
