'use client'

import { useState } from 'react'
import { createClient_action, updateClient, archiveClient } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, User, Building2, Phone, Mail, MoreVertical, Pencil, Archive } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type Client = {
  id: string
  name: string
  client_type: string
  email: string | null
  phone: string | null
  address_street: string | null
  address_zip: string | null
  address_city: string | null
  notes: string | null
}

function ClientForm({ client, onClose }: { client?: Client, onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    if (client) {
      await updateClient(client.id, formData)
    } else {
      await createClient_action(formData)
    }
    setLoading(false)
    onClose()
  }

  return (
    <form action={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label>Type de client</Label>
        <div className="flex gap-3">
          {['particulier', 'professionnel'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="client_type" value={type} defaultChecked={client ? client.client_type === type : type === 'particulier'} />
              <span className="text-sm capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom / Raison sociale *</Label>
        <Input id="name" name="name" defaultValue={client?.name} required placeholder="Martin Dupont" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email ?? ''} placeholder="martin@exemple.fr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ''} placeholder="06 12 34 56 78" inputMode="tel" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_street">Adresse</Label>
        <Input id="address_street" name="address_street" defaultValue={client?.address_street ?? ''} placeholder="12 rue de la Paix" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="address_zip">Code postal</Label>
          <Input id="address_zip" name="address_zip" defaultValue={client?.address_zip ?? ''} placeholder="75001" inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_city">Ville</Label>
          <Input id="address_city" name="address_city" defaultValue={client?.address_city ?? ''} placeholder="Paris" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Input id="notes" name="notes" defaultValue={client?.notes ?? ''} placeholder="Informations complémentaires" />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Ajouter le client'}
      </Button>
    </form>
  )
}

export function ClientsList({ initialClients }: { initialClients: Client[] }) {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)

  const filtered = initialClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{initialClients.length} client{initialClients.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouveau client</Button>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>
            <ClientForm onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'Aucun résultat' : 'Aucun client pour l\'instant'}
            </p>
            {!search && (
              <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier client pour commencer</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => (
            <Card key={client.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
                    {client.client_type === 'professionnel'
                      ? <Building2 className="h-4 w-4 text-blue-600" />
                      : <User className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{client.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />{client.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="hidden sm:flex text-xs capitalize">
                    {client.client_type}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none">
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditClient(client)}>
                        <Pencil className="h-4 w-4 mr-2" />Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => archiveClient(client.id)}
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
      <Dialog open={!!editClient} onOpenChange={open => !open && setEditClient(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {editClient && <ClientForm client={editClient} onClose={() => setEditClient(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
