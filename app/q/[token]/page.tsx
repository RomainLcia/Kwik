import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QuoteSignatureForm } from '@/components/quote-signature-form'
import { Download, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
    .eq('public_token', token)
    .single()

  if (!quote) notFound()

  const [{ data: lines }, { data: company }] = await Promise.all([
    supabase.from('quote_lines').select('*').eq('quote_id', quote.id).order('position'),
    supabase.from('companies')
      .select('name, address_street, address_zip, address_city, phone, contact_email, vat_applicable')
      .eq('id', quote.company_id).single(),
  ])

  // Suivi de l'ouverture
  if (quote.status === 'sent') {
    await supabase.from('quotes').update({ status: 'viewed' }).eq('id', quote.id)
    await supabase.from('events').insert({
      company_id: quote.company_id,
      entity_type: 'quote',
      entity_id: quote.id,
      event_type: 'viewed',
    })
  }

  const discountPercent = Number(quote.discount_percent ?? 0)
  const vatBreakdown = (lines ?? []).reduce((acc, line) => {
    const rate = line.vat_rate
    const base = Math.round(Number(line.line_total_ht) * (1 - discountPercent / 100) * 100) / 100
    acc[rate] = Math.round(((acc[rate] ?? 0) + base * rate / 100) * 100) / 100
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <div>
            {company && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                {company.address_street && (
                  <p className="text-sm text-gray-500">{company.address_street}</p>
                )}
                {(company.address_zip || company.address_city) && (
                  <p className="text-sm text-gray-500">
                    {[company.address_zip, company.address_city].filter(Boolean).join(' ')}
                  </p>
                )}
                {company.phone && <p className="text-sm text-gray-500">{company.phone}</p>}
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-2xl font-bold text-blue-600">DEVIS</p>
            <p className="font-semibold text-gray-900">{quote.number}</p>
            <p className="text-sm text-gray-500">
              Émis le {format(new Date(quote.issue_date), 'd MMMM yyyy', { locale: fr })}
            </p>
            <p className="text-sm text-gray-500">
              Valable jusqu&apos;au {format(new Date(quote.validity_date), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        {/* Bouton PDF */}
        <div className="flex justify-end mb-4">
          <Link href={`/api/quotes/public/${token}/pdf`} target="_blank">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />Télécharger PDF
            </Button>
          </Link>
        </div>

        {/* Client */}
        {quote.clients && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Destinataire</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{quote.clients.name}</p>
              {quote.clients.email && <p className="text-sm text-gray-500">{quote.clients.email}</p>}
              {quote.clients.phone && <p className="text-sm text-gray-500">{quote.clients.phone}</p>}
              {quote.clients.address_street && (
                <p className="text-sm text-gray-500">
                  {quote.clients.address_street}, {quote.clients.address_zip} {quote.clients.address_city}
                </p>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Prestations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(lines ?? []).map(line => (
              <div key={line.id} className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{line.label}</p>
                  {line.description && <p className="text-xs text-gray-400">{line.description}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {line.quantity} {line.unit} × {Number(line.price_ht).toFixed(2)} € HT
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                  {Number(line.line_total_ht).toFixed(2)} €
                </p>
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
              {company?.vat_applicable ? (
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

        {/* Signature */}
        {(quote.status === 'viewed' || quote.status === 'sent') && (
          <div className="mb-6">
            {new Date(quote.validity_date) < new Date() ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                <p className="font-semibold text-orange-800">Ce devis a expiré</p>
                <p className="text-sm text-orange-600 mt-1">
                  La date de validité ({format(new Date(quote.validity_date), 'd MMMM yyyy', { locale: fr })}) est dépassée.
                  Contactez le prestataire pour obtenir un nouveau devis.
                </p>
              </div>
            ) : (
              <QuoteSignatureForm quoteId={quote.id} publicToken={token} />
            )}
          </div>
        )}

        {quote.status === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-800">Devis accepté</p>
            {quote.signature_data && (
              <p className="text-sm text-green-600 mt-1">
                Signé par {(quote.signature_data as any).name} le{' '}
                {format(new Date((quote.signature_data as any).signed_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            )}
          </div>
        )}

        {quote.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center mb-6">
            <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="font-bold text-red-800">Devis refusé</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">Devis envoyé via Kwik</p>
      </div>
    </div>
  )
}
