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

const funnyPlaceholders = [
  'tuts tuts tuts',
  'lol',
  'uiuiui',
  'tururu',
  'wtf wtf wtf',
  'minhas coisas',
  'só mais um planeta',
  'meu planeta',
];


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

  // Quick content creation
  const [quickContent, setQuickContent] = useState({
    type: 'text' as 'text' | 'image' | 'link',
    content: ''
  })

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

      // Create first content block if user added quick content
      if (quickContent.content.trim()) {
        let contentData: any = {}
        
        switch (quickContent.type) {
          case 'text':
            contentData = { text: quickContent.content.trim() }
            break
          case 'link':
            contentData = { 
              url: quickContent.content.trim(),
              title: 'Meu primeiro link'
            }
            break
          case 'image':
            contentData = { 
              images: [{ 
                url: quickContent.content.trim(), 
                alt: 'Primeira imagem',
                caption: ''
              }]
            }
            break
        }

        await supabase
          .from('planet_content')
          .insert({
            planet_id: planet.id,
            type: quickContent.type,
            title: `Primeiro ${quickContent.type === 'text' ? 'texto' : quickContent.type === 'link' ? 'link' : 'imagem'}`,
            content: contentData,
            position: 0,
            is_visible: true
          })
      }

      // Redirect to planet editor
      router.push(`/planet/${planet.slug}/edit`)
    } catch (err: any) {
      setError(err.message || 'Failed to create planet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
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
              <h1 className="text-2xl font-bold">Criar Planeta</h1>
            </div>
            <div className="text-sm text-green-600">
              {user.email}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Form */}
        <div className="bg-black/90 border border-green-400 rounded-lg">
          {/* Header */}
          <div className="border-b border-green-400 p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Configuração do Planeta</h2>
            <p className="text-green-600">Configure as informações babys</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-green-400">
            <div className="flex">
              {[
                { id: 'basic', label: 'Informações Básicas', icon: '📝' },
                { id: 'theme', label: 'Aparência', icon: '🎨' },
                { id: 'layout', label: 'Layout', icon: '📐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-6 py-4 border-r border-green-400 last:border-r-0 transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-green-400 text-black'
                      : 'bg-black text-green-400 hover:bg-green-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 min-h-[400px]">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Nome do planeta
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                    placeholder="Meu planeta incrível"
                    maxLength={50}
                  />
                  <div className="text-xs text-green-600 mt-1">
                    {name.length}/50 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-20 resize-none rounded"
                    placeholder="Um lugar especial no universo digital..."
                    maxLength={200}
                  />
                  <div className="text-xs text-green-600 mt-1">
                    {description.length}/200 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Visibilidade
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        checked={isPublic}
                        onChange={() => setIsPublic(true)}
                        className="text-green-400"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>🌍</span>
                          <span className="font-medium">Público</span>
                        </div>
                        <div className="text-sm text-green-600">Visível na galáxia e descobrível por outros usuários</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        checked={!isPublic}
                        onChange={() => setIsPublic(false)}
                        className="text-green-400"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>🔒</span>
                          <span className="font-medium">Privado</span>
                        </div>
                        <div className="text-sm text-green-600">Apenas acessível via link direto</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Quick Content Creation */}
                <div className="border-t border-green-400/30 pt-6">
                  <h3 className="text-green-400 font-medium mb-4">Adicionar primeiro conteúdo (opcional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">
                        Tipo de conteúdo
                      </label>
                      <select
                        value={quickContent.type}
                        onChange={(e) => setQuickContent(prev => ({ ...prev, type: e.target.value as any, content: '' }))}
                        className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      >
                        <option value="text">📝 Texto</option>
                        <option value="link">🔗 Link</option>
                        <option value="image">🖼️ Imagem (URL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-green-400 mb-2 font-medium">
                        {quickContent.type === 'text' && 'Seu primeiro texto'}
                        {quickContent.type === 'link' && 'URL do link'}
                        {quickContent.type === 'image' && 'URL da imagem'}
                      </label>
                      {quickContent.type === 'text' ? (
                        <textarea
                          value={quickContent.content}
                          onChange={(e) => setQuickContent(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-20 resize-none rounded"
                          placeholder="uiuiui"
                        />
                      ) : (
                        <input
                          type="url"
                          value={quickContent.content}
                          onChange={(e) => setQuickContent(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                          placeholder={
                            quickContent.type === 'link' 
                              ? 'https://meusite.com' 
                              : 'https://exemplo.com/imagem.jpg'
                          }
                        />
                      )}
                      <div className="text-xs text-green-600 mt-1">
                        adicione mais conteúdo depois no editor :D
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Esquema de cores
                  </label>
                  <select
                    value={theme.colors?.primary || '#00ff00'}
                    onChange={(e) => setTheme(prev => ({ 
                      ...prev, 
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="#00ff00">🟢 Terminal Verde</option>
                    <option value="#ff00ff">🌈 Cyberpunk Neon</option>
                    <option value="#0066ff">🌌 Espaço Profundo</option>
                    <option value="#ffaa00">🟡 Retro Amber</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Fonte
                  </label>
                  <select
                    value={theme.fonts?.body || 'Monaco, "Courier New", monospace'}
                    onChange={(e) => setTheme(prev => ({ 
                      ...prev, 
                      fonts: { ...prev.fonts, body: e.target.value, heading: e.target.value }
                    }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value='Monaco, "Courier New", monospace'>🔤 Monospace</option>
                    <option value='"Helvetica Neue", Arial, sans-serif'>📝 Sans Serif</option>
                    <option value='"Times New Roman", serif'>📖 Serif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Efeitos visuais
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.shadows || false}
                      onChange={(e) => setTheme(prev => ({ ...prev, shadows: e.target.checked }))}
                      className="text-green-400"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>✨</span>
                        <span className="font-medium">Habilitar sombras e efeitos</span>
                      </div>
                      <div className="text-sm text-green-600">Adiciona profundidade visual ao seu planeta</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Estilo de layout
                  </label>
                  <select
                    value={layout.type}
                    onChange={(e) => setLayout(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="grid">📱 Grade - Layout em grade responsiva</option>
                    <option value="list">📋 Lista - Layout vertical simples</option>
                    <option value="masonry">🧱 Masonry - Layout tipo Pinterest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2 font-medium">
                    Largura máxima
                  </label>
                  <select
                    value={layout.maxWidth}
                    onChange={(e) => setLayout(prev => ({ ...prev, maxWidth: e.target.value }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
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
              <div className="mt-6 p-4 border border-red-500 bg-red-900/20 text-red-400 rounded">
                <div className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Erro: {error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="border-t border-green-400 p-6 flex justify-between items-center">
            <div className="text-green-600 text-sm">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Criando planeta...</span>
                </div>
              ) : (
                'Pronto para criar seu planeta'
              )}
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
                className="flex items-center space-x-2 px-6 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                <span>🚀</span>
                <span>{loading ? 'Criando...' : 'Criar Planeta'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 