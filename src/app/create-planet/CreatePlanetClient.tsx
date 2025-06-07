'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { PlanetTheme, PlanetLayout } from '@/types/database'

interface CreatePlanetClientProps {
  user: User
}

const defaultTheme: PlanetTheme = {
  colors: {
    primary: '#00ff00',
    secondary: '#ffff00',
    background: '#000000',
    text: '#ffffff',
    accent: '#ff00ff'
  },
  fonts: {
    heading: 'Monaco, "Courier New", monospace',
    body: 'Monaco, "Courier New", monospace'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: '0px',
  shadows: false
}

const defaultLayout: PlanetLayout = {
  type: 'grid',
  columns: 2,
  gap: '16px',
  maxWidth: '800px',
  padding: '16px'
}

export default function CreatePlanetClient({ user }: CreatePlanetClientProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'theme' | 'layout'>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Basic planet info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  // Theme settings
  const [theme, setTheme] = useState<PlanetTheme>(defaultTheme)

  // Layout settings
  const [layout, setLayout] = useState<PlanetLayout>(defaultLayout)

  const handleCreatePlanet = async () => {
    if (!name.trim()) {
      setError('Planet name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Generate slug
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_planet_slug', {
          planet_name: name,
          user_id: user.id
        })

      if (slugError) throw slugError

      // Create planet
      const { data: planet, error: planetError } = await supabase
        .from('planets')
        .insert({
          user_id: user.id,
          name: name.trim(),
          slug: slugData,
          description: description.trim() || null,
          is_public: isPublic,
          theme: theme as any,
          layout: layout as any
        })
        .select()
        .single()

      if (planetError) throw planetError

      // Redirect to planet editor
      router.push(`/planet/${planet.slug}/edit`)
    } catch (err: any) {
      setError(err.message || 'Failed to create planet')
    } finally {
      setLoading(false)
    }
  }

  const updateThemeColor = (key: keyof PlanetTheme['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400 bg-black">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ← Voltar
              </button>
              <h1 className="text-xl font-bold">Criar Planeta</h1>
            </div>
            <div className="text-sm">
              Usuário: {user.email}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Window */}
        <div className="border border-green-400 bg-black rounded-lg">
          {/* Window Title Bar with dots */}
          <div className="border-b border-green-400 bg-green-400 text-black px-4 py-2 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-bold ml-2">Configuração de Planeta</span>
            </div>
            <div className="text-sm">
              Status: {loading ? 'Processando...' : 'Pronto'}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-green-400 bg-black">
            <div className="flex">
              {[
                { id: 'basic', label: 'Informações Básicas' },
                { id: 'theme', label: 'Tema' },
                { id: 'layout', label: 'Layout' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 border-r border-green-400 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-400 text-black'
                      : 'bg-black text-green-400 hover:bg-green-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 min-h-[400px]">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Nome do planeta:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                    placeholder="Digite o nome do planeta..."
                    maxLength={50}
                  />
                  <div className="text-xs text-green-600 mt-1">
                    {name.length}/50 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Descrição:
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 h-24 resize-none rounded"
                    placeholder="Descreva seu universo digital..."
                    maxLength={200}
                  />
                  <div className="text-xs text-green-600 mt-1">
                    {description.length}/200 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Visibilidade:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="text-green-400"
                      />
                      <span>🌍 Público - Visível na galáxia e descobrível</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="text-green-400"
                      />
                      <span>🔒 Privado - Apenas acessível via link direto</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Esquema de cores:
                  </label>
                  <select
                    value={theme.colors?.primary || '#00ff00'}
                    onChange={(e) => setTheme(prev => ({ 
                      ...prev, 
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="#00ff00">🟢 Terminal Verde</option>
                    <option value="#ff00ff">🌈 Cyberpunk Neon</option>
                    <option value="#0066ff">🌌 Espaço Profundo</option>
                    <option value="#ffaa00">🟡 Retro Amber</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Fonte:
                  </label>
                  <select
                    value={theme.fonts?.body || 'Monaco, "Courier New", monospace'}
                    onChange={(e) => setTheme(prev => ({ 
                      ...prev, 
                      fonts: { ...prev.fonts, body: e.target.value, heading: e.target.value }
                    }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value='Monaco, "Courier New", monospace'>🔤 Monospace</option>
                    <option value='"Helvetica Neue", Arial, sans-serif'>📝 Sans Serif</option>
                    <option value='"Times New Roman", serif'>📖 Serif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Efeitos visuais:
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={theme.shadows || false}
                      onChange={(e) => setTheme(prev => ({ ...prev, shadows: e.target.checked }))}
                      className="text-green-400"
                    />
                    <span>✨ Habilitar sombras e efeitos</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Estilo de layout:
                  </label>
                  <select
                    value={layout.type}
                    onChange={(e) => setLayout(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="grid">📱 Grade - Layout em grade responsiva</option>
                    <option value="list">📋 Lista - Layout vertical simples</option>
                    <option value="masonry">🧱 Masonry - Layout tipo Pinterest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-bold">
                    Largura máxima:
                  </label>
                  <select
                    value={layout.maxWidth}
                    onChange={(e) => setLayout(prev => ({ ...prev, maxWidth: e.target.value }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="600px">📱 600px - Estreito</option>
                    <option value="800px">💻 800px - Médio</option>
                    <option value="1000px">🖥️ 1000px - Largo</option>
                    <option value="100%">📺 100% - Largura Total</option>
                  </select>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-3 border border-red-500 bg-red-900 bg-opacity-20 text-red-400 rounded">
                Erro: {error}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="border-t border-green-400 bg-black p-4 flex justify-between items-center rounded-b-lg">
            <div className="text-green-600 text-sm">
              {loading ? 'Processando...' : 'Pronto para criar'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-green-400 text-green-400 hover:bg-green-900 transition-colors rounded"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePlanet}
                disabled={loading || !name.trim()}
                className="px-6 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {loading ? 'Criando...' : '🚀 Criar Planeta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 