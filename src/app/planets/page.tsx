import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import PlanetCard from './PlanetCard'

interface UserPlanet {
  id: string
  name: string
  slug: string
  description: string | null
  is_public: boolean
  view_count: number
  like_count: number
  content_count: number
  created_at: string
  updated_at: string
}

export default async function PlanetsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // Fetch user's planets with content count
  const { data: planets, error: planetsError } = await supabase
    .rpc('get_user_planets', { user_uuid: user.id })

  if (planetsError) {
    console.error('Error fetching planets:', planetsError)
  }

  const userPlanets: UserPlanet[] = planets || []

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        {/* Terminal Header */}
        <div className="border border-green-400 mb-6">
          <div className="bg-green-400 text-black px-4 py-2 flex justify-between items-center">
            <span className="font-bold">PLANETARIO PLANET MANAGER v1.0</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="p-4 border-b border-green-400">
            <p>&gt; USER: {user.email}</p>
            <p>&gt; PLANETS FOUND: {userPlanets.length}</p>
            <p>&gt; STATUS: OPERATIONAL</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="border border-green-400 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard" 
              className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm"
            >
              [←] BACK TO DASHBOARD
            </Link>
            <Link 
              href="/create-planet" 
              className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm"
            >
              [+] CREATE NEW PLANET
            </Link>
          </div>
        </div>

        {/* Planets Grid */}
        {userPlanets.length === 0 ? (
          <div className="border border-green-400 p-8 text-center">
            <h2 className="text-xl mb-4">&gt; NO PLANETS DETECTED</h2>
            <p className="mb-4">Your digital universe is empty. Initialize your first planet to begin.</p>
            <Link 
              href="/create-planet"
              className="inline-block bg-green-400 text-black px-6 py-3 hover:bg-green-300 transition-colors font-bold"
            >
              [INITIALIZE] CREATE FIRST PLANET
            </Link>
          </div>
        ) : (
          <>
            <div className="border border-green-400 p-4 mb-6">
              <h2 className="text-xl mb-4">&gt; PLANET REGISTRY</h2>
              <div className="text-sm space-y-1">
                <p>&gt; Total Planets: {userPlanets.length}</p>
                <p>&gt; Public Planets: {userPlanets.filter((p: UserPlanet) => p.is_public).length}</p>
                <p>&gt; Private Planets: {userPlanets.filter((p: UserPlanet) => !p.is_public).length}</p>
                <p>&gt; Total Views: {userPlanets.reduce((sum: number, p: UserPlanet) => sum + p.view_count, 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlanets.map((planet: UserPlanet) => (
                <PlanetCard key={planet.id} planet={planet} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-green-400 pt-4 text-center text-sm">
          <p>&gt; PLANETARIO PLANET MANAGER v1.0</p>
          <p>&gt; MANAGE YOUR DIGITAL UNIVERSE</p>
        </div>
      </div>
    </div>
  )
} 