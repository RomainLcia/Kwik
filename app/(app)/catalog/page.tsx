import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CatalogList } from '@/components/catalog-list'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/onboarding')

  const { data: items } = await supabase
    .from('catalog_items')
    .select('*')
    .eq('company_id', company.id)
    .is('archived_at', null)
    .order('label')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <CatalogList initialItems={items ?? []} />
    </div>
  )
}
