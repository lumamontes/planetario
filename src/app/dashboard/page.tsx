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
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        {/* Header Window */}
        <div className="border border-green-400 mb-6 rounded-lg">
          <div className="bg-green-400 text-black px-4 py-2 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-bold ml-2">Painel de Controle Planetario</span>
            </div>
            <span className="text-sm">{new Date().toLocaleString()}</span>
          </div>
          <div className="p-4 border-b border-green-400">
            <p>Usuário: {user.email}</p>
            <p>Status: Conectado</p>
            <p>Sessão: Ativa</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="border border-green-400 p-4 rounded-lg">
            <h2 className="text-xl mb-4">Menu Principal</h2>
            <div className="space-y-2">
              <Link 
                href="/create-planet" 
                className="block hover:bg-green-400 hover:text-black p-3 border border-green-400 transition-colors rounded"
              >
                🪐 Criar Novo Planeta
              </Link>
              <Link 
                href="/planets" 
                className="block hover:bg-green-400 hover:text-black p-3 border border-green-400 transition-colors rounded"
              >
                🌌 Ver Meus Planetas
              </Link>
              <Link 
                href="/settings" 
                className="block hover:bg-green-400 hover:text-black p-3 border border-green-400 transition-colors rounded"
              >
                ⚙️ Configurações da Conta
              </Link>
            </div>
          </div>

          <div className="border border-green-400 p-4 rounded-lg">
            <h2 className="text-xl mb-4">Atividade Recente</h2>
            <div className="space-y-1 text-sm">
              <p>{new Date().toLocaleString()} - Usuário conectado</p>
              <p>Sistema pronto para criação de planetas</p>
              <p>Todos os sistemas operacionais</p>
            </div>
          </div>

          <div className="border border-green-400 p-4 rounded-lg">
            <h2 className="text-xl mb-4">Ações do Sistema</h2>
            <form action={handleSignOut}>
              <button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 border border-red-600 transition-colors rounded"
              >
                🚪 Sair
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-green-400 pt-4 text-center text-sm">
          <p>Sistema Planetario v1.0 - Interface de criação de planetas digitais</p>
          <p>Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  )
} 