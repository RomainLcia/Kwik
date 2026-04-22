'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getCompanyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/onboarding')
  return { supabase, companyId: company.id }
}

export async function createCatalogItem(formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('catalog_items').insert({
    company_id: companyId,
    label: formData.get('label') as string,
    description: formData.get('description') as string || null,
    default_price_ht: parseFloat(formData.get('default_price_ht') as string) || 0,
    default_unit: formData.get('default_unit') as string,
    default_vat_rate: parseFloat(formData.get('default_vat_rate') as string) || 20,
    category: formData.get('category') as string || null,
  })

  revalidatePath('/catalog')
}

export async function updateCatalogItem(id: string, formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('catalog_items')
    .update({
      label: formData.get('label') as string,
      description: formData.get('description') as string || null,
      default_price_ht: parseFloat(formData.get('default_price_ht') as string) || 0,
      default_unit: formData.get('default_unit') as string,
      default_vat_rate: parseFloat(formData.get('default_vat_rate') as string) || 20,
      category: formData.get('category') as string || null,
    })
    .eq('id', id)
    .eq('company_id', companyId)

  revalidatePath('/catalog')
}

export async function archiveCatalogItem(id: string) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('catalog_items')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId)

  revalidatePath('/catalog')
}
