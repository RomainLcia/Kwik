'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const companySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d+$/, 'SIRET invalide'),
  legal_form: z.string().min(1),
  address_street: z.string().min(1, 'Adresse requise'),
  address_zip: z.string().min(5, 'Code postal requis'),
  address_city: z.string().min(1, 'Ville requise'),
  phone: z.string().min(1, 'Téléphone requis'),
  contact_email: z.string().email('Email invalide'),
  vat_applicable: z.boolean(),
  vat_number: z.string().optional(),
})

export async function saveCompanyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = {
    name: formData.get('name') as string,
    siret: (formData.get('siret') as string).replace(/\s/g, ''),
    legal_form: formData.get('legal_form') as string,
    address_street: formData.get('address_street') as string,
    address_zip: formData.get('address_zip') as string,
    address_city: formData.get('address_city') as string,
    phone: formData.get('phone') as string,
    contact_email: formData.get('contact_email') as string,
    vat_applicable: formData.get('vat_applicable') === 'true',
    vat_number: formData.get('vat_number') as string || undefined,
  }

  const parsed = companySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('companies').update(parsed.data).eq('user_id', user.id)
  } else {
    await supabase.from('companies').insert({ ...parsed.data, user_id: user.id })
  }

  redirect('/dashboard')
}
