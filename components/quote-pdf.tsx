import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

export type PDFCompany = {
  name: string
  siret: string | null
  legal_form: string | null
  address_street: string | null
  address_zip: string | null
  address_city: string | null
  phone: string | null
  contact_email: string | null
  vat_applicable: boolean
  vat_number: string | null
  legal_mentions: string | null
  logo_url: string | null
}

export type PDFClient = {
  name: string
  email: string | null
  phone: string | null
  address_street: string | null
  address_zip: string | null
  address_city: string | null
} | null

export type PDFLine = {
  label: string
  description: string | null
  quantity: number
  unit: string
  price_ht: number
  vat_rate: number
  line_total_ht: number
}

export type PDFQuote = {
  number: string
  object: string | null
  issue_date: string
  validity_date: string
  discount_percent: number
  discount_amount: number
  subtotal_ht: number
  total_ht: number
  total_vat: number
  total_ttc: number
  notes: string | null
  terms: string | null
}

interface QuoteDocumentProps {
  quote: PDFQuote
  lines: PDFLine[]
  company: PDFCompany
  client: PDFClient
}

const blue = '#2563EB'
const gray = '#6B7280'
const light = '#9CA3AF'
const bg = '#F9FAFB'
const border = '#E5E7EB'
const dark = '#374151'
const green = '#16A34A'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 44,
    paddingBottom: 64,
    paddingHorizontal: 44,
    color: '#111827',
  },
  row: { flexDirection: 'row' },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  logoImg: { width: 120, height: 48, objectFit: 'contain', objectPositionX: 0, objectPositionY: 0, marginBottom: 6 },
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  companyLine: { fontSize: 8.5, color: gray, marginBottom: 2 },
  docTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: blue, marginBottom: 5 },
  docNumber: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  docMeta: { fontSize: 8.5, color: gray, marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: border, marginVertical: 14 },
  thinDivider: { borderBottomWidth: 0.5, borderBottomColor: border, marginVertical: 5 },
  sectionLabel: { fontSize: 7, color: light, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 },
  clientBlock: { flex: 1, backgroundColor: bg, padding: 11, borderRadius: 3, marginBottom: 14 },
  clientName: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  clientLine: { fontSize: 8.5, color: gray, marginBottom: 1.5 },
  objectBlock: { marginBottom: 14, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: blue },
  objectLabel: { fontSize: 7, color: light, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 },
  objectText: { fontSize: 9.5, color: dark },
  tableWrap: { marginBottom: 8 },
  th: { flexDirection: 'row', backgroundColor: '#F3F4F6', paddingVertical: 5, paddingHorizontal: 7 },
  thCell: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: gray, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 7, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  tdLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tdDesc: { fontSize: 7.5, color: light, marginTop: 2 },
  tdText: { fontSize: 9, color: dark },
  tdRight: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  totalsSection: { alignItems: 'flex-end', marginTop: 8 },
  totalsInner: { width: 210 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  tLabel: { fontSize: 8.5, color: gray },
  tVal: { fontSize: 8.5 },
  tValGreen: { fontSize: 8.5, color: green },
  tBig: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  tBigBlue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: blue },
  condBlock: { marginTop: 18, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: border },
  condLabel: { fontSize: 7, color: light, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  condText: { fontSize: 8.5, color: dark },
  condSection: { marginBottom: 10 },
  footer: { position: 'absolute', bottom: 28, left: 44, right: 44, borderTopWidth: 0.5, borderTopColor: border, paddingTop: 6 },
  footerText: { fontSize: 7, color: light, textAlign: 'center' },
})

function fmt(n: number) {
  return n.toFixed(2).replace('.', ',') + ' \u20AC'
}

