'use client'

import { useState } from 'react'
import { createCatalogItem, updateCatalogItem, archiveCatalogItem } from '@/app/actions/catalog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, BookOpen, MoreVertical, Pencil, Archive } from 'lucide-react'

type CatalogItem = {
  id: string
  label: string
  description: string | null
  default_price_ht: number
  default_unit: string
  default_vat_rate: number
  category: string | null
}

const UNITS = ['unité', 'heure', 'jour', 'm²', 'ml', 'forfait', 'autre']
const VAT_RATES = [0, 5.5, 10, 20]

function CatalogForm({ item, onClose }: { item?: CatalogItem, onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    if (item) {
      await updateCatalogItem(item.id, formData)
    } else {
      await createCatalogItem(formData)
    }
    setLoading(false)
    onClose()
  }

  return (
    <form action={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label htmlFor="label">Libellé *</Label>
        <Input id="label" name="label" defaultValue={item?.label} required placeholder="Ex: Peinture mur 2 couches" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Input id="description" name="description" defaultValue={item?.description ?? ''} placeholder="Détails de la prestation" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="default_price_ht">Prix unitaire HT (€) *</Label>
          <Input
            id="default_price_ht"
            name="default_price_ht"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.default_price_ht ?? ''}
            required
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_unit">Unité *</Label>
          <select
            id="default_unit"
            name="default_unit"
            defaultValue={item?.default_unit ?? 'unité'}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="default_vat_rate">Taux TVA (%)</Label>
          <select
            id="default_vat_rate"
            name="default_vat_rate"
            defaultValue={item?.default_vat_rate ?? 20}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {VAT_RATES.map(r => <option key={r} value={r}>{r} %</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie (optionnel)</Label>
          <Input id="category" name="category" defaultValue={item?.category ?? ''} placeholder="Ex: Peinture" />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enregistrement...' : item ? 'Mettre à jour' : 'Ajouter la prestation'}
      </Button>
    </form>
  )
}

export function CatalogList({ initialItems }: { initialItems: CatalogItem[] }) {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<CatalogItem | null>(null)

  const filtered = initialItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    (item.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1">{initialItems.length} prestation{initialItems.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle prestation</Button>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle prestation</DialogTitle>
            </DialogHeader>
            <CatalogForm onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une prestation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'Aucun résultat' : 'Catalogue vide'}
            </p>
            {!search && (
              <p className="text-sm text-gray-400 mt-1">Ajoutez vos prestations récurrentes pour gagner du temps</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{item.label}</p>
                    {item.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.default_price_ht.toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">HT / {item.default_unit} · TVA {item.default_vat_rate}%</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none">
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditItem(item)}>
                        <Pencil className="h-4 w-4 mr-2" />Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => archiveCatalogItem(item.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />Archiver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal édition */}
      <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la prestation</DialogTitle>
          </DialogHeader>
          {editItem && <CatalogForm item={editItem} onClose={() => setEditItem(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
