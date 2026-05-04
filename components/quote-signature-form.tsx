'use client'

import { signQuote, rejectQuote } from '@/app/actions/sign-quote'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface QuoteSignatureFormProps {
  quoteId: string
  publicToken: string
}

export function QuoteSignatureForm({ quoteId, publicToken }: QuoteSignatureFormProps) {
  const [name, setName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<'signed' | 'rejected' | null>(null)
  const [error, setError] = useState('')

  async function handleSign() {
    if (!name.trim() || !accepted) return
    setLoading(true)
    setError('')
    try {
      await signQuote(quoteId, name.trim(), publicToken)
      setDone('signed')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!confirm('Confirmer le refus de ce devis ?')) return
    setLoading(true)
    setError('')
    try {
      await rejectQuote(quoteId, publicToken)
      setDone('rejected')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (done === 'signed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <p className="font-bold text-green-800 text-lg">Devis accepté</p>
        <p className="text-sm text-green-600 mt-1">
          Votre signature a bien été enregistrée. Le prestataire a été notifié.
        </p>
      </div>
    )
  }

  if (done === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="font-bold text-red-800 text-lg">Devis refusé</p>
        <p className="text-sm text-red-600 mt-1">Le prestataire a été informé de votre décision.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <p className="font-semibold text-gray-900">Signer ce devis</p>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">Votre nom complet</label>
        <Input
          placeholder="Prénom Nom"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600"
        />
        <span className="text-sm text-gray-700">
          J&apos;accepte ce devis et ses conditions. Je reconnais avoir lu et approuvé l&apos;ensemble des prestations et montants indiqués.
        </span>
      </label>

      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSign}
          disabled={loading || !name.trim() || !accepted}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {loading ? 'Signature...' : 'Signer et accepter'}
        </Button>
        <Button
          onClick={handleReject}
          disabled={loading}
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50"
        >
          Refuser
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <p className="text-xs text-gray-400 text-center">
        Signature électronique simple — votre IP et l&apos;horodatage seront enregistrés.
      </p>
    </div>
  )
}
