import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PlanetEditor from './PlanetEditor'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditPlanetPage({ params }: PageProps) {
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

  // Fetch planet content
  const { data: content, error: contentError } = await supabase
    .from('planet_content')
    .select('*')
    .eq('planet_id', planet.id)
    .order('position', { ascending: true })

  if (contentError) {
    console.error('Error fetching content:', contentError)
  }

  return (
    <PlanetEditor 
      planet={planet} 
      initialContent={content || []} 
    />
  )
} 