function fmtDate(d: string) {
  const parts = d.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export function QuoteDocument({ quote, lines, company, client }: QuoteDocumentProps) {
  const vatBreakdown = lines.reduce((acc, line) => {
    if (Number(line.line_total_ht) === 0) return acc
    const rate = line.vat_rate
    const base = Number(line.line_total_ht) * (1 - Number(quote.discount_percent) / 100)
    acc[rate] = (acc[rate] ?? 0) + base * rate / 100
    return acc
  }, {} as Record<number, number>)

  const legalParts = []
  if (company.legal_mentions) {
    legalParts.push(company.legal_mentions)
  } else {
    legalParts.push(company.name)
    if (company.legal_form) legalParts.push(company.legal_form)
    if (company.siret) legalParts.push(`SIRET: ${company.siret}`)
  }
  if (company.vat_applicable && company.vat_number) {
    legalParts.push(`N\u00B0 TVA: ${company.vat_number}`)
  } else if (!company.vat_applicable) {
    legalParts.push('TVA non applicable, art. 293 B du CGI')
  }
  const legalText = legalParts.join(' \u2014 ')

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* En-tete */}
        <View style={s.row}>
          <View style={s.headerLeft}>
            {company.logo_url ? (
              <Image src={company.logo_url} style={s.logoImg} />
            ) : null}
            <Text style={s.companyName}>{company.name}</Text>
            {company.legal_form ? <Text style={s.companyLine}>{company.legal_form}</Text> : null}
            {company.address_street ? <Text style={s.companyLine}>{company.address_street}</Text> : null}
            {(company.address_zip || company.address_city) ? (
              <Text style={s.companyLine}>{[company.address_zip, company.address_city].filter(Boolean).join(' ')}</Text>
            ) : null}
            {company.phone ? <Text style={s.companyLine}>{company.phone}</Text> : null}
            {company.contact_email ? <Text style={s.companyLine}>{company.contact_email}</Text> : null}
            {company.siret ? <Text style={s.companyLine}>SIRET: {company.siret}</Text> : null}
          </View>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>DEVIS</Text>
            <Text style={s.docNumber}>{quote.number}</Text>
            <Text style={s.docMeta}>Emis le {fmtDate(quote.issue_date)}</Text>
            <Text style={s.docMeta}>Valable jusqu'au {fmtDate(quote.validity_date)}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Client */}
        {client ? (
          <View style={s.clientBlock}>
            <Text style={s.sectionLabel}>Destinataire</Text>
            <Text style={s.clientName}>{client.name}</Text>
            {client.email ? <Text style={s.clientLine}>{client.email}</Text> : null}
            {client.phone ? <Text style={s.clientLine}>{client.phone}</Text> : null}
            {client.address_street ? <Text style={s.clientLine}>{client.address_street}</Text> : null}
            {(client.address_zip || client.address_city) ? (
              <Text style={s.clientLine}>{[client.address_zip, client.address_city].filter(Boolean).join(' ')}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Objet */}
        {quote.object ? (
          <View style={s.objectBlock}>
            <Text style={s.objectLabel}>Objet</Text>
            <Text style={s.objectText}>{quote.object}</Text>
          </View>
        ) : null}

        {/* Tableau des lignes */}
        <View style={s.tableWrap}>
          <View style={s.th}>
            <Text style={[s.thCell, { flex: 1 }]}>Prestation</Text>
            <Text style={[s.thCell, { width: 38, textAlign: 'right' }]}>Qte</Text>
            <Text style={[s.thCell, { width: 48, textAlign: 'right' }]}>Unite</Text>
            <Text style={[s.thCell, { width: 74, textAlign: 'right' }]}>Prix HT</Text>
            <Text style={[s.thCell, { width: 74, textAlign: 'right' }]}>Total HT</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={s.tr} wrap={false}>
              <View style={{ flex: 1 }}>
                <Text style={s.tdLabel}>{line.label}</Text>
                {line.description ? <Text style={s.tdDesc}>{line.description}</Text> : null}
              </View>
              <Text style={[s.tdText, { width: 38, textAlign: 'right' }]}>{line.quantity}</Text>
              <Text style={[s.tdText, { width: 48, textAlign: 'right' }]}>{line.unit}</Text>
              <Text style={[s.tdText, { width: 74, textAlign: 'right' }]}>{fmt(Number(line.price_ht))}</Text>
              <Text style={[s.tdRight, { width: 74, textAlign: 'right' }]}>{fmt(Number(line.line_total_ht))}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={s.totalsSection}>
          <View style={s.totalsInner}>
            <View style={s.totalsRow}>
              <Text style={s.tLabel}>Sous-total HT</Text>
              <Text style={s.tVal}>{fmt(Number(quote.subtotal_ht))}</Text>
            </View>
            {Number(quote.discount_percent) > 0 ? (
              <View style={s.totalsRow}>
                <Text style={s.tLabel}>Remise ({quote.discount_percent}%)</Text>
                <Text style={s.tValGreen}>- {fmt(Number(quote.discount_amount))}</Text>
              </View>
            ) : null}
            <View style={s.thinDivider} />
            <View style={s.totalsRow}>
              <Text style={s.tLabel}>Total HT</Text>
              <Text style={s.tVal}>{fmt(Number(quote.total_ht))}</Text>
            </View>
            {company.vat_applicable ? (
              Object.entries(vatBreakdown).map(([rate, amount]) => (
                <View key={rate} style={s.totalsRow}>
                  <Text style={s.tLabel}>TVA {rate}%</Text>
                  <Text style={s.tVal}>{fmt(Number(amount))}</Text>
                </View>
              ))
            ) : (
              <View style={s.totalsRow}>
                <Text style={[s.tLabel, { fontSize: 7.5 }]}>TVA non applicable</Text>
              </View>
            )}
            <View style={s.thinDivider} />
            <View style={s.totalsRow}>
              <Text style={s.tBig}>TOTAL TTC</Text>
              <Text style={s.tBigBlue}>{fmt(Number(quote.total_ttc))}</Text>
            </View>
          </View>
        </View>

        {/* Conditions */}
        {(quote.terms || quote.notes) ? (
          <View style={s.condBlock}>
            {quote.terms ? (
              <View style={s.condSection}>
                <Text style={s.condLabel}>Modalites de paiement</Text>
                <Text style={s.condText}>{quote.terms}</Text>
              </View>
            ) : null}
            {quote.notes ? (
              <View style={s.condSection}>
                <Text style={s.condLabel}>Notes</Text>
                <Text style={s.condText}>{quote.notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{legalText}</Text>
        </View>
      </Page>
    </Document>
  )
}
