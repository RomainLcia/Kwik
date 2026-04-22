'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline" className="w-full">
      {loading ? 'Chargement...' : 'Gérer mon abonnement'}
    </Button>
  )
}
