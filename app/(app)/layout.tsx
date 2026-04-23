import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { AppBottomNav } from '@/components/app-bottom-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, subscription_status, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/onboarding')

  // Bloquer l'accès si pas d'abonnement Stripe actif
  const status = company.subscription_status
  const hasStripe = !!company.stripe_customer_id
  const allowed = (status === 'active' || status === 'trial') && hasStripe
  if (!allowed) {
    redirect('/subscribe')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <AppSidebar userEmail={user.email ?? ''} companyName={company.name} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <AppBottomNav />
    </div>
  )
}
