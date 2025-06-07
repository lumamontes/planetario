'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Planet, PlanetContent, ContentType, PlanetTheme } from '@/types/database'

interface PlanetEditorProps {
  planet: Planet
  initialContent: PlanetContent[]
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

// Color Picker Component
interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-green-400 font-medium text-sm">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-green-400 rounded cursor-pointer bg-black"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-black border border-green-400 text-green-400 px-3 py-2 text-sm focus:outline-none focus:border-green-300 rounded font-mono"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-green-600 text-xs">{description}</p>
      )}
    </div>
  )
}

// Custom Theme Editor Component
interface CustomThemeEditorProps {
  theme: PlanetTheme
  onThemeChange: (theme: PlanetTheme) => void
  onSave: () => void
  isLoading: boolean
}

function CustomThemeEditor({ theme, onThemeChange, onSave, isLoading }: CustomThemeEditorProps) {
  const updateColor = (colorKey: keyof PlanetTheme['colors'], value: string) => {
    onThemeChange({
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    })
  }

  const presetSchemes = [
    {
      name: '🟢 Terminal Verde',
      colors: {
        primary: '#00ff00',
        secondary: '#ffff00',
        background: '#000000',
        text: '#ffffff',
        accent: '#ff00ff'
      }
    },
    {
      name: '🌈 Cyberpunk Neon',
      colors: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        background: '#0a0a0a',
        text: '#ffffff',
        accent: '#ffff00'
      }
    },
    {
      name: '🌌 Espaço Profundo',
      colors: {
        primary: '#0066ff',
        secondary: '#66ccff',
        background: '#000011',
        text: '#ffffff',
        accent: '#ff6600'
      }
    },
    {
      name: '🟡 Retro Amber',
      colors: {
        primary: '#ffaa00',
        secondary: '#ffcc66',
        background: '#1a1a00',
        text: '#ffffff',
        accent: '#ff6600'
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Preset Schemes */}
      <div>
        <h4 className="text-green-400 font-medium mb-3">Esquemas Predefinidos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presetSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => onThemeChange({
                ...theme,
                colors: scheme.colors
              })}
              className="p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex space-x-1">
                  {Object.values(scheme.colors).slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded border border-green-400/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-green-400 text-sm font-medium">{scheme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div>
        <h4 className="text-green-400 font-medium mb-3">Cores Personalizadas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorPicker
            label="Cor Primária"
            value={theme.colors.primary}
            onChange={(color) => updateColor('primary', color)}
            description="Cor principal do tema, usada em títulos e elementos importantes"
          />
          <ColorPicker
            label="Cor Secundária"
            value={theme.colors.secondary}
            onChange={(color) => updateColor('secondary', color)}
            description="Cor secundária, usada em subtítulos e elementos de apoio"
          />
          <ColorPicker
            label="Cor de Fundo"
            value={theme.colors.background}
            onChange={(color) => updateColor('background', color)}
            description="Cor de fundo principal do planeta"
          />
          <ColorPicker
            label="Cor do Texto"
            value={theme.colors.text}
            onChange={(color) => updateColor('text', color)}
            description="Cor do texto principal"
          />
          <ColorPicker
            label="Cor de Acento"
            value={theme.colors.accent}
            onChange={(color) => updateColor('accent', color)}
            description="Cor de destaque para links e elementos interativos"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <h4 className="text-green-400 font-medium mb-3">Prévia do Tema</h4>
        <div 
          className="border rounded p-4 space-y-3"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
            color: theme.colors.text
          }}
        >
          <h5 
            className="font-bold text-lg"
            style={{ color: theme.colors.primary }}
          >
            Título Principal
          </h5>
          <p 
            className="text-sm"
            style={{ color: theme.colors.secondary }}
          >
            Subtítulo ou descrição secundária
          </p>
          <p style={{ color: theme.colors.text }}>
            Este é um exemplo de texto normal no seu planeta.
          </p>
          <a 
            href="#" 
            className="underline"
            style={{ color: theme.colors.accent }}
            onClick={(e) => e.preventDefault()}
          >
            Link de exemplo
          </a>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <h4 className="text-green-400 font-medium mb-3">Tipografia</h4>
        <div>
          <label className="block text-green-400 mb-2 font-medium">
            Família da Fonte
          </label>
          <select
            value={theme.fonts?.body || 'Monaco, "Courier New", monospace'}
            onChange={(e) => onThemeChange({
              ...theme,
              fonts: { 
                ...theme.fonts, 
                body: e.target.value, 
                heading: e.target.value 
              }
            })}
            className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
          >
            <option value='Monaco, "Courier New", monospace'>🔤 Monospace (Terminal)</option>
            <option value='"Helvetica Neue", Arial, sans-serif'>📝 Sans Serif (Moderno)</option>
            <option value='"Times New Roman", serif'>📖 Serif (Clássico)</option>
            <option value='"Comic Sans MS", cursive'>🎨 Comic Sans (Divertido)</option>
            <option value='"Courier New", monospace'>⌨️ Courier (Máquina de escrever)</option>
          </select>
        </div>
      </div>

      {/* Visual Effects */}
      <div>
        <h4 className="text-green-400 font-medium mb-3">Efeitos Visuais</h4>
        <label className="flex items-center space-x-3 p-3 border border-green-400/30 rounded hover:border-green-400 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={theme.shadows || false}
            onChange={(e) => onThemeChange({
              ...theme,
              shadows: e.target.checked
            })}
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

      {/* Save Button */}
      <div className="border-t border-green-400/30 pt-6">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-green-400 text-black font-bold hover:bg-green-300 disabled:bg-gray-600 disabled:text-gray-400 transition-colors rounded"
        >
          {isLoading ? 'Salvando...' : 'Salvar Tema Personalizado'}
        </button>
      </div>
    </div>
  )
}

