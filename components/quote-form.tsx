'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveQuote, type QuoteLine, type QuoteData } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, ChevronDown, ChevronUp, Save, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const UNITS = ['unité', 'heure', 'jour', 'm²', 'ml', 'forfait', 'autre']
const VAT_RATES = [0, 5.5, 10, 20]

type Client = { id: string; name: string; email: string | null }
type CatalogItem = {
  id: string; label: string; description: string | null
  default_price_ht: number; default_unit: string; default_vat_rate: number
}

type Line = Omit<QuoteLine, 'id'> & { tempId: string }

function newLine(position: number): Line {
  return {
    tempId: Math.random().toString(36).slice(2),
    position,
    label: '',
    description: '',
    quantity: 1,
    unit: 'unité',
    price_ht: 0,
    vat_rate: 20,
    line_total_ht: 0,
    line_total_ttc: 0,
  }
}

function calcLine(line: Line): Line {
  const ht = Math.round(line.quantity * line.price_ht * 100) / 100
  const ttc = Math.round(ht * (1 + line.vat_rate / 100) * 100) / 100
  return { ...line, line_total_ht: ht, line_total_ttc: ttc }
}

interface QuoteFormProps {
  quoteNumber: string
  companyId: string
  vatApplicable: boolean
  clients: Client[]
  catalogItems: CatalogItem[]
  existingQuote?: QuoteData & { id: string }
}

