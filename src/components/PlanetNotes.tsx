'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { PlanetNoteWithUser } from '@/types/database'

interface PlanetNotesProps {
  planetId: string
  planetSlug: string
  user: User | null
  isOwner: boolean
}

export default function PlanetNotes({ planetId, planetSlug, user, isOwner }: PlanetNotesProps) {
  const [notes, setNotes] = useState<PlanetNoteWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    if (!user || !newNoteContent.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('add_planet_note', {
        planet_uuid: planetId,
        note_content: newNoteContent.trim(),
        note_is_public: isPublic,
        note_color: newNoteColor
      })

      if (error) throw error

      setNewNoteContent('')
      setNewNoteColor('#f59e0b')
      setIsPublic(true)
      setShowAddForm(false)
      showMessage('Nota adicionada com sucesso!')
      loadNotes()
    } catch (error: any) {
      console.error('Error adding note:', error)
      if (error.message.includes('Cannot add notes to your own planet')) {
        showMessage('Você não pode adicionar notas ao seu próprio planeta', 'error')
      } else {
        showMessage('Erro ao adicionar nota. Tente novamente.', 'error')
      }
    } finally {
      setIsSubmitting(false)
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
    <div className="bg-black/95 border border-green-400 backdrop-blur-md rounded-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-green-400 font-bold text-lg">
          💭 Notas do Planeta [{notes.length}]
        </h3>
        {user && !isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-sm rounded"
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar Nota'}
          </button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className={`border p-2 mb-4 text-xs rounded ${
          messageType === 'error' 
            ? 'border-red-400 text-red-400' 
            : 'border-green-400 text-green-400'
        }`}>
          {message}
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && user && !isOwner && (
        <div className="border border-green-400 p-3 mb-4 space-y-3 rounded">
          <div>
            <label className="block text-green-400 text-xs mb-1 font-bold">
              Conteúdo da nota:
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full bg-black border border-green-400 text-green-400 px-2 py-1 text-xs font-mono focus:outline-none focus:border-green-300 resize-none rounded"
              rows={3}
              maxLength={500}
              placeholder="Adicione seus pensamentos sobre este planeta..."
            />
            <div className="text-xs text-green-600 mt-1">
              {newNoteContent.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-green-400 text-xs mb-1 font-bold">
                Cor:
              </label>
              <div className="flex gap-1 flex-wrap">
                {noteColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewNoteColor(color.value)}
                    className={`w-6 h-6 border-2 transition-all rounded ${
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
              <label className="block text-green-400 text-xs mb-1 font-bold">
                Visibilidade:
              </label>
              <div className="flex gap-2 text-xs">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="mr-1"
                  />
                  Pública
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="mr-1"
                  />
                  Privada
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={addNote}
            disabled={isSubmitting || !newNoteContent.trim()}
            className="w-full px-3 py-2 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors text-sm rounded"
          >
            {isSubmitting ? 'Adicionando...' : 'Enviar Nota'}
          </button>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-green-600 text-center py-4 text-sm">
            Carregando notas...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-green-600 text-center py-4 text-sm">
            Nenhuma nota ainda. {user && !isOwner ? 'Seja o primeiro a adicionar uma!' : ''}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-600 p-3 space-y-2 rounded"
              style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
            >
              {/* Note Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {note.avatar_url ? (
                    <img
                      src={note.avatar_url}
                      alt={note.username || 'Usuário'}
                      className="w-5 h-5 border border-green-400 rounded"
                    />
                  ) : (
                    <div className="w-5 h-5 border border-green-400 bg-gray-800 flex items-center justify-center text-xs rounded">
                      ?
                    </div>
                  )}
                  <span className="text-green-400 text-xs font-bold">
                    {note.username || 'Anônimo'}
                  </span>
                  {!note.is_public && (
                    <span className="text-yellow-400 text-xs">🔒 Privada</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-xs">
                    {formatDate(note.created_at)}
                  </span>
                  {(user?.id === note.user_id || isOwner) && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
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
          Como dono do planeta, você pode ver todas as notas e excluir qualquer nota.
          <br />
          Visitantes podem adicionar notas para compartilhar seus pensamentos sobre seu planeta.
        </div>
      )}

      {/* Info for non-logged users */}
      {!user && (
        <div className="mt-4 text-xs text-green-600 border-t border-green-400 pt-3">
          Entre para adicionar notas e interagir com este planeta.
        </div>
      )}
    </div>
  )
} 