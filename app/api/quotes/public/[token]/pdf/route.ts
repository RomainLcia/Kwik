import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuoteDocument } from '@/components/quote-pdf'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
    .eq('public_token', token)
    .single()

  if (!quote) return new NextResponse('Non trouvé', { status: 404 })

  const [{ data: lines }, { data: company }] = await Promise.all([
    supabase.from('quote_lines').select('*').eq('quote_id', quote.id).order('position'),
    supabase.from('companies').select('*').eq('id', quote.company_id).single(),
  ])

  if (!company) return new NextResponse('Non trouvé', { status: 404 })

  // Convertit le logo en base64 pour react-pdf
  let logoDataUrl: string | null = null
  if (company.logo_url) {
    try {
      const res = await fetch(company.logo_url)
      const arrayBuffer = await res.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const contentType = res.headers.get('content-type') ?? 'image/png'
      logoDataUrl = `data:${contentType};base64,${base64}`
    } catch {}
  }

  const buffer = await renderToBuffer(
    React.createElement(QuoteDocument, {
      quote,
      lines: lines ?? [],
      company: { ...company, logo_url: logoDataUrl },
      client: quote.clients ?? null,
    }) as any
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="devis-${quote.number}.pdf"`,
    },
  })
}
