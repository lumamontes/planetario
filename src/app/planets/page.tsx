import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import PlanetCard from '@/app/planets/PlanetCard'

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
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black/90 border border-green-400 rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-green-400">Meus Planetas</h1>
            <div className="text-sm text-green-600">
              {userPlanets.length} {userPlanets.length === 1 ? 'planeta' : 'planetas'}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span><span className="text-green-600">Usuário:</span> {user.email}</span>
            <span><span className="text-green-600">Status:</span> Conectado</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-black/90 border border-green-400 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
            >
              <span>←</span>
              <span>Voltar ao Painel</span>
            </Link>
            <Link 
              href="/create-planet" 
              className="flex items-center space-x-2 px-4 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors rounded font-bold"
            >
              <span>🪐</span>
              <span>Criar Novo Planeta</span>
            </Link>
          </div>
        </div>

        {/* Planets Grid */}
        {userPlanets.length === 0 ? (
          <div className="bg-black/90 border border-green-400 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">Seu universo está vazio</h2>
            <p className="text-green-600 mb-6 max-w-md mx-auto">
              Você ainda não criou nenhum planeta. Comece sua jornada criando seu primeiro mundo digital.
            </p>
            <Link 
              href="/create-planet"
              className="inline-flex items-center space-x-2 bg-green-400 text-black px-6 py-3 hover:bg-green-300 transition-colors font-bold rounded"
            >
              <span>🚀</span>
              <span>Criar Primeiro Planeta</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="bg-black/90 border border-green-400 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-green-400">Visão Geral</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-green-400/30 rounded">
                  <div className="text-2xl font-bold text-green-400">{userPlanets.length}</div>
                  <div className="text-sm text-green-600">Total de Planetas</div>
                </div>
                <div className="text-center p-4 border border-green-400/30 rounded">
                  <div className="text-2xl font-bold text-green-400">
                    {userPlanets.filter((p: UserPlanet) => p.is_public).length}
                  </div>
                  <div className="text-sm text-green-600">Planetas Públicos</div>
                </div>
                <div className="text-center p-4 border border-green-400/30 rounded">
                  <div className="text-2xl font-bold text-green-400">
                    {userPlanets.reduce((sum: number, p: UserPlanet) => sum + p.view_count, 0)}
                  </div>
                  <div className="text-sm text-green-600">Total de Visualizações</div>
                </div>
                <div className="text-center p-4 border border-green-400/30 rounded">
                  <div className="text-2xl font-bold text-green-400">
                    {userPlanets.reduce((sum: number, p: UserPlanet) => sum + p.content_count, 0)}
                  </div>
                  <div className="text-sm text-green-600">Blocos de Conteúdo</div>
                </div>
              </div>
            </div>

            {/* Planets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlanets.map((planet: UserPlanet) => (
                <PlanetCard key={planet.id} planet={planet} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-green-600">
          <p>Planetario v1.0</p>
        </div>
      </div>
    </div>
  )
} 