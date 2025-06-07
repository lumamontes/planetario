import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PlanetEditForm from '../PlanetEditForm'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PlanetSettingsPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // Fetch the planet
  const { data: planet, error: planetError } = await supabase
    .from('planets')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (planetError || !planet) {
    redirect('/planets')
  }

  return (
    <PlanetEditForm planet={planet} />
  )
} 