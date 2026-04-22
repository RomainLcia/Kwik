import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument } from '@/components/invoice-pdf'

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

  const [{ data: invoice }, { data: lines }] = await Promise.all([
    supabase.from('invoices')
      .select('*, clients(name, email, phone, address_street, address_zip, address_city)')
      .eq('id', id).eq('company_id', company.id).single(),
    supabase.from('invoice_lines').select('*').eq('invoice_id', id).order('position'),
  ])

  if (!invoice) return new NextResponse('Non trouvé', { status: 404 })

  const buffer = await renderToBuffer(
    React.createElement(InvoiceDocument, {
      invoice,
      lines: lines ?? [],
      company,
      client: invoice.clients ?? null,
    }) as any
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${invoice.number}.pdf"`,
    },
  })
}
