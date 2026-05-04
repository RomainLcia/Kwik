import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { QuoteActions } from '@/components/quote-actions'
import { ConvertToInvoiceButton } from '@/components/convert-to-invoice-button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Pencil, ArrowLeft } from 'lucide-react'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id, vat_applicable').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!quote) notFound()

  const { data: lines } = await supabase
    .from('quote_lines')
    .select('*')
    .eq('quote_id', id)
    .order('position')

  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('quote_id', id)
    .single()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('entity_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const EVENT_LABELS: Record<string, string> = {
    created: 'Devis créé',
    updated: 'Devis modifié',
    sent: 'Devis envoyé',
    viewed: 'Devis consulté',
    signed: 'Devis accepté',
    rejected: 'Devis refusé',
  }

  const discountPercent = Number(quote.discount_percent ?? 0)
  const vatBreakdown = (lines ?? []).reduce((acc, line) => {
    const rate = line.vat_rate
    const base = Math.round(Number(line.line_total_ht) * (1 - discountPercent / 100) * 100) / 100
    acc[rate] = Math.round(((acc[rate] ?? 0) + base * rate / 100) * 100) / 100
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quotes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{quote.number}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Émis le {format(new Date(quote.issue_date), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        {quote.status === 'draft' && (
          <Link href={`/quotes/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" />Modifier</Button>
          </Link>
        )}
        {quote.status === 'accepted' && !existingInvoice && (
          <ConvertToInvoiceButton quoteId={id} />
        )}
        {quote.status === 'accepted' && existingInvoice && (
          <Link href={`/invoices/${existingInvoice.id}`}>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">Voir la facture</Button>
          </Link>
        )}
      </div>

      {/* Actions */}
      <QuoteActions
        quoteId={id}
        status={quote.status}
        totalTTC={Number(quote.total_ttc)}
        clientEmail={quote.clients?.email ?? null}
        publicToken={quote.public_token}
      />

      {/* Client */}
      {quote.clients && (
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Client</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{quote.clients.name}</p>
            {quote.clients.email && <p className="text-sm text-gray-500">{quote.clients.email}</p>}
            {quote.clients.phone && <p className="text-sm text-gray-500">{quote.clients.phone}</p>}
            {quote.clients.address_street && (
              <p className="text-sm text-gray-500">{quote.clients.address_street}, {quote.clients.address_zip} {quote.clients.address_city}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objet */}
      {quote.object && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <p className="text-sm text-gray-500 mb-1">Objet</p>
            <p className="font-medium">{quote.object}</p>
          </CardContent>
        </Card>
      )}

      {/* Lignes */}
      <Card className="mb-4">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Prestations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(lines ?? []).map(line => (
            <div key={line.id} className="flex justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{line.label}</p>
                {line.description && <p className="text-xs text-gray-400">{line.description}</p>}
                <p className="text-xs text-gray-500 mt-0.5">{line.quantity} {line.unit} × {Number(line.price_ht).toFixed(2)} € HT</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm flex-shrink-0">{Number(line.line_total_ht).toFixed(2)} €</p>
            </div>
          ))}

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total HT</span>
              <span>{Number(quote.subtotal_ht).toFixed(2)} €</span>
            </div>
            {Number(quote.discount_percent) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Remise ({quote.discount_percent}%)</span>
                <span className="text-green-600">- {Number(quote.discount_amount).toFixed(2)} €</span>
              </div>
            )}
            {company.vat_applicable ? (
              Object.entries(vatBreakdown).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between">
                  <span className="text-gray-500">TVA {rate}%</span>
                  <span>{Number(amount).toFixed(2)} €</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">TVA non applicable, art. 293 B du CGI</p>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total TTC</span>
              <span className="text-blue-600">{Number(quote.total_ttc).toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      {(quote.terms || quote.notes) && (
        <Card className="mb-4">
          <CardContent className="py-3 space-y-2">
            {quote.terms && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Modalités de paiement</p>
                <p className="text-sm text-gray-700">{quote.terms}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {events && events.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Historique</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{EVENT_LABELS[event.event_type] ?? event.event_type}</span>
                  <span className="text-gray-400 text-xs">
                    {format(new Date(event.created_at), 'd MMM à HH:mm', { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
