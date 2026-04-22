import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuoteDocument } from '@/components/quote-pdf'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Non autorisé', { status: 401 })

  const { data: company } = await supabase
    .from('companies').select('*').eq('user_id', user.id).single()
  if (!company) return new NextResponse('Non trouvé', { status: 404 })

  const [{ data: quote }, { data: lines }] = await Promise.all([
    supabase.from('quotes')
      .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
      .eq('id', id).eq('company_id', company.id).single(),
    supabase.from('quote_lines').select('*').eq('quote_id', id).order('position'),
  ])

  if (!quote) return new NextResponse('Non trouvé', { status: 404 })

  const buffer = await renderToBuffer(
    React.createElement(QuoteDocument, {
      quote,
      lines: lines ?? [],
      company,
      client: quote.clients ?? null,
    })
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="devis-${quote.number}.pdf"`,
    },
  })
}
