import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { InvoicePaymentBadge } from '@/components/invoice-status-badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FileText } from 'lucide-react'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/onboarding')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(name)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const unpaid = invoices?.filter(i => i.payment_status === 'unpaid') ?? []
  const paid = invoices?.filter(i => i.payment_status === 'paid') ?? []

  const totalUnpaid = unpaid.reduce((sum, i) => sum + Number(i.total_ttc), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-400 mt-0.5">{invoices?.length ?? 0} facture{(invoices?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        {totalUnpaid > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">En attente</p>
            <p className="text-lg font-bold text-orange-600">{totalUnpaid.toFixed(2)} €</p>
          </div>
        )}
      </div>

      {(!invoices || invoices.length === 0) ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune facture</p>
          <p className="text-sm mt-1">Convertissez un devis accepté en facture</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(invoice => (
            <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{invoice.number}</p>
                    <InvoicePaymentBadge status={invoice.payment_status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {invoice.clients?.name ?? 'Sans client'} · Échéance {format(new Date(invoice.due_date), 'd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm flex-shrink-0 ml-3">
                  {Number(invoice.total_ttc).toFixed(2)} €
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
