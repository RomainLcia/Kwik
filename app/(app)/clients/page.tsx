import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsList } from '@/components/clients-list'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/onboarding')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', company.id)
    .is('archived_at', null)
    .order('name')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ClientsList initialClients={clients ?? []} />
    </div>
  )
}
