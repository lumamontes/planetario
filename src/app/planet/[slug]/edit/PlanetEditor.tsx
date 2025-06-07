'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Planet, PlanetContent, ContentType } from '@/types/database'

interface PlanetEditorProps {
  planet: Planet
  initialContent: PlanetContent[]
  user: User
}

interface NewContentForm {
  type: ContentType
  title: string
  content: any
}

export default function PlanetEditor({ planet, initialContent, user }: PlanetEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content')
  const [content, setContent] = useState<PlanetContent[]>(initialContent)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [newContentForm, setNewContentForm] = useState<NewContentForm>({
    type: 'text',
    title: '',
    content: {}
  })
  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setNewContentForm({
      type: 'text',
      title: '',
      content: {}
    })
  }

  const getDefaultContent = (type: ContentType) => {
    switch (type) {
      case 'text':
        return { text: '', style: { fontSize: '16px', color: '#ffffff' } }
      case 'image':
        return { url: '', alt: '', caption: '', width: '100%' }
      case 'audio':
        return { url: '', title: '', artist: '', autoplay: false }
      case 'video':
        return { url: '', title: '', thumbnail: '', autoplay: false }
      case 'link':
        return { url: '', title: '', description: '', target: '_blank' }
      case 'custom_widget':
        return { html: '', css: '', js: '' }
      default:
        return {}
    }
  }

  const handleTypeChange = (type: ContentType) => {
    setNewContentForm(prev => ({
      ...prev,
      type,
      content: getDefaultContent(type)
    }))
  }

  const addContentBlock = async () => {
    if (!newContentForm.title.trim()) {
      alert('Please enter a title for the content block')
      return
    }

    setLoading(true)
    try {
      const newPosition = Math.max(...content.map(c => c.position), -1) + 1
      
      const { data, error } = await supabase
        .from('planet_content')
        .insert({
          planet_id: planet.id,
          type: newContentForm.type,
          title: newContentForm.title.trim(),
          content: newContentForm.content,
          position: newPosition,
          is_visible: true
        })
        .select()
        .single()

      if (error) throw error

      setContent(prev => [...prev, data])
      setShowAddModal(false)
      resetForm()
    } catch (err: any) {
      console.error('Failed to add content block:', err)
      alert('Failed to add content block: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateContentBlock = async (blockId: string, updates: Partial<PlanetContent>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('planet_content')
        .update(updates)
        .eq('id', blockId)
        .select()
        .single()

      if (error) throw error

      setContent(prev => prev.map(c => c.id === blockId ? data : c))
      setEditingBlock(null)
    } catch (err: any) {
      console.error('Failed to update content block:', err)
      alert('Failed to update content block: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteContentBlock = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('planet_content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      setContent(prev => prev.filter(c => c.id !== contentId))
    } catch (err: any) {
      console.error('Failed to delete content block:', err)
      alert('Failed to delete content block: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const moveContentBlock = async (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = content.findIndex(c => c.id === blockId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= content.length) return

    const newContent = [...content]
    const [movedBlock] = newContent.splice(currentIndex, 1)
    newContent.splice(newIndex, 0, movedBlock)

    // Update positions in database
    setLoading(true)
    try {
      const updates = newContent.map((block, index) => ({
        id: block.id,
        position: index
      }))

      for (const update of updates) {
        await supabase
          .from('planet_content')
          .update({ position: update.position })
          .eq('id', update.id)
      }

      setContent(newContent)
    } catch (err: any) {
      console.error('Failed to reorder content blocks:', err)
      alert('Failed to reorder content blocks: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderContentForm = () => {
    const { type, content: formContent } = newContentForm

    switch (type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 text-sm">TEXT CONTENT:</label>
              <textarea
                value={formContent.text || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, text: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 h-32 resize-none"
                placeholder="Enter your text content..."
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 text-sm">TEXT COLOR:</label>
              <input
                type="color"
                value={formContent.style?.color || '#ffffff'}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { 
                    ...prev.content, 
                    style: { ...prev.content.style, color: e.target.value }
                  }
                }))}
                className="w-16 h-8 border border-green-400 bg-black cursor-pointer"
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 text-sm">IMAGE URL:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 text-sm">ALT TEXT:</label>
              <input
                type="text"
                value={formContent.alt || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, alt: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="Describe the image..."
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 text-sm">CAPTION:</label>
              <input
                type="text"
                value={formContent.caption || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, caption: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="Optional caption..."
              />
            </div>
          </div>
        )

      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 text-sm">URL:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 text-sm">DESCRIPTION:</label>
              <textarea
                value={formContent.description || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, description: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300 h-20 resize-none"
                placeholder="Describe this link..."
              />
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 text-sm">AUDIO URL:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 text-sm">ARTIST:</label>
              <input
                type="text"
                value={formContent.artist || ''}
                onChange={(e) => setNewContentForm(prev => ({
                  ...prev,
                  content: { ...prev.content, artist: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                placeholder="Artist name..."
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-green-600 text-center py-8">
            Content form for {type} coming soon...
          </div>
        )
    }
  }

  const renderContentBlock = (block: PlanetContent, index: number) => {
    const isEditing = editingBlock === block.id

    return (
      <div key={block.id} className="border border-green-400 bg-black">
        <div className="border-b border-green-400 bg-green-900 bg-opacity-20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-green-400 font-bold">
              [{index + 1}] {block.type.toUpperCase()}
            </span>
            <span className="text-green-600 text-sm">
              {block.title || 'Untitled'}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => moveContentBlock(block.id, 'up')}
              disabled={index === 0 || loading}
              className="px-2 py-1 border border-green-400 text-green-400 hover:bg-green-900 hover:bg-opacity-20 transition-colors text-sm disabled:opacity-50"
            >
              ↑
            </button>
            <button
              onClick={() => moveContentBlock(block.id, 'down')}
              disabled={index === content.length - 1 || loading}
              className="px-2 py-1 border border-green-400 text-green-400 hover:bg-green-900 hover:bg-opacity-20 transition-colors text-sm disabled:opacity-50"
            >
              ↓
            </button>
            <button
              onClick={() => setEditingBlock(isEditing ? null : block.id)}
              className="px-3 py-1 border border-green-400 text-green-400 hover:bg-green-900 hover:bg-opacity-20 transition-colors text-sm"
              disabled={loading}
            >
              {isEditing ? 'CANCEL' : 'EDIT'}
            </button>
            <button
              onClick={() => deleteContentBlock(block.id)}
              className="px-3 py-1 border border-red-500 text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-colors text-sm"
              disabled={loading}
            >
              DELETE
            </button>
          </div>
        </div>
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-green-400 mb-2 text-sm">TITLE:</label>
                <input
                  type="text"
                  defaultValue={block.title || ''}
                  onBlur={(e) => {
                    if (e.target.value !== block.title) {
                      updateContentBlock(block.id, { title: e.target.value })
                    }
                  }}
                  className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                />
              </div>
              <div className="text-green-600 text-sm">
                Content editing for {block.type} blocks coming soon...
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-green-400 text-sm">
                <strong>Type:</strong> {block.type}
              </div>
              <div className="text-green-600 text-sm">
                <strong>Content:</strong> {JSON.stringify(block.content).substring(0, 200)}
                {JSON.stringify(block.content).length > 200 && '...'}
              </div>
              <div className="text-green-600 text-sm">
                <strong>Position:</strong> {block.position} | <strong>Visible:</strong> {block.is_visible ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ← DASHBOARD
              </button>
              <h1 className="text-xl font-bold">PLANET_EDITOR.EXE</h1>
              <span className="text-green-600">/{planet.slug}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open(`/planet/${planet.slug}`, '_blank')}
                className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-900 transition-colors"
              >
                PREVIEW
              </button>
              <div className="text-sm">
                USER: {user.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Terminal Window */}
        <div className="border border-green-400 bg-black">
          {/* Window Title Bar */}
          <div className="border-b border-green-400 bg-green-400 text-black px-4 py-2 flex items-center justify-between">
            <span className="font-bold">PLANET EDITOR TERMINAL - {planet.name.toUpperCase()}</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-black"></div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-green-400 bg-black">
            <div className="flex">
              {[
                { id: 'content', label: 'CONTENT_BLOCKS' },
                { id: 'settings', label: 'PLANET_SETTINGS' },
                { id: 'preview', label: 'LIVE_PREVIEW' }
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
          <div className="p-6 min-h-[500px]">
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-green-400 font-bold">&gt; CONTENT_MANAGEMENT:</h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors"
                    disabled={loading}
                  >
                    + ADD_BLOCK
                  </button>
                </div>

                {content.length === 0 ? (
                  <div className="text-center py-12 text-green-600">
                    <div className="text-4xl mb-4">📦</div>
                    <p>NO CONTENT BLOCKS FOUND</p>
                    <p className="text-sm mt-2">Click ADD_BLOCK to start building your planet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {content.map((block, index) => renderContentBlock(block, index))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-green-400 font-bold">&gt; PLANET_CONFIGURATION:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">NAME:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {planet.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">SLUG:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {planet.slug}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">VISIBILITY:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {planet.is_public ? 'PUBLIC' : 'PRIVATE'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">VIEWS:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {planet.view_count}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">CREATED:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {new Date(planet.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-bold">LAST_UPDATED:</label>
                      <div className="bg-black border border-green-400 text-green-400 px-3 py-2">
                        {new Date(planet.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <h3 className="text-green-400 font-bold">&gt; LIVE_PREVIEW:</h3>
                
                {/* Preview Container */}
                <div className="border border-green-400 bg-black rounded-lg overflow-hidden">
                  <div className="bg-green-400 text-black px-4 py-2 flex items-center justify-between">
                    <span className="font-bold">PLANET PREVIEW</span>
                    <button
                      onClick={() => window.open(`/planet/${planet.slug}`, '_blank')}
                      className="px-3 py-1 bg-black text-green-400 text-sm hover:bg-gray-800 transition-colors"
                    >
                      OPEN_FULL_VIEW
                    </button>
                  </div>
                  
                  {/* Mini Preview */}
                  <div className="p-4 bg-gradient-to-br from-indigo-950 via-purple-950 to-black min-h-[400px] relative overflow-hidden">
                    {/* Mini cosmic background */}
                    <div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Preview Header */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-lg">🪐</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white font-mono">
                          {planet.name}
                        </h2>
                      </div>
                      {planet.description && (
                        <p className="text-gray-300 text-sm max-w-2xl">
                          {planet.description}
                        </p>
                      )}
                    </div>

                    {/* Preview Content Grid */}
                    {content.length === 0 ? (
                      <div className="relative z-10 text-center py-12">
                        <div className="text-4xl mb-4">🌌</div>
                        <p className="text-purple-200 font-mono">Empty Universe</p>
                        <p className="text-gray-400 text-sm mt-2">Add content blocks to see them here</p>
                      </div>
                    ) : (
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {content.slice(0, 6).map((block, index) => {
                          const baseClasses = "relative overflow-hidden rounded-xl border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-400/60"
                          
                          switch (block.type) {
                            case 'text':
                              return (
                                <div key={block.id} className={`${baseClasses} bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-4 min-h-[120px] flex flex-col justify-center`}>
                                  <h4 className="text-purple-200 font-bold text-sm mb-2 font-mono">
                                    {block.title}
                                  </h4>
                                  <div className="text-gray-300 text-xs leading-relaxed">
                                    {((block.content as any)?.text || '').substring(0, 100)}
                                    {((block.content as any)?.text || '').length > 100 && '...'}
                                  </div>
                                </div>
                              )

                            case 'image':
                              return (
                                <div key={block.id} className={`${baseClasses} bg-gradient-to-br from-slate-900/40 to-gray-900/40 min-h-[120px] overflow-hidden group`}>
                                  {(block.content as any)?.url ? (
                                    <div className="relative h-full">
                                      <img 
                                        src={(block.content as any).url} 
                                        alt={(block.content as any).alt || block.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                      <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h4 className="text-white font-bold text-sm font-mono">
                                          {block.title}
                                        </h4>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-2xl mb-2">🖼️</div>
                                        <h4 className="text-purple-200 font-bold text-sm font-mono">
                                          {block.title}
                                        </h4>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )

                            case 'link':
                              return (
                                <div key={block.id} className={`${baseClasses} bg-gradient-to-br from-emerald-900/40 to-teal-900/40 p-4 min-h-[120px] flex flex-col justify-center`}>
                                  <div className="flex items-center mb-2">
                                    <span className="text-emerald-400 mr-2">🔗</span>
                                    <h4 className="text-emerald-200 font-bold text-sm font-mono">
                                      {block.title}
                                    </h4>
                                  </div>
                                  {(block.content as any)?.description && (
                                    <p className="text-gray-300 text-xs leading-relaxed">
                                      {((block.content as any).description || '').substring(0, 80)}
                                      {((block.content as any).description || '').length > 80 && '...'}
                                    </p>
                                  )}
                                </div>
                              )

                            case 'audio':
                              return (
                                <div key={block.id} className={`${baseClasses} bg-gradient-to-br from-pink-900/40 to-rose-900/40 p-4 min-h-[120px] flex flex-col justify-center`}>
                                  <div className="flex items-center mb-2">
                                    <span className="text-pink-400 mr-2">🎵</span>
                                    <h4 className="text-pink-200 font-bold text-sm font-mono">
                                      {block.title}
                                    </h4>
                                  </div>
                                  {(block.content as any)?.artist && (
                                    <p className="text-gray-300 text-xs">
                                      by {(block.content as any).artist}
                                    </p>
                                  )}
                                </div>
                              )

                            default:
                              return (
                                <div key={block.id} className={`${baseClasses} bg-gradient-to-br from-gray-900/40 to-slate-900/40 p-4 min-h-[120px] flex flex-col justify-center`}>
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">⚙️</div>
                                    <h4 className="text-gray-200 font-bold text-sm font-mono">
                                      {block.title}
                                    </h4>
                                    <p className="text-gray-400 text-xs mt-1">
                                      {block.type}
                                    </p>
                                  </div>
                                </div>
                              )
                          }
                        })}
                        
                        {content.length > 6 && (
                          <div className="col-span-full text-center py-4">
                            <p className="text-purple-300 text-sm font-mono">
                              ... and {content.length - 6} more blocks
                            </p>
                            <button
                              onClick={() => window.open(`/planet/${planet.slug}`, '_blank')}
                              className="mt-2 px-4 py-2 border border-purple-400 text-purple-400 hover:bg-purple-900 hover:bg-opacity-20 transition-colors text-sm"
                            >
                              VIEW_ALL_CONTENT
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="border border-green-400 bg-black max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-green-400 bg-green-400 text-black px-4 py-2 flex items-center justify-between">
              <span className="font-bold">ADD CONTENT BLOCK</span>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="w-6 h-6 bg-black text-green-400 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-green-400 mb-3 font-bold">SELECT TYPE:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'text', label: 'TEXT', icon: '📝' },
                    { type: 'image', label: 'IMAGE', icon: '🖼️' },
                    { type: 'audio', label: 'AUDIO', icon: '🎵' },
                    { type: 'video', label: 'VIDEO', icon: '🎬' },
                    { type: 'link', label: 'LINK', icon: '🔗' },
                    { type: 'custom_widget', label: 'WIDGET', icon: '⚙️' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleTypeChange(item.type as ContentType)}
                      className={`p-3 border transition-colors text-center ${
                        newContentForm.type === item.type
                          ? 'border-green-400 bg-green-400 text-black'
                          : 'border-green-400 text-green-400 hover:bg-green-900'
                      }`}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="text-xs font-bold">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-green-400 mb-2 font-bold">TITLE:</label>
                <input
                  type="text"
                  value={newContentForm.title}
                  onChange={(e) => setNewContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
                  placeholder="Enter block title..."
                  maxLength={100}
                />
              </div>

              {/* Content Form */}
              <div>
                <label className="block text-green-400 mb-2 font-bold">CONTENT:</label>
                {renderContentForm()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-green-400">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-green-400 text-green-400 hover:bg-green-900 transition-colors"
                  disabled={loading}
                >
                  CANCEL
                </button>
                <button
                  onClick={addContentBlock}
                  disabled={loading || !newContentForm.title.trim()}
                  className="px-6 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'ADDING...' : 'ADD_BLOCK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 