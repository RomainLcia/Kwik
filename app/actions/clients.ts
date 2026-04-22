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

export async function createClient_action(formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('clients').insert({
    company_id: companyId,
    client_type: formData.get('client_type') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    address_street: formData.get('address_street') as string || null,
    address_zip: formData.get('address_zip') as string || null,
    address_city: formData.get('address_city') as string || null,
    notes: formData.get('notes') as string || null,
  })

  revalidatePath('/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('clients')
    .update({
      client_type: formData.get('client_type') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      address_street: formData.get('address_street') as string || null,
      address_zip: formData.get('address_zip') as string || null,
      address_city: formData.get('address_city') as string || null,
      notes: formData.get('notes') as string || null,
    })
    .eq('id', id)
    .eq('company_id', companyId)

  revalidatePath('/clients')
}

export async function archiveClient(id: string) {
  const { supabase, companyId } = await getCompanyId()

  await supabase.from('clients')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId)

  revalidatePath('/clients')
}
