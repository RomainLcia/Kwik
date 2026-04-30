'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function NewQuoteButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    router.push('/quotes/new')
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading
        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        : <Plus className="h-4 w-4 mr-2" />
      }
      {loading ? 'Chargement...' : 'Nouveau devis'}
    </Button>
  )
}
