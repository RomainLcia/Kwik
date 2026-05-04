import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InvoicePaymentBadge } from '@/components/invoice-status-badge'
import { InvoiceActions } from '@/components/invoice-actions'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id, vat_applicable').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!invoice) notFound()

  const { data: lines } = await supabase
    .from('invoice_lines')
    .select('*')
    .eq('invoice_id', id)
    .order('position')

  const discountPercent = Number(invoice.discount_percent ?? 0)
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
        <Link href="/invoices">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{invoice.number}</h1>
            <InvoicePaymentBadge status={invoice.payment_status} />
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Émise le {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: fr })} ·
            Échéance le {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: fr })}
            {invoice.payment_status === 'paid' && invoice.paid_at && (
              <> · <span className="text-green-600 font-medium">Réglée le {format(new Date(invoice.paid_at), 'd MMMM yyyy', { locale: fr })}</span></>
            )}
          </p>
        </div>
        {invoice.quote_id && (
          <Link href={`/quotes/${invoice.quote_id}`}>
            <Button variant="outline" size="sm" className="text-xs">Voir le devis</Button>
          </Link>
        )}
      </div>

      {/* Actions */}
      <InvoiceActions invoiceId={id} paymentStatus={invoice.payment_status} />

      {/* Client */}
      {invoice.clients && (
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Client</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.clients.name}</p>
            {invoice.clients.email && <p className="text-sm text-gray-500">{invoice.clients.email}</p>}
            {invoice.clients.phone && <p className="text-sm text-gray-500">{invoice.clients.phone}</p>}
            {invoice.clients.address_street && (
              <p className="text-sm text-gray-500">
                {invoice.clients.address_street}, {invoice.clients.address_zip} {invoice.clients.address_city}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objet */}
      {invoice.object && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <p className="text-sm text-gray-500 mb-1">Objet</p>
            <p className="font-medium">{invoice.object}</p>
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
              <span>{Number(invoice.subtotal_ht).toFixed(2)} €</span>
            </div>
            {Number(invoice.discount_percent) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Remise ({invoice.discount_percent}%)</span>
                <span className="text-green-600">- {Number(invoice.discount_amount).toFixed(2)} €</span>
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
              <span className="text-blue-600">{Number(invoice.total_ttc).toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      {(invoice.terms || invoice.notes) && (
        <Card className="mb-4">
          <CardContent className="py-3 space-y-2">
            {invoice.terms && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Modalités de paiement</p>
                <p className="text-sm text-gray-700">{invoice.terms}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
