'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function SubscribeButton({ plan = 'basic', label }: { plan?: string; label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
      {loading ? 'Chargement...' : (label ?? 'Commencer l\'essai gratuit →')}
    </Button>
  )
}
