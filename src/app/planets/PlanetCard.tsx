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
      alert('Error deleting planet. Please try again.')
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
      alert('Error updating planet visibility. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="border border-green-400 bg-black">
      {/* Planet Header */}
      <div className="bg-green-400 text-black px-3 py-2">
        <div className="flex justify-between items-center">
          <span className="font-bold truncate">{planet.name}</span>
          <span className="text-xs">
            {planet.is_public ? '[PUBLIC]' : '[PRIVATE]'}
          </span>
        </div>
      </div>

      {/* Planet Info */}
      <div className="p-4 space-y-3">
        <div className="text-sm space-y-1">
          <p>&gt; SLUG: /{planet.slug}</p>
          <p>&gt; VIEWS: {planet.view_count}</p>
          <p>&gt; LIKES: {planet.like_count}</p>
          <p>&gt; CONTENT: {planet.content_count} blocks</p>
          <p>&gt; CREATED: {formatDate(planet.created_at)}</p>
          <p>&gt; UPDATED: {formatDate(planet.updated_at)}</p>
        </div>

        {planet.description && (
          <div className="border-t border-green-400 pt-3">
            <p className="text-xs text-green-300">
              &gt; DESC: {planet.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-green-400 pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/planet/${planet.slug}`}
              className="text-center py-2 px-3 border border-green-400 hover:bg-green-400 hover:text-black transition-colors text-xs"
            >
              [VIEW] 3D
            </Link>
            <Link
              href={`/planet/${planet.slug}/edit`}
              className="text-center py-2 px-3 border border-green-400 hover:bg-green-400 hover:text-black transition-colors text-xs"
            >
              [EDIT] CONFIG
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleVisibility}
              className="py-2 px-3 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors text-xs"
            >
              {planet.is_public ? '[HIDE]' : '[SHOW]'} PUBLIC
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-2 px-3 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors text-xs"
              disabled={isDeleting}
            >
              {isDeleting ? '[DELETING...]' : '[DELETE]'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/planet/${planet.slug}/content`}
              className="text-center py-2 px-3 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors text-xs"
            >
              [MANAGE] CONTENT
            </Link>
            <Link
              href={`/planet/${planet.slug}/analytics`}
              className="text-center py-2 px-3 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-colors text-xs"
            >
              [VIEW] ANALYTICS
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="border border-red-400 bg-black p-6 max-w-md mx-4">
            <div className="bg-red-400 text-black px-3 py-2 mb-4">
              <span className="font-bold">DANGER: PLANET DELETION</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-red-400">
                &gt; WARNING: This action cannot be undone!
              </p>
              <p className="text-sm">
                &gt; Planet: {planet.name}<br/>
                &gt; Content blocks: {planet.content_count}<br/>
                &gt; Total views: {planet.view_count}
              </p>
              <p className="text-red-300 text-sm">
                All planet data, content, and analytics will be permanently destroyed.
              </p>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white border border-red-600 transition-colors text-sm"
                >
                  {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 