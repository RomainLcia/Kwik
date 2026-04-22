'use client'

import { markInvoicePaid, markInvoiceUnpaid } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface InvoiceActionsProps {
  invoiceId: string
  paymentStatus: string
}

export function InvoiceActions({ invoiceId, paymentStatus }: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false)

  async function handlePaid() {
    setLoading(true)
    await markInvoicePaid(invoiceId)
    setLoading(false)
    toast.success('Facture marquée comme payée')
  }

  async function handleUnpaid() {
    setLoading(true)
    await markInvoiceUnpaid(invoiceId)
    setLoading(false)
    toast.success('Facture remise en attente de paiement')
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />PDF
        </Button>
      </a>

      {paymentStatus === 'unpaid' && (
        <Button onClick={handlePaid} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />Marquer comme payée
        </Button>
      )}

      {paymentStatus === 'paid' && (
        <Button onClick={handleUnpaid} disabled={loading} variant="outline" size="sm" className="text-gray-500">
          <RotateCcw className="h-4 w-4 mr-2" />Remettre en attente
        </Button>
      )}
    </div>
  )
}