export function QuoteForm({
  quoteNumber, companyId, vatApplicable, clients, catalogItems, existingQuote
}: QuoteFormProps) {
  const router = useRouter()
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  // Form state
  const [quoteId, setQuoteId] = useState<string | undefined>(existingQuote?.id)
  const [clientId, setClientId] = useState(existingQuote?.client_id ?? '')
  const [number] = useState(existingQuote?.number ?? quoteNumber)
  const [object, setObject] = useState(existingQuote?.object ?? '')
  const [issueDate, setIssueDate] = useState(existingQuote?.issue_date ?? today)
  const [validityDate, setValidityDate] = useState(existingQuote?.validity_date ?? in30Days)
  const [discountPercent, setDiscountPercent] = useState(existingQuote?.discount_percent ?? 0)
  const [notes, setNotes] = useState(existingQuote?.notes ?? '')
  const [terms, setTerms] = useState(existingQuote?.terms ?? 'Acompte de 30% à la commande.')
  const [lines, setLines] = useState<Line[]>(
    existingQuote?.lines?.map((l, i) => ({ ...l, tempId: String(i) })) ?? [newLine(0)]
  )
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set())

  // Calculs
  const subtotalHT = lines.reduce((sum, l) => sum + l.line_total_ht, 0)
  const discountAmount = Math.round(subtotalHT * discountPercent / 100 * 100) / 100
  const totalHT = Math.round((subtotalHT - discountAmount) * 100) / 100

  const vatBreakdown = lines.reduce((acc, line) => {
    if (line.line_total_ht === 0) return acc
    const rate = line.vat_rate
    const base = Math.round((line.line_total_ht * (1 - discountPercent / 100)) * 100) / 100
    acc[rate] = (acc[rate] ?? 0) + Math.round(base * rate / 100 * 100) / 100
    return acc
  }, {} as Record<number, number>)

  const totalVAT = Object.values(vatBreakdown).reduce((s, v) => s + v, 0)
  const totalTTC = Math.round((totalHT + totalVAT) * 100) / 100

  // Auto-save debounced
  const doSave = useCallback(async () => {
    setSaving(true)
    const result = await saveQuote({
      id: quoteId,
      client_id: clientId || null,
      number,
      object,
      issue_date: issueDate,
      validity_date: validityDate,
      notes,
      terms,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      subtotal_ht: subtotalHT,
      total_ht: totalHT,
      total_vat: totalVAT,
      total_ttc: totalTTC,
      deposit_percent: null,
      lines: lines.map((l, i) => ({ ...l, position: i })),
    })
    if (result.id && !quoteId) setQuoteId(result.id)
    setSaving(false)
    setSavedAt(new Date())
  }, [quoteId, clientId, number, object, issueDate, validityDate, notes, terms,
    discountPercent, discountAmount, subtotalHT, totalHT, totalVAT, totalTTC, lines])

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(doSave, 2500)
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }
  }, [doSave])

  function updateLine(tempId: string, updates: Partial<Line>) {
    setLines(prev => prev.map(l => l.tempId === tempId ? calcLine({ ...l, ...updates }) : l))
  }

  function removeLine(tempId: string) {
    setLines(prev => prev.filter(l => l.tempId !== tempId))
  }

  function addCatalogItem(item: CatalogItem) {
    const line = calcLine({
      ...newLine(lines.length),
      label: item.label,
      description: item.description ?? '',
      price_ht: item.default_price_ht,
      unit: item.default_unit,
      vat_rate: item.default_vat_rate,
    })
    setLines(prev => [...prev, line])
    setCatalogOpen(false)
  }

  function toggleExpand(tempId: string) {
    setExpandedLines(prev => {
      const next = new Set(prev)
      next.has(tempId) ? next.delete(tempId) : next.add(tempId)
      return next
    })
  }

  async function handleSaveAndExit() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    await doSave()
    router.push('/quotes')
  }

  const filteredCatalog = catalogItems.filter(i =>
    i.label.toLowerCase().includes(catalogSearch.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
      {/* Header page */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{existingQuote ? 'Modifier' : 'Nouveau'} devis</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {saving ? 'Enregistrement...' : savedAt ? `Sauvegardé` : 'Non sauvegardé'}
          </p>
        </div>
        <Button onClick={handleSaveAndExit} size="sm">
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>

      {/* Section 1 — En-tête */}
      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>N° de devis</Label>
              <Input value={number} readOnly className="bg-gray-50 text-gray-500" />
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Sélectionner —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Objet du devis</Label>
            <Input value={object} onChange={e => setObject(e.target.value)} placeholder="Ex: Travaux peinture salon" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date d&apos;émission</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Validité jusqu&apos;au</Label>
              <Input type="date" value={validityDate} onChange={e => setValidityDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Lignes */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Prestations</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCatalogOpen(true)}>
                <BookOpen className="h-4 w-4 mr-1" />Catalogue
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLines(prev => [...prev, newLine(prev.length)])}>
                <Plus className="h-4 w-4 mr-1" />Ligne
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">Ajoutez une prestation depuis le catalogue ou manuellement</p>
          )}
          {lines.map(line => {
            const expanded = expandedLines.has(line.tempId)
            return (
              <div key={line.tempId} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Ligne principale */}
                <div className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Input
                      placeholder="Libellé de la prestation *"
                      value={line.label}
                      onChange={e => updateLine(line.tempId, { label: e.target.value })}
                      className="flex-1"
                    />
                    <button onClick={() => removeLine(line.tempId)} className="p-2 text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Qté</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.quantity}
                        onChange={e => updateLine(line.tempId, { quantity: parseFloat(e.target.value) || 0 })}
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Prix HT (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.price_ht}
                        onChange={e => updateLine(line.tempId, { price_ht: parseFloat(e.target.value) || 0 })}
                        inputMode="decimal"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Total HT</Label>
                      <Input value={`${line.line_total_ht.toFixed(2)} €`} readOnly className="bg-gray-50 text-gray-600 font-medium" />
                    </div>
                  </div>

                  {/* Détails expandables */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(line.tempId)}
                    className="text-xs text-blue-600 flex items-center gap-1"
                  >
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expanded ? 'Moins de détails' : 'Unité, TVA, description'}
                  </button>

                  {expanded && (
                    <div className="space-y-2 pt-1 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500">Unité</Label>
                          <select
                            value={line.unit}
                            onChange={e => updateLine(line.tempId, { unit: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">TVA (%)</Label>
                          <select
                            value={line.vat_rate}
                            onChange={e => updateLine(line.tempId, { vat_rate: parseFloat(e.target.value) })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={!vatApplicable}
                          >
                            {VAT_RATES.map(r => <option key={r} value={r}>{r} %</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Description (optionnel)</Label>
                        <Input
                          placeholder="Détails supplémentaires"
                          value={line.description}
                          onChange={e => updateLine(line.tempId, { description: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Section 3 — Totaux */}
      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="text-base">Totaux</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sous-total HT</span>
            <span className="font-medium">{subtotalHT.toFixed(2)} €</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500">Remise (%)</span>
            <div className="flex items-center gap-2 w-24 flex-shrink-0">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountPercent}
                onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                inputMode="decimal"
                className="text-right"
              />
              <span className="text-sm text-gray-400 flex-shrink-0">%</span>
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remise</span>
              <span className="text-green-600">- {discountAmount.toFixed(2)} €</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total HT</span>
            <span className="font-medium">{totalHT.toFixed(2)} €</span>
          </div>

          {vatApplicable ? (
            Object.entries(vatBreakdown).map(([rate, amount]) => (
              <div key={rate} className="flex justify-between text-sm">
                <span className="text-gray-500">TVA {rate}%</span>
                <span>{Number(amount).toFixed(2)} €</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">TVA non applicable, art. 293 B du CGI</p>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total TTC</span>
            <span className="text-blue-600">{totalTTC.toFixed(2)} €</span>
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Conditions */}
      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="text-base">Conditions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Modalités de paiement</Label>
            <textarea
              value={terms}
              onChange={e => setTerms(e.target.value)}
              placeholder="Ex: Acompte de 30% à la commande, solde à la livraison."
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optionnel)</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Remarques particulières, conditions spécifiques..."
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton flottant bas */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 flex gap-3 max-w-2xl mx-auto">
        <Button variant="outline" className="flex-1 bg-white" onClick={() => router.push('/quotes')}>
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleSaveAndExit}>
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>

      {/* Modal catalogue */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir depuis le catalogue</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Rechercher..."
            value={catalogSearch}
            onChange={e => setCatalogSearch(e.target.value)}
            className="mb-3"
          />
          {filteredCatalog.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Aucune prestation trouvée</p>
          ) : (
            <div className="space-y-2">
              {filteredCatalog.map(item => (
                <button
                  key={item.id}
                  onClick={() => addCatalogItem(item)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                    <span className="text-sm font-semibold text-blue-600 flex-shrink-0 ml-2">
                      {item.default_price_ht.toFixed(2)} €/{item.default_unit}
                    </span>
                  </div>
                  {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
