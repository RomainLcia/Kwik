'use client'

import { createInvoiceFromQuote } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useState } from 'react'

export function ConvertToInvoiceButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleConvert() {
    if (!confirm('Créer une facture à partir de ce devis ?')) return
    setLoading(true)
    await createInvoiceFromQuote(quoteId)
  }

  return (
    <Button onClick={handleConvert} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
      <FileText className="h-4 w-4 mr-2" />
      {loading ? 'Création...' : 'Créer la facture'}
    </Button>
  )
}
