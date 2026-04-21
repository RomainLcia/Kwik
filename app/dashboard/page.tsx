import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Kwik</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Bienvenue */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-500 text-sm mt-1">Bienvenue sur Kwik</p>
          </div>
          <Link href="/quotes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau devis
            </Button>
          </Link>
        </div>

        {/* KPIs placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Devis en cours', value: '0', color: 'text-blue-600' },
            { label: 'Acceptés ce mois', value: '0 €', color: 'text-green-600' },
            { label: 'Taux de signature', value: '—', color: 'text-gray-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste devis vide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun devis pour l&apos;instant</p>
              <p className="text-sm text-gray-400 mb-4">Créez votre premier devis en moins de 3 minutes</p>
              <Link href="/quotes/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un devis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Bandeau onboarding */}
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-blue-900">Complétez votre profil entreprise</p>
              <p className="text-sm text-blue-700">Ajoutez votre SIRET et logo pour générer des devis professionnels.</p>
            </div>
            <Link href="/settings">
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Compléter mon profil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
