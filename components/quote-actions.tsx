'use client'

import { updateQuoteStatus, deleteQuote } from '@/app/actions/quotes'
import { sendQuoteByEmail } from '@/app/actions/send-quote'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle, XCircle, Trash2, Download, Mail, Link2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface QuoteActionsProps {
  quoteId: string
  status: string
  totalTTC: number
  clientEmail: string | null
  publicToken: string
}

export function QuoteActions({ quoteId, status, totalTTC, clientEmail, publicToken }: QuoteActionsProps) {
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

  async function handleSendEmail() {
    setLoading(true)
    const result = await sendQuoteByEmail(quoteId)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Email envoyé à ${clientEmail}`)
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/q/${publicToken}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié dans le presse-papiers')
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Télécharger PDF */}
      <a href={`/api/quotes/${quoteId}/pdf`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />PDF
        </Button>
      </a>

      {/* Envoyer par email */}
      {status !== 'accepted' && status !== 'rejected' && (
        <Button
          onClick={handleSendEmail}
          disabled={loading || !clientEmail}
          variant="outline"
          size="sm"
          title={!clientEmail ? 'Ce client n\'a pas d\'email renseigné' : undefined}
        >
          <Mail className="h-4 w-4 mr-2" />
          {status === 'draft' ? 'Envoyer par email' : 'Renvoyer'}
        </Button>
      )}

      {/* Copier le lien de consultation */}
      {status !== 'draft' && (
        <Button onClick={handleCopyLink} variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-2" />Copier le lien
        </Button>
      )}

      {/* Marquer comme envoyé manuellement */}
      {status === 'draft' && (
        <Button onClick={() => handleStatus('sent')} disabled={loading} size="sm">
          <Send className="h-4 w-4 mr-2" />Marquer comme envoyé
        </Button>
      )}

      {/* Accepté / Refusé */}
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

      {/* Supprimer */}
      {status === 'draft' && (
        <Button onClick={handleDelete} disabled={loading} variant="ghost" size="sm" className="text-red-500 ml-auto">
          <Trash2 className="h-4 w-4 mr-2" />Supprimer
        </Button>
      )}
    </div>
  )
}
