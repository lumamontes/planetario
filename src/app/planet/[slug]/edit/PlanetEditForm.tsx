'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Planet {
  id: string
  name: string
  slug: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

interface PlanetEditFormProps {
  planet: Planet
}

export default function PlanetEditForm({ planet }: PlanetEditFormProps) {
  const [name, setName] = useState(planet.name)
  const [description, setDescription] = useState(planet.description || '')
  const [isPublic, setIsPublic] = useState(planet.is_public)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('planets')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', planet.id)

      if (error) throw error

      setMessage('Planeta atualizado com sucesso!')
      
      // Redirect back to planets page after a short delay
      setTimeout(() => {
        router.push('/planets')
      }, 1500)
      
    } catch (error) {
      console.error('Error updating planet:', error)
      setMessage('Erro ao atualizar planeta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="bg-black/90 border border-green-400 rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-green-400">Editar Planeta</h1>
            <div className="text-sm text-green-600">
              {planet.slug}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span><span className="text-green-600">Nome:</span> {planet.name}</span>
            <span><span className="text-green-600">Status:</span> {planet.is_public ? 'Público' : 'Privado'}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-black/90 border border-green-400 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/planets" 
              className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
            >
              <span>←</span>
              <span>Voltar aos Planetas</span>
            </Link>
            <Link 
              href={`/planet/${planet.slug}`} 
              className="flex items-center space-x-2 px-4 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors rounded"
            >
              <span>🌍</span>
              <span>Ver Planeta 3D</span>
            </Link>
            <Link 
              href={`/planet/${planet.slug}/content`} 
              className="flex items-center space-x-2 px-4 py-2 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-colors rounded"
            >
              <span>📝</span>
              <span>Gerenciar Conteúdo</span>
            </Link>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-black/90 border border-green-400 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Configurações do Planeta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Planet Name */}
            <div>
              <label className="block text-green-400 font-medium mb-2">
                Nome do planeta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="Digite o nome do planeta..."
                required
                maxLength={100}
              />
              <div className="text-xs text-green-600 mt-1">
                {name.length}/100 caracteres
              </div>
            </div>

            {/* Planet Description */}
            <div>
              <label className="block text-green-400 font-medium mb-2">
                Descrição do planeta
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-24 resize-none rounded"
                placeholder="Digite a descrição do planeta..."
                maxLength={500}
              />
              <div className="text-xs text-green-600 mt-1">
                {description.length}/500 caracteres
              </div>
            </div>

            {/* Visibility Settings */}
            <div>
              <label className="block text-green-400 font-medium mb-2">
                Configurações de visibilidade
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="text-green-400"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span>🌍</span>
                      <span className="font-medium">Público</span>
                    </div>
                    <div className="text-sm text-green-600">Visível para todos, descobrível na galáxia</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
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

            {/* Planet Info */}
            <div className="border-t border-green-400/30 pt-6">
              <h3 className="text-green-400 font-medium mb-3">Informações do Planeta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border border-green-400/30 rounded">
                  <div className="text-xs text-green-600">Slug</div>
                  <div className="font-mono text-sm">/{planet.slug}</div>
                </div>
                <div className="p-3 border border-green-400/30 rounded">
                  <div className="text-xs text-green-600">Criado em</div>
                  <div className="text-sm">{new Date(planet.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="p-3 border border-green-400/30 rounded">
                  <div className="text-xs text-green-600">Última atualização</div>
                  <div className="text-sm">{new Date(planet.updated_at).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-green-400/30 pt-6">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full py-3 px-4 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors rounded"
              >
                {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-4 border rounded ${
              message.includes('Erro') 
                ? 'border-red-400 text-red-400 bg-red-900/20' 
                : 'border-green-400 text-green-400 bg-green-900/20'
            }`}>
              <p>{message}</p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-black/90 border border-red-400 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-red-400 text-xl font-bold">Zona de Perigo</h3>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-red-300">
              <p>AVISO: Estas ações não podem ser desfeitas!</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/planet/${planet.slug}/delete`}
                className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors rounded"
              >
                <span>🗑️</span>
                <span>Excluir Planeta</span>
              </Link>
              <button
                onClick={() => {
                  if (confirm('Redefinir todo o conteúdo do planeta? Esta ação não pode ser desfeita.')) {
                    // TODO: Implement content reset
                    alert('Funcionalidade de redefinição de conteúdo em breve!')
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors rounded"
              >
                <span>🔄</span>
                <span>Limpar Todo Conteúdo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 