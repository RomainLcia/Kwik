'use client'

import { updateQuoteStatus, deleteQuote } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface QuoteActionsProps {
  quoteId: string
  status: string
  totalTTC: number
}

export function QuoteActions({ quoteId, status, totalTTC }: QuoteActionsProps) {
  const [loading, setLoading] = useState(false)

  async function handleStatus(newStatus: string) {
    setLoading(true)
    await updateQuoteStatus(quoteId, newStatus)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce devis définitivement ?')) return
    setLoading(true)
    await deleteQuote(quoteId)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {status === 'draft' && (
        <Button onClick={() => handleStatus('sent')} disabled={loading} size="sm">
          <Send className="h-4 w-4 mr-2" />Marquer comme envoyé
        </Button>
      )}
      {(status === 'sent' || status === 'viewed') && (
        <>
          <Button onClick={() => handleStatus('accepted')} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />Accepté
          </Button>
          <Button onClick={() => handleStatus('rejected')} disabled={loading} variant="outline" size="sm" className="text-red-600 border-red-200">
            <XCircle className="h-4 w-4 mr-2" />Refusé
          </Button>
        </>
      )}
      {totalTTC >= 1500 && (status === 'sent' || status === 'viewed') && (
        <p className="w-full text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
          ⚠️ Montant ≥ 1 500 € — Une signature électronique avancée est recommandée pour ce devis.
        </p>
      )}
      {status === 'draft' && (
        <Button onClick={handleDelete} disabled={loading} variant="ghost" size="sm" className="text-red-500 ml-auto">
          <Trash2 className="h-4 w-4 mr-2" />Supprimer
        </Button>
      )}
    </div>
  )
}
