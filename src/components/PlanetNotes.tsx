'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { PlanetNoteWithUser } from '@/types/database'

interface PlanetNotesProps {
  planetId: string
  user: User | null
  isOwner: boolean
}

export default function PlanetNotes({ planetId, user, isOwner }: PlanetNotesProps) {
  const [notes, setNotes] = useState<PlanetNoteWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteColor, setNewNoteColor] = useState('#f59e0b')
  const [isPublic, setIsPublic] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const supabase = createClient()

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase.rpc('get_planet_notes', {
        planet_uuid: planetId
      })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNoteContent.trim() || !user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('planet_notes')
        .insert({
          planet_id: planetId,
          user_id: user.id,
          content: newNoteContent.trim(),
          is_public: true
        })

      if (error) throw error

      setNewNoteContent('')
      loadNotes()
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('planet_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      showMessage('Nota excluída com sucesso!')
      loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      showMessage('Erro ao excluir nota', 'error')
    }
  }

  useEffect(() => {
    loadNotes()
  }, [planetId])

  const noteColors = [
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-black/90 border border-green-400 backdrop-blur-md rounded-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-400 font-bold text-lg">
          💭 Notas do Planeta ({notes.length})
        </h3>
        {user && !isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm rounded"
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar'}
          </button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className={`border p-3 mb-4 text-sm rounded ${
          messageType === 'error' 
            ? 'border-red-400 text-red-400 bg-red-900/20' 
            : 'border-green-400 text-green-400 bg-green-900/20'
        }`}>
          {message}
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && user && !isOwner && (
        <div className="border border-green-400 p-4 mb-4 space-y-4 rounded bg-black/50">
          <div>
            <label className="block text-green-400 text-sm mb-2 font-medium">
              Sua nota sobre este planeta
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 text-sm focus:outline-none focus:border-green-300 resize-none rounded"
              rows={3}
              maxLength={500}
              placeholder="Compartilhe seus pensamentos sobre este planeta..."
            />
            <div className="text-xs text-green-600 mt-1">
              {newNoteContent.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-green-400 text-sm mb-2 font-medium">
                Cor da nota
              </label>
              <div className="flex gap-2 flex-wrap">
                {noteColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewNoteColor(color.value)}
                    className={`w-8 h-8 border-2 transition-all rounded ${
                      newNoteColor === color.value 
                        ? 'border-green-400 scale-110' 
                        : 'border-gray-600 hover:border-green-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-green-400 text-sm mb-2 font-medium">
                Visibilidade
              </label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="mr-2"
                  />
                  Pública
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="mr-2"
                  />
                  Privada
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={addNote}
            disabled={!newNoteContent.trim()}
            className="w-full px-4 py-2 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors text-sm rounded"
          >
            Enviar Nota
          </button>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-green-600 text-center py-8 text-sm">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Carregando notas...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-green-600 text-center py-8 text-sm">
            <div className="text-2xl mb-2">💭</div>
            <div>Nenhuma nota ainda.</div>
            {user && !isOwner && (
              <div className="text-xs mt-1">Seja o primeiro a compartilhar seus pensamentos!</div>
            )}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-600 p-4 space-y-3 rounded bg-black/30"
              style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
            >
              {/* Note Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {note.avatar_url ? (
                    <img
                      src={note.avatar_url}
                      alt={note.username || 'Usuário'}
                      className="w-6 h-6 border border-green-400 rounded"
                    />
                  ) : (
                    <div className="w-6 h-6 border border-green-400 bg-gray-800 flex items-center justify-center text-xs rounded">
                      ?
                    </div>
                  )}
                  <div>
                    <span className="text-green-400 text-sm font-bold">
                      {note.username || 'Anônimo'}
                    </span>
                    {!note.is_public && (
                      <span className="text-yellow-400 text-xs ml-2">🔒 Privada</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-xs">
                    {formatDate(note.created_at)}
                  </span>
                  {(user?.id === note.user_id || isOwner) && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-400 hover:text-red-300 text-sm p-1"
                      title="Excluir nota"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Note Content */}
              <div className="text-green-300 text-sm leading-relaxed">
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info for planet owners */}
      {isOwner && (
        <div className="mt-4 text-xs text-green-600 border-t border-green-400 pt-3">
          <div className="flex items-center space-x-1 mb-1">
            <span>ℹ️</span>
            <span className="font-medium">Informações para o dono do planeta:</span>
          </div>
          <div>• Você pode ver todas as notas e excluir qualquer uma</div>
          <div>• Visitantes podem adicionar notas para compartilhar pensamentos sobre seu planeta</div>
        </div>
      )}

      {/* Info for non-logged users */}
      {!user && (
        <div className="mt-4 text-xs text-green-600 border-t border-green-400 pt-3 text-center">
          <div className="flex items-center justify-center space-x-1">
            <span>🔑</span>
            <span>Entre para adicionar notas e interagir com este planeta</span>
          </div>
        </div>
      )}
    </div>
  )
} 