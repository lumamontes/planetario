import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PlanetEditForm from './PlanetEditForm'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function EditPlanetPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // Fetch the planet
  const { data: planet, error: planetError } = await supabase
    .from('planets')
    .select('*')
    .eq('slug', params.slug)
    .eq('user_id', user.id)
    .single()

  if (planetError || !planet) {
    redirect('/planets')
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Terminal Header */}
        <div className="border border-green-400 mb-6">
          <div className="bg-green-400 text-black px-4 py-2 flex justify-between items-center">
            <span className="font-bold">PLANETARIO PLANET EDITOR v1.0</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="p-4 border-b border-green-400">
            <p>&gt; EDITING: {planet.name}</p>
            <p>&gt; SLUG: /{planet.slug}</p>
            <p>&gt; STATUS: CONFIGURATION MODE</p>
          </div>
        </div>

        <PlanetEditForm planet={planet} />
      </div>
    </div>
  )
} 