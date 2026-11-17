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

  const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  const count = invoices?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900">Factures</h1>
          <p className="text-[13px] text-gray-500 mt-0.5 tabular">{count} facture{count > 1 ? 's' : ''} · {paid.length} payée{paid.length > 1 ? 's' : ''}</p>
        </div>
        {totalUnpaid > 0 && (
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500">À encaisser</p>
            <p className="font-display tabular text-xl font-semibold text-gray-900">{eur(totalUnpaid)}</p>
          </div>
        )}
      </div>

      {(!invoices || invoices.length === 0) ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white text-center py-16 px-4">
          <FileText className="h-6 w-6 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">Aucune facture pour le moment</p>
          <p className="text-[13px] text-gray-500 mt-1">Ouvrez un devis accepté et cliquez sur « Convertir en facture ».</p>
        </div>
      ) : (
        <ul className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {invoices.map(invoice => (
            <li key={invoice.id}>
              <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-4 px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[13px] text-gray-900">{invoice.number}</span>
                    <InvoicePaymentBadge status={invoice.payment_status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    <span className="text-gray-900">{invoice.clients?.name ?? 'Sans client'}</span> · échéance {format(new Date(invoice.due_date), 'd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <p className="tabular text-sm font-semibold text-gray-900 flex-shrink-0">{eur(Number(invoice.total_ttc))}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
