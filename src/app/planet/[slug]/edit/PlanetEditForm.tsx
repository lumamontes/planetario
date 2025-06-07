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

      setMessage('Planet updated successfully!')
      
      // Redirect back to planets page after a short delay
      setTimeout(() => {
        router.push('/planets')
      }, 1500)
      
    } catch (error) {
      console.error('Error updating planet:', error)
      setMessage('Error updating planet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Navigation */}
      <div className="border border-green-400 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/planets" 
            className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm"
          >
            [←] BACK TO PLANETS
          </Link>
          <Link 
            href={`/planet/${planet.slug}`} 
            className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm"
          >
            [VIEW] 3D PLANET
          </Link>
          <Link 
            href={`/planet/${planet.slug}/content`} 
            className="hover:bg-green-400 hover:text-black px-3 py-1 border border-green-400 transition-colors text-sm"
          >
            [MANAGE] CONTENT
          </Link>
        </div>
      </div>

      {/* Edit Form */}
      <div className="border border-green-400 p-6">
        <h2 className="text-xl mb-6">&gt; PLANET CONFIGURATION</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Planet Name */}
          <div>
            <label className="block text-sm mb-2">&gt; PLANET NAME:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
              placeholder="Enter planet name..."
              required
              maxLength={100}
            />
            <div className="text-xs text-green-600 mt-1">
              &gt; {name.length}/100 characters
            </div>
          </div>

          {/* Planet Description */}
          <div>
            <label className="block text-sm mb-2">&gt; PLANET DESCRIPTION:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 h-24 resize-none"
              placeholder="Enter planet description..."
              maxLength={500}
            />
            <div className="text-xs text-green-600 mt-1">
              &gt; {description.length}/500 characters
            </div>
          </div>

          {/* Visibility Settings */}
          <div>
            <label className="block text-sm mb-2">&gt; VISIBILITY SETTINGS:</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="text-green-400"
                />
                <span className="text-sm">
                  [PUBLIC] - Visible to everyone, discoverable
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="text-green-400"
                />
                <span className="text-sm">
                  [PRIVATE] - Only accessible via direct link
                </span>
              </label>
            </div>
          </div>

          {/* Planet Info */}
          <div className="border-t border-green-400 pt-4">
            <h3 className="text-sm mb-3">&gt; PLANET INFORMATION:</h3>
            <div className="text-xs space-y-1 text-green-600">
              <p>&gt; SLUG: /{planet.slug}</p>
              <p>&gt; CREATED: {new Date(planet.created_at).toLocaleDateString()}</p>
              <p>&gt; LAST UPDATED: {new Date(planet.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-green-400 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full py-3 px-4 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {isLoading ? '[UPDATING...]' : '[SAVE] UPDATE PLANET'}
            </button>
          </div>
        </form>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-3 border ${
            message.includes('Error') 
              ? 'border-red-400 text-red-400' 
              : 'border-green-400 text-green-400'
          }`}>
            <p>&gt; {message}</p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-red-400 p-6 mt-6">
        <h3 className="text-red-400 text-lg mb-4">&gt; DANGER ZONE</h3>
        <div className="space-y-4">
          <div className="text-sm text-red-300">
            <p>&gt; WARNING: These actions cannot be undone!</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/planet/${planet.slug}/delete`}
              className="px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors text-sm"
            >
              [DELETE] DESTROY PLANET
            </Link>
            <button
              onClick={() => {
                if (confirm('Reset all planet content? This cannot be undone.')) {
                  // TODO: Implement content reset
                  alert('Content reset functionality coming soon!')
                }
              }}
              className="px-4 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors text-sm"
            >
              [RESET] CLEAR ALL CONTENT
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 