import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus } from 'lucide-react'

export default async function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
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

      {/* KPIs */}
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
    </div>
  )
}