export default function PlanetEditor({ planet, initialContent }: PlanetEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'theme'>('content')
  const [content, setContent] = useState<PlanetContent[]>(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContent, setEditingContent] = useState<PlanetContent | null>(null)
  const [newContent, setNewContent] = useState<{
    type: ContentType
    title: string
    content: any
  }>({
    type: 'text',
    title: '',
    content: {}
  })
  
  // Theme state
  const [theme, setTheme] = useState<PlanetTheme>(
    (planet.theme as unknown as PlanetTheme) || defaultTheme
  )
  
  const router = useRouter()
  const supabase = createClient()

  const resetForm = () => {
    setNewContent({
      type: 'text',
      title: '',
      content: {}
    })
  }

  const saveTheme = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('planets')
        .update({
          theme: theme as any
        })
        .eq('id', planet.id)

      if (error) throw error

      alert('Tema salvo com sucesso!')
    } catch (err: any) {
      console.error('Failed to save theme:', err)
      alert('Erro ao salvar tema: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultContent = (type: ContentType) => {
    switch (type) {
      case 'text':
        return { text: '' }
      case 'image':
        return { images: [], caption: '' }
      case 'audio':
        return { url: '', title: '', artist: '' }
      case 'video':
        return { url: '', type: 'youtube' }
      case 'link':
        return { url: '', title: '', description: '' }
      case 'custom_widget':
        return { html: '', css: '', js: '' }
      default:
        return {}
    }
  }

  const handleTypeChange = (type: ContentType) => {
    setNewContent(prev => ({
      ...prev,
      type,
      content: getDefaultContent(type)
    }))
  }

  const addContentBlock = async () => {
    if (!newContent.title.trim()) {
      // Auto-generate title based on type
      const autoTitles: Record<ContentType, string> = {
        text: 'Texto',
        image: 'Imagens',
        video: 'Vídeo',
        link: 'Link',
        audio: 'Áudio',
        custom_widget: 'Widget',
        spotify_track: 'Música',
        spotify_playlist: 'Playlist',
        spotify_album: 'Álbum',
        letterboxd_film: 'Filme',
        letterboxd_list: 'Lista de Filmes',
        instagram_post: 'Post Instagram',
        twitter_tweet: 'Tweet'
      }
      setNewContent(prev => ({
        ...prev,
        title: autoTitles[prev.type] || 'Conteúdo'
      }))
    }

    setIsLoading(true)
    try {
      const newPosition = Math.max(...content.map(c => c.position), -1) + 1
      
      const { data, error } = await supabase
        .from('planet_content')
        .insert({
          planet_id: planet.id,
          type: newContent.type,
          title: newContent.title.trim() || 'Conteúdo',
          content: newContent.content,
          position: newPosition,
          is_visible: true
        })
        .select()
        .single()

      if (error) throw error

      setContent(prev => [...prev, data])
      setShowAddForm(false)
      resetForm()
    } catch (err: any) {
      console.error('Failed to add content block:', err)
      alert('Failed to add content block: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateContentBlock = async (blockId: string, updates: Partial<PlanetContent>) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('planet_content')
        .update(updates)
        .eq('id', blockId)
        .select()
        .single()

      if (error) throw error

      setContent(prev => prev.map(c => c.id === blockId ? data : c))
      setEditingContent(null)
    } catch (err: any) {
      console.error('Failed to update content block:', err)
      alert('Failed to update content block: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteContentBlock = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) return

    setIsLoading(true)
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
      setIsLoading(false)
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
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleImageUpload = async (files: FileList, blockId?: string) => {
    const maxImages = 4
    const currentImages = blockId ? 
      ((content.find(c => c.id === blockId)?.content as any)?.images || []) :
      ((newContent.content as any)?.images || [])
    
    if (currentImages.length + files.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens por bloco`)
      return
    }

    const uploadedImages: Array<{ url: string; alt: string; caption: string }> = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      
      // Create a data URL for immediate preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          url: e.target?.result as string,
          alt: file.name,
          caption: ''
        }
        uploadedImages.push(imageData)
        
        if (uploadedImages.length === files.length) {
          if (blockId) {
            // Update existing block
            const block = content.find(c => c.id === blockId)
            if (block) {
              updateContentBlock(blockId, {
                content: {
                  ...(block.content as any),
                  images: [...currentImages, ...uploadedImages]
                }
              })
            }
          } else {
            // Update form
            setNewContent(prev => ({
              ...prev,
              content: {
                ...prev.content,
                images: [...currentImages, ...uploadedImages]
              }
            }))
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (imageIndex: number, blockId?: string) => {
    if (blockId) {
      const block = content.find(c => c.id === blockId)
      if (block) {
        const images = [...((block.content as any)?.images || [])]
        images.splice(imageIndex, 1)
        updateContentBlock(blockId, {
          content: { ...(block.content as any), images }
        })
      }
    } else {
      const images = [...((newContent.content as any)?.images || [])]
      images.splice(imageIndex, 1)
      setNewContent(prev => ({
        ...prev,
        content: { ...prev.content, images }
      }))
    }
  }

  const renderContentForm = () => {
    const { type, content: formContent } = newContent

    switch (type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 font-medium">Conteúdo:</label>
              <textarea
                value={formContent.text || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, text: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-32 resize-none rounded"
                placeholder="Digite seu texto aqui..."
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDrop={(e) => {
                e.preventDefault()
                const files = e.dataTransfer.files
                if (files.length > 0) {
                  handleImageUpload(files)
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              className="border-2 border-dashed border-green-400 rounded-lg p-8 text-center hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <div className="text-4xl mb-4">📸</div>
              <p className="text-green-400 mb-2">Arraste imagens aqui ou clique para selecionar</p>
              <p className="text-green-600 text-sm">Máximo de 4 imagens por bloco</p>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(e.target.files)
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Image Preview Grid */}
            {((formContent as any)?.images?.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {((formContent as any).images || []).map((image: any, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded border border-green-400"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-green-400 mb-2 font-medium">Legenda (opcional):</label>
              <input
                type="text"
                value={(formContent as any)?.caption || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, caption: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="Adicione uma legenda..."
              />
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 font-medium">URL do YouTube:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value, type: 'youtube' }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            
            {/* YouTube Preview */}
            {formContent.url && extractYouTubeId(formContent.url) && (
              <div className="border border-green-400 rounded overflow-hidden">
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(formContent.url)}`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        )

      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 font-medium">URL:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="https://exemplo.com"
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 font-medium">Título:</label>
              <input
                type="text"
                value={formContent.title || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, title: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="Nome do link"
              />
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 font-medium">URL do áudio:</label>
              <input
                type="url"
                value={formContent.url || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, url: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="https://exemplo.com/audio.mp3"
              />
            </div>
            <div>
              <label className="block text-green-400 mb-2 font-medium">Título:</label>
              <input
                type="text"
                value={formContent.title || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, title: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                placeholder="Nome da música"
              />
            </div>
          </div>
        )

      case 'custom_widget':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-400 rounded p-4 mb-4">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <span>⚠️</span>
                <span className="font-bold">Widget Personalizado</span>
              </div>
              <p className="text-yellow-300 text-sm">
                Crie widgets interativos com HTML, CSS e JavaScript. O código será executado no planeta.
              </p>
            </div>
            
            <div>
              <label className="block text-green-400 mb-2 font-medium">HTML:</label>
              <textarea
                value={formContent.html || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, html: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-24 resize-none rounded font-mono text-sm"
                placeholder='<div id="meu-widget">Olá mundo!</div>'
              />
            </div>
            
            <div>
              <label className="block text-green-400 mb-2 font-medium">CSS (opcional):</label>
              <textarea
                value={formContent.css || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, css: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-20 resize-none rounded font-mono text-sm"
                placeholder="#meu-widget { color: #00ff00; padding: 10px; }"
              />
            </div>
            
            <div>
              <label className="block text-green-400 mb-2 font-medium">JavaScript (opcional):</label>
              <textarea
                value={formContent.js || ''}
                onChange={(e) => setNewContent(prev => ({
                  ...prev,
                  content: { ...prev.content, js: e.target.value }
                }))}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-20 resize-none rounded font-mono text-sm"
                placeholder="document.getElementById('meu-widget').onclick = () => alert('Clicou!');"
              />
            </div>
            
            {/* Live Preview */}
            {(formContent.html || formContent.css || formContent.js) && (
              <div className="border border-green-400 rounded p-4">
                <div className="text-green-400 mb-2 font-medium">Prévia:</div>
                <div className="bg-white/10 rounded p-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: formContent.html || '' }}
                  />
                  {formContent.css && (
                    <style dangerouslySetInnerHTML={{ __html: formContent.css }} />
                  )}
                  {formContent.js && (
                    <script dangerouslySetInnerHTML={{ __html: formContent.js }} />
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-green-600 text-center py-8 border border-green-400/30 rounded">
            Formulário para {type} em breve...
          </div>
        )
    }
  }

  const renderContentBlock = (block: PlanetContent, index: number) => {
    const isEditing = editingContent === block

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'text': return '📝'
        case 'image': return '🖼️'
        case 'link': return '🔗'
        case 'audio': return '🎵'
        case 'video': return '🎬'
        case 'custom_widget': return '⚙️'
        default: return '📄'
      }
    }

    const getTypeName = (type: string) => {
      switch (type) {
        case 'text': return 'Texto'
        case 'image': return 'Imagem'
        case 'link': return 'Link'
        case 'audio': return 'Áudio'
        case 'video': return 'Vídeo'
        case 'custom_widget': return 'Widget'
        default: return type
      }
    }

    return (
      <div key={block.id} className="border border-green-400 bg-black/50 rounded-lg overflow-hidden">
        <div className="border-b border-green-400 bg-green-400/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getTypeIcon(block.type)}</span>
            <div>
              <span className="text-green-400 font-medium">
                {getTypeName(block.type)} #{index + 1}
              </span>
              <div className="text-green-600 text-sm">
                {block.title || 'Sem título'}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => moveContentBlock(block.id, 'up')}
              disabled={index === 0 || isLoading}
              className="p-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 rounded"
              title="Mover para cima"
            >
              ↑
            </button>
            <button
              onClick={() => moveContentBlock(block.id, 'down')}
              disabled={index === content.length - 1 || isLoading}
              className="p-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 rounded"
              title="Mover para baixo"
            >
              ↓
            </button>
            <button
              onClick={() => setEditingContent(isEditing ? null : block)}
              className="px-3 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors rounded"
              disabled={isLoading}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            <button
              onClick={() => deleteContentBlock(block.id)}
              className="px-3 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors rounded"
              disabled={isLoading}
            >
              Excluir
            </button>
          </div>
        </div>
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-green-400 mb-2 font-medium">Título:</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                  className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                  placeholder="Título do bloco..."
                />
              </div>
              
              {/* Content preview/edit based on type */}
              {block.type === 'text' && (
                <div>
                  <label className="block text-green-400 mb-2 font-medium">Conteúdo:</label>
                  <textarea
                    value={(block.content as any)?.text || ''}
                    onChange={(e) => updateContentBlock(block.id, { 
                      content: { ...(block.content as any), text: e.target.value }
                    })}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-24 resize-none rounded"
                    placeholder="Texto do bloco..."
                  />
                </div>
              )}
              
              {block.type === 'image' && (
                <div className="space-y-3">
                  {/* Drag and Drop Area for editing */}
                  <div
                    onDrop={(e) => {
                      e.preventDefault()
                      const files = e.dataTransfer.files
                      if (files.length > 0) {
                        handleImageUpload(files, block.id)
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-green-400/50 rounded-lg p-4 text-center hover:border-green-400 transition-colors cursor-pointer"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.multiple = true
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files
                        if (files) handleImageUpload(files, block.id)
                      }
                      input.click()
                    }}
                  >
                    <div className="text-2xl mb-2">📸</div>
                    <p className="text-green-400 text-sm">Adicionar mais imagens</p>
                  </div>

                  {/* Current Images Grid */}
                  {((block.content as any)?.images?.length > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      {((block.content as any).images || []).map((image: any, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-24 object-cover rounded border border-green-400/30"
                          />
                          <button
                            onClick={() => removeImage(index, block.id)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-green-400 mb-2 font-medium">Legenda:</label>
                    <input
                      type="text"
                      value={(block.content as any)?.caption || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), caption: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="Legenda das imagens..."
                    />
                  </div>
                </div>
              )}
              
              {block.type === 'video' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">URL do YouTube:</label>
                    <input
                      type="url"
                      value={(block.content as any)?.url || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), url: e.target.value, type: 'youtube' }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  
                  {/* YouTube Preview */}
                  {(block.content as any)?.url && extractYouTubeId((block.content as any).url) && (
                    <div className="border border-green-400/30 rounded overflow-hidden">
                      <iframe
                        width="100%"
                        height="150"
                        src={`https://www.youtube.com/embed/${extractYouTubeId((block.content as any).url)}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'link' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">URL:</label>
                    <input
                      type="url"
                      value={(block.content as any)?.url || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), url: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="https://exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">Título:</label>
                    <input
                      type="text"
                      value={(block.content as any)?.title || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), title: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="Nome do link..."
                    />
                  </div>
                </div>
              )}
              
              {block.type === 'audio' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">URL do áudio:</label>
                    <input
                      type="url"
                      value={(block.content as any)?.url || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), url: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="https://exemplo.com/audio.mp3"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">Título:</label>
                    <input
                      type="text"
                      value={(block.content as any)?.title || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), title: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                      placeholder="Nome da música..."
                    />
                  </div>
                </div>
              )}

              {block.type === 'custom_widget' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">HTML:</label>
                    <textarea
                      value={(block.content as any)?.html || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), html: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-20 resize-none rounded font-mono text-sm"
                      placeholder="<div>Seu HTML aqui...</div>"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">CSS:</label>
                    <textarea
                      value={(block.content as any)?.css || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), css: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-16 resize-none rounded font-mono text-sm"
                      placeholder=".meu-estilo { color: #00ff00; }"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 mb-2 font-medium">JavaScript:</label>
                    <textarea
                      value={(block.content as any)?.js || ''}
                      onChange={(e) => updateContentBlock(block.id, { 
                        content: { ...(block.content as any), js: e.target.value }
                      })}
                      className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 h-16 resize-none rounded font-mono text-sm"
                      placeholder="console.log('Hello world!');"
                    />
                  </div>
                  
                  {/* Live Preview */}
                  {((block.content as any)?.html || (block.content as any)?.css || (block.content as any)?.js) && (
                    <div className="border border-green-400/30 rounded p-3">
                      <div className="text-green-400 mb-2 text-sm font-medium">Prévia:</div>
                      <div className="bg-white/5 rounded p-3">
                        <div
                          dangerouslySetInnerHTML={{ __html: (block.content as any)?.html || '' }}
                        />
                        {(block.content as any)?.css && (
                          <style dangerouslySetInnerHTML={{ __html: (block.content as any).css }} />
                        )}
                        {(block.content as any)?.js && (
                          <script dangerouslySetInnerHTML={{ __html: (block.content as any).js }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-green-300 font-medium">{block.title}</div>
              
              {/* Content preview based on type */}
              {block.type === 'text' && (
                <div className="text-gray-300 text-sm bg-black/30 p-3 rounded border border-green-400/20">
                  {((block.content as any)?.text || '').substring(0, 150)}
                  {((block.content as any)?.text || '').length > 150 && '...'}
                </div>
              )}
              
              {block.type === 'image' && (
                <div className="bg-black/30 p-3 rounded border border-green-400/20">
                  {((block.content as any)?.images?.length > 0) ? (
                    <div className="space-y-2">
                      <div className={`grid gap-2 ${((block.content as any).images.length === 1) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {((block.content as any).images || []).slice(0, 4).map((image: any, index: number) => (
                          <img 
                            key={index}
                            src={image.url} 
                            alt={image.alt || block.title}
                            className="w-full h-16 object-cover rounded border border-green-400/30"
                          />
                        ))}
                      </div>
                      {((block.content as any)?.caption) && (
                        <div className="text-gray-400 text-xs">
                          {(block.content as any).caption}
                        </div>
                      )}
                      <div className="text-green-400 text-xs">
                        {((block.content as any).images || []).length} imagem(ns)
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Nenhuma imagem adicionada</div>
                  )}
                </div>
              )}
              
              {block.type === 'video' && (
                <div className="bg-black/30 p-3 rounded border border-green-400/20">
                  {(block.content as any)?.url && extractYouTubeId((block.content as any).url) ? (
                    <div className="space-y-2">
                      <div className="w-full h-20 bg-red-600/20 rounded border border-red-400/30 flex items-center justify-center">
                        <span className="text-red-400 text-xs">▶️ YouTube Video</span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        ID: {extractYouTubeId((block.content as any).url)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Nenhum vídeo do YouTube configurado</div>
                  )}
                </div>
              )}
              
              {block.type === 'link' && (
                <div className="bg-black/30 p-3 rounded border border-green-400/20">
                  <div className="text-blue-400 text-sm font-mono break-all">
                    {(block.content as any)?.url || 'Nenhuma URL configurada'}
                  </div>
                  {(block.content as any)?.title && (
                    <div className="text-gray-300 text-xs mt-1 font-medium">
                      {(block.content as any).title}
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'audio' && (
                <div className="bg-black/30 p-3 rounded border border-green-400/20">
                  <div className="text-pink-400 text-sm font-mono break-all">
                    {(block.content as any)?.url || 'Nenhuma URL de áudio configurada'}
                  </div>
                  {(block.content as any)?.title && (
                    <div className="text-gray-300 text-xs mt-1 font-medium">
                      {(block.content as any).title}
                    </div>
                  )}
                </div>
              )}

              {block.type === 'custom_widget' && (
                <div className="bg-black/30 p-3 rounded border border-green-400/20">
                  {((block.content as any)?.html || (block.content as any)?.css || (block.content as any)?.js) ? (
                    <div className="space-y-2">
                      <div className="text-purple-400 text-xs font-medium">Widget Personalizado</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className={`p-1 rounded text-center ${(block.content as any)?.html ? 'bg-orange-900/30 text-orange-400' : 'bg-gray-900/30 text-gray-600'}`}>
                          HTML
                        </div>
                        <div className={`p-1 rounded text-center ${(block.content as any)?.css ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-900/30 text-gray-600'}`}>
                          CSS
                        </div>
                        <div className={`p-1 rounded text-center ${(block.content as any)?.js ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-900/30 text-gray-600'}`}>
                          JS
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Widget vazio</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-green-600">
                <span>Posição: {block.position}</span>
                <span>Visível: {block.is_visible ? 'Sim' : 'Não'}</span>
                <span>Criado: {new Date(block.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black/90 border border-green-400 rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-green-400">Editor do Planeta</h1>
            <div className="text-sm text-green-600">
              {planet.slug}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span><span className="text-green-600">Nome:</span> {planet.name}</span>
            <span><span className="text-green-600">Blocos:</span> {content.length}</span>
            <span><span className="text-green-600">Status:</span> {planet.is_public ? 'Público' : 'Privado'}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-black/90 border border-green-400 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/planets')}
              className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
            >
              <span>←</span>
              <span>Voltar aos Planetas</span>
            </button>
            <button
              onClick={() => window.open(`/planet/${planet.slug}`, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors rounded"
            >
              <span>🌍</span>
              <span>Ver Planeta 3D</span>
            </button>
          </div>
        </div>

        {/* Main Editor */}
        <div className="bg-black/90 border border-green-400 rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-green-400">
            <div className="flex">
              {[
                { id: 'content', label: 'Gerenciar Conteúdo', icon: '📝' },
                { id: 'settings', label: 'Configurações', icon: '⚙️' },
                { id: 'theme', label: 'Tema', icon: '🎨' },
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
          <div className="p-6 min-h-[500px]">
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-green-400 font-bold text-xl">Blocos de Conteúdo</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors rounded font-bold"
                    disabled={isLoading}
                  >
                    <span>+</span>
                    <span>Adicionar Bloco</span>
                  </button>
                </div>

                {content.length === 0 ? (
                  <div className="text-center py-12 text-green-600 border border-green-400/30 rounded-lg">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-lg font-medium">Nenhum bloco de conteúdo encontrado</p>
                    <p className="text-sm mt-2">Clique em &quot;Adicionar Bloco&quot; para começar a construir seu planeta</p>
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
                <h3 className="text-green-400 font-bold text-xl">Configurações do Planeta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Nome:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded">
                        {planet.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Slug:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded font-mono">
                        /{planet.slug}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Visibilidade:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded">
                        {planet.is_public ? 'Público' : 'Privado'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Visualizações:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded">
                        {planet.view_count}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Criado em:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded">
                        {new Date(planet.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-green-400 mb-2 font-medium">Última atualização:</label>
                      <div className="bg-black/50 border border-green-400/30 text-green-400 px-3 py-2 rounded">
                        {new Date(planet.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-green-400/30 pt-6">
                  <button
                    onClick={() => router.push(`/planet/${planet.slug}/edit/settings`)}
                    className="flex items-center space-x-2 px-4 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors rounded"
                  >
                    <span>⚙️</span>
                    <span>Editar Configurações Básicas</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="text-green-400 font-bold text-xl">Tema do Planeta</h3>
                
                <CustomThemeEditor
                  theme={theme}
                  onThemeChange={(newTheme) => setTheme(newTheme)}
                  onSave={saveTheme}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add Content Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-green-400 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-green-400 text-xl font-bold">Adicionar Novo Bloco</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  className="text-green-400 hover:text-green-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Content Type Selection */}
                <div>
                  <label className="block text-green-400 mb-2 font-medium">Tipo de Conteúdo:</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => handleTypeChange(e.target.value as ContentType)}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                  >
                    <option value="text">📝 Texto</option>
                    <option value="image">🖼️ Imagem</option>
                    <option value="link">🔗 Link</option>
                    <option value="audio">🎵 Áudio</option>
                    <option value="video">🎬 Vídeo</option>
                    <option value="custom_widget">⚙️ Widget Personalizado</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-green-400 mb-2 font-medium">Título:</label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded"
                    placeholder="Digite o título do bloco..."
                    maxLength={100}
                  />
                </div>

                {/* Dynamic Content Form */}
                {renderContentForm()}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-green-400/30">
                  <button
                    onClick={addContentBlock}
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 bg-green-400 text-black hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400 rounded font-bold"
                  >
                    {isLoading ? 'Adicionando...' : 'Adicionar Bloco'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                    className="flex-1 py-2 px-4 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 