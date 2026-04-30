'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Company = {
  id: string
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
  iban: string | null
  quote_prefix: string | null
  invoice_prefix: string | null
  legal_mentions: string | null
}

export function SettingsForm({ company }: { company: Company }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [vatApplicable, setVatApplicable] = useState(company.vat_applicable)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const form = e.currentTarget
    const getValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || null

    const supabase = createClient()
    await supabase.from('companies').update({
      name: getValue('name') ?? company.name,
      siret: getValue('siret'),
      legal_form: getValue('legal_form'),
      address_street: getValue('address_street'),
      address_zip: getValue('address_zip'),
      address_city: getValue('address_city'),
      phone: getValue('phone'),
      contact_email: getValue('contact_email'),
      vat_applicable: vatApplicable,
      vat_number: getValue('vat_number'),
      iban: getValue('iban'),
      quote_prefix: getValue('quote_prefix') ?? 'DEV',
      invoice_prefix: getValue('invoice_prefix') ?? 'FAC',
      legal_mentions: getValue('legal_mentions'),
    }).eq('id', company.id)

    setLoading(false)
    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nom commercial *</Label>
              <Input id="name" name="name" defaultValue={company.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" name="siret" defaultValue={company.siret ?? ''} maxLength={14} inputMode="numeric" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_form">Forme juridique</Label>
              <select name="legal_form" defaultValue={company.legal_form ?? 'micro-entreprise'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {['micro-entreprise','EI','EURL','SARL','SAS','SASU','autre'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" defaultValue={company.phone ?? ''} inputMode="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email pro</Label>
              <Input id="contact_email" name="contact_email" type="email" defaultValue={company.contact_email ?? ''} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Adresse</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_street">Rue</Label>
            <Input id="address_street" name="address_street" defaultValue={company.address_street ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="address_zip">Code postal</Label>
              <Input id="address_zip" name="address_zip" defaultValue={company.address_zip ?? ''} inputMode="numeric" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_city">Ville</Label>
              <Input id="address_city" name="address_city" defaultValue={company.address_city ?? ''} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">TVA & facturation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" id="vat_applicable" checked={vatApplicable} onChange={e => setVatApplicable(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="vat_applicable" className="cursor-pointer">Assujetti à la TVA</Label>
          </div>
          {vatApplicable && (
            <div className="space-y-2">
              <Label htmlFor="vat_number">N° TVA intracommunautaire</Label>
              <Input id="vat_number" name="vat_number" defaultValue={company.vat_number ?? ''} placeholder="FR12345678901" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quote_prefix">Préfixe devis</Label>
              <Input id="quote_prefix" name="quote_prefix" defaultValue={company.quote_prefix ?? 'DEV'} placeholder="DEV" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Préfixe factures</Label>
              <Input id="invoice_prefix" name="invoice_prefix" defaultValue={company.invoice_prefix ?? 'FAC'} placeholder="FAC" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN (affiché sur les factures)</Label>
            <Input id="iban" name="iban" defaultValue={company.iban ?? ''} placeholder="FR76 3000 6000 0112 3456 7890 189" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Mentions légales (PDF)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="legal_mentions">Pied de page des devis et factures</Label>
            <textarea
              id="legal_mentions"
              name="legal_mentions"
              defaultValue={company.legal_mentions ?? ''}
              placeholder="Ex: SARL Dupont — SIRET 123 456 789 00012 — Capital 1 000 €"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <p className="text-xs text-gray-400">Apparaît en bas de chaque PDF. Si vide, les infos de votre profil sont utilisées automatiquement.</p>
          </div>
        </CardContent>
      </Card>

      {success && <p className="text-sm text-green-600 bg-green-50 rounded-md px-3 py-2">Profil mis à jour ✓</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
      </Button>
    </form>
  )
}
