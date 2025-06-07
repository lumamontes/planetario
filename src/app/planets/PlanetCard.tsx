'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface PlanetCardProps {
  planet: {
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
}

export default function PlanetCard({ planet }: PlanetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      // Delete planet content first
      const { error: contentError } = await supabase
        .from('planet_content')
        .delete()
        .eq('planet_id', planet.id)

      if (contentError) throw contentError

      // Delete planet visits
      const { error: visitsError } = await supabase
        .from('planet_visits')
        .delete()
        .eq('planet_id', planet.id)

      if (visitsError) throw visitsError

      // Delete planet likes
      const { error: likesError } = await supabase
        .from('planet_likes')
        .delete()
        .eq('planet_id', planet.id)

      if (likesError) throw likesError

      // Finally delete the planet
      const { error: planetError } = await supabase
        .from('planets')
        .delete()
        .eq('id', planet.id)

      if (planetError) throw planetError

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error('Error deleting planet:', error)
      alert('Erro ao excluir planeta. Tente novamente.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const toggleVisibility = async () => {
    try {
      const { error } = await supabase
        .from('planets')
        .update({ is_public: !planet.is_public })
        .eq('id', planet.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error updating planet visibility:', error)
      alert('Erro ao atualizar visibilidade do planeta. Tente novamente.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-black/90 border border-green-400 rounded-lg overflow-hidden hover:border-green-300 transition-colors">
      {/* Planet Header */}
      <div className="bg-green-400 text-black px-4 py-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg truncate">{planet.name}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            planet.is_public 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-white'
          }`}>
            {planet.is_public ? 'Público' : 'Privado'}
          </span>
        </div>
      </div>

      {/* Planet Info */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {planet.description && (
          <p className="text-green-300 text-sm leading-relaxed">
            {planet.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">👁️</span>
            <span className="text-green-400">{planet.view_count} visualizações</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">❤️</span>
            <span className="text-green-400">{planet.like_count} curtidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">📦</span>
            <span className="text-green-400">{planet.content_count} blocos</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">📅</span>
            <span className="text-green-400">{formatDate(planet.created_at)}</span>
          </div>
        </div>

        {/* Planet URL */}
        <div className="bg-black/50 border border-green-400/30 rounded p-2">
          <div className="text-xs text-green-600 mb-1">URL do planeta:</div>
          <div className="text-green-400 text-sm font-mono">/{planet.slug}</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-green-400/30">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/planet/${planet.slug}`}
              className="flex items-center justify-center space-x-2 py-2 px-3 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm rounded"
            >
              <span>🌍</span>
              <span>Visualizar</span>
            </Link>
            <Link
              href={`/planet/${planet.slug}/edit`}
              className="flex items-center justify-center space-x-2 py-2 px-3 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors text-sm rounded"
            >
              <span>✏️</span>
              <span>Editar</span>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleVisibility}
              className={`flex items-center justify-center space-x-2 py-2 px-3 border transition-colors text-sm rounded ${
                planet.is_public
                  ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                  : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
              }`}
            >
              <span>{planet.is_public ? '🔒' : '🌍'}</span>
              <span>{planet.is_public ? 'Tornar Privado' : 'Tornar Público'}</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center space-x-2 py-2 px-3 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors text-sm rounded"
              disabled={isDeleting}
            >
              <span>🗑️</span>
              <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-red-400 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-red-400 text-xl font-bold">Confirmar Exclusão</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-red-300">
                Esta ação não pode ser desfeita!
              </p>
              
              <div className="bg-red-900/20 border border-red-400/30 rounded p-3 text-sm">
                <div className="space-y-1">
                  <div><span className="text-red-400">Planeta:</span> {planet.name}</div>
                  <div><span className="text-red-400">Blocos de conteúdo:</span> {planet.content_count}</div>
                  <div><span className="text-red-400">Total de visualizações:</span> {planet.view_count}</div>
                </div>
              </div>
              
              <p className="text-red-300 text-sm">
                Todos os dados do planeta, conteúdo e análises serão permanentemente destruídos.
              </p>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white border border-red-600 transition-colors text-sm rounded font-bold"
                >
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 