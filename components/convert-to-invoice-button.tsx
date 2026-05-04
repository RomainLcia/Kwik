'use client'

import { createInvoiceFromQuote } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ConvertToInvoiceButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleConvert() {
    if (!confirm('Créer une facture à partir de ce devis ?')) return
    setLoading(true)
    try {
      const result = await createInvoiceFromQuote(quoteId)
      if (result?.error) {
        toast.error(result.error)
        setLoading(false)
      }
      // En cas de succès, l'action redirige automatiquement
    } catch {
      toast.error('Erreur lors de la création de la facture.')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConvert} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
      <FileText className="h-4 w-4 mr-2" />
      {loading ? 'Création...' : 'Créer la facture'}
    </Button>
  )
}
