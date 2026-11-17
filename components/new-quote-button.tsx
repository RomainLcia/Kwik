'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function NewQuoteButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    router.push('/quotes/new')
  }

  return (
    <Button onClick={handleClick} disabled={loading} className={`h-9 px-3.5 gap-1.5 ${className ?? ''}`}>
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Plus className="h-4 w-4" />
      }
      {loading ? 'Ouverture…' : 'Nouveau devis'}
    </Button>
  )
}
