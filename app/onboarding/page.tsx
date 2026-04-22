'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vatApplicable, setVatApplicable] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      siret: (form.elements.namedItem('siret') as HTMLInputElement).value.replace(/\s/g, ''),
      legal_form: (form.elements.namedItem('legal_form') as HTMLInputElement).value,
      address_street: (form.elements.namedItem('address_street') as HTMLInputElement).value,
      address_zip: (form.elements.namedItem('address_zip') as HTMLInputElement).value,
      address_city: (form.elements.namedItem('address_city') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      contact_email: (form.elements.namedItem('contact_email') as HTMLInputElement).value,
      vat_applicable: vatApplicable,
    }

    if (data.siret.length !== 14 || !/^\d+$/.test(data.siret)) {
      setError('Le SIRET doit contenir exactement 14 chiffres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: dbError } = await supabase.from('companies').insert({
      ...data,
      user_id: user.id,
    })

    if (dbError) {
      setError('Erreur lors de la sauvegarde. Réessayez.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-gray-900">Kwik</span>
          <p className="text-gray-500 mt-1">Configurez votre profil pour commencer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Votre entreprise</CardTitle>
            <CardDescription>Ces informations apparaîtront sur vos devis et factures</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nom commercial *</Label>
                  <Input id="name" name="name" placeholder="Ex: Peinture Dupont" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET * (14 chiffres)</Label>
                  <Input id="siret" name="siret" placeholder="12345678901234" maxLength={14} required inputMode="numeric" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_form">Forme juridique *</Label>
                  <select
                    id="legal_form"
                    name="legal_form"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="micro-entreprise">Micro-entreprise</option>
                    <option value="EI">EI</option>
                    <option value="EURL">EURL</option>
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SASU">SASU</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address_street">Adresse *</Label>
                  <Input id="address_street" name="address_street" placeholder="12 rue de la Paix" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zip">Code postal *</Label>
                  <Input id="address_zip" name="address_zip" placeholder="75001" maxLength={5} required inputMode="numeric" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_city">Ville *</Label>
                  <Input id="address_city" name="address_city" placeholder="Paris" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input id="phone" name="phone" placeholder="06 12 34 56 78" required inputMode="tel" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email pro *</Label>
                  <Input id="contact_email" name="contact_email" type="email" placeholder="vous@exemple.fr" required />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="vat_applicable"
                    checked={vatApplicable}
                    onChange={e => setVatApplicable(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div>
                    <Label htmlFor="vat_applicable" className="cursor-pointer">Assujetti à la TVA</Label>
                    <p className="text-xs text-gray-500">Décochez si vous êtes en micro-entreprise sous le seuil TVA</p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Accéder à mon espace →'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
