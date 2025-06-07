import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black/90 border border-green-400 rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-green-400">Painel de Controle</h1>
            <div className="text-sm text-green-600">
              {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-green-600">Usuário:</span> {user.email}</p>
            <p><span className="text-green-600">Status:</span> Conectado</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-black/90 border border-green-400 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link 
                href="/create-planet" 
                className="flex items-center space-x-3 p-4 border border-green-400 rounded hover:bg-green-400 hover:text-black transition-colors group"
              >
                <span className="text-2xl">🪐</span>
                <div>
                  <div className="font-bold">Criar Novo Planeta</div>
                  <div className="text-sm text-green-600 group-hover:text-black">seu mundinho!</div>
                </div>
              </Link>
              
              <Link 
                href="/planets" 
                className="flex items-center space-x-3 p-4 border border-green-400 rounded hover:bg-green-400 hover:text-black transition-colors group"
              >
                <span className="text-2xl">🌌</span>
                <div>
                  <div className="font-bold">Meus Planetas</div>
                  <div className="text-sm text-green-600 group-hover:text-black">gerenciar seus planetas</div>
                </div>
              </Link>
              
              <Link 
                href="/settings" 
                className="flex items-center space-x-3 p-4 border border-green-400 rounded hover:bg-green-400 hover:text-black transition-colors group"
              >
                <span className="text-2xl">⚙️</span>
                <div>
                  <div className="font-bold">Configurações</div>
                  <div className="text-sm text-green-600 group-hover:text-black">personalizar sua conta</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-black/90 border border-green-400 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Informações da Conta</h2>
            <div className="space-y-3">
              <div className="p-3 border border-green-400/30 rounded">
                <div className="text-sm text-green-600">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              
              <div className="p-3 border border-green-400/30 rounded">
                <div className="text-sm text-green-600">Membro desde</div>
                <div className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="p-3 border border-green-400/30 rounded">
                <div className="text-sm text-green-600">Último acesso</div>
                <div className="font-medium">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                    : 'Primeiro acesso'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="bg-black/90 border border-green-400 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">Sistema</h2>
          <form action={handleSignOut}>
            <button 
              type="submit"
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              <span>🚪</span>
              <span>Sair da Conta</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-green-600">
          <p>Planetario v1.0 </p>
        </div>
      </div>
    </div>
  )
} 