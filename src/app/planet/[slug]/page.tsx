import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PlanetViewer from './PlanetViewer'

export default async function PlanetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get planet data
  const { data: planet, error: planetError } = await supabase
    .from('planets')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (planetError || !planet) {
    notFound()
  }

  // Get planet content
  const { data: content, error: contentError } = await supabase
    .from('planet_content')
    .select('*')
    .eq('planet_id', planet.id)
    .eq('is_visible', true)
    .order('position')

  if (contentError) {
    console.error('Error fetching content:', contentError)
  }

  // Increment view count
  await supabase
    .from('planets')
    .update({ view_count: planet.view_count + 1 })
    .eq('id', planet.id)

  return (
    <PlanetViewer 
      planet={planet} 
      content={content || []} 
      user={user}
      isOwner={user?.id === planet.user_id}
    />
  )
} 