'use client'

import { useState, useRef, useEffect } from 'react'

interface AvatarGeneratorProps {
  onAvatarGenerated: (dataUrl: string) => void
}

interface AvatarConfig {
  style: 'geometric' | 'pixel' | 'abstract' | 'space'
  colorScheme: 'neon' | 'pastel' | 'monochrome' | 'rainbow' | 'terminal'
  complexity: 'simple' | 'medium' | 'complex'
  seed: string
}

export default function AvatarGenerator({ onAvatarGenerated }: AvatarGeneratorProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    style: 'geometric',
    colorScheme: 'neon',
    complexity: 'medium',
    seed: Math.random().toString(36).substring(7)
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simple seeded random number generator
  const seededRandom = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return () => {
      hash = (hash * 9301 + 49297) % 233280
      return hash / 233280
    }
  }

  const getColorPalette = (scheme: string, random: () => number) => {
    switch (scheme) {
      case 'neon':
        return [
          '#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#80ff00'
        ]
      case 'pastel':
        return [
          '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#d4baff'
        ]
      case 'monochrome':
        return [
          '#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000'
        ]
      case 'rainbow':
        return [
          '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
          '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
        ]
      case 'terminal':
        return [
          '#00ff00', '#00cc00', '#009900', '#006600', '#003300', '#ffffff'
        ]
      default:
        return ['#00ff00', '#ff00ff', '#00ffff']
    }
  }

  const generateGeometricAvatar = (ctx: CanvasRenderingContext2D, size: number, random: () => number, colors: string[]) => {
    const centerX = size / 2
    const centerY = size / 2
    
    // Background
    ctx.fillStyle = colors[Math.floor(random() * colors.length)]
    ctx.fillRect(0, 0, size, size)
    
    // Generate geometric shapes
    const shapeCount = config.complexity === 'simple' ? 3 : config.complexity === 'medium' ? 6 : 12
    
    for (let i = 0; i < shapeCount; i++) {
      ctx.fillStyle = colors[Math.floor(random() * colors.length)]
      ctx.globalAlpha = 0.7 + random() * 0.3
      
      const shapeType = Math.floor(random() * 3)
      
      if (shapeType === 0) {
        // Circle
        const radius = 20 + random() * 60
        const x = random() * size
        const y = random() * size
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      } else if (shapeType === 1) {
        // Rectangle
        const width = 30 + random() * 80
        const height = 30 + random() * 80
        const x = random() * (size - width)
        const y = random() * (size - height)
        ctx.fillRect(x, y, width, height)
      } else {
        // Triangle
        const x1 = random() * size
        const y1 = random() * size
        const x2 = x1 + (random() - 0.5) * 100
        const y2 = y1 + (random() - 0.5) * 100
        const x3 = x1 + (random() - 0.5) * 100
        const y3 = y1 + (random() - 0.5) * 100
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.closePath()
        ctx.fill()
      }
    }
    
    ctx.globalAlpha = 1
  }

  const generatePixelAvatar = (ctx: CanvasRenderingContext2D, size: number, random: () => number, colors: string[]) => {
    const pixelSize = config.complexity === 'simple' ? 20 : config.complexity === 'medium' ? 12 : 8
    const gridSize = Math.floor(size / pixelSize)
    
    // Create symmetric pattern
    for (let x = 0; x < Math.ceil(gridSize / 2); x++) {
      for (let y = 0; y < gridSize; y++) {
        if (random() > 0.5) {
          const color = colors[Math.floor(random() * colors.length)]
          ctx.fillStyle = color
          
          // Draw pixel and its mirror
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
          ctx.fillRect((gridSize - 1 - x) * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      }
    }
  }

  const generateAbstractAvatar = (ctx: CanvasRenderingContext2D, size: number, random: () => number, colors: string[]) => {
    // Background gradient
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    
    // Abstract flowing shapes
    const pathCount = config.complexity === 'simple' ? 2 : config.complexity === 'medium' ? 4 : 8
    
    for (let i = 0; i < pathCount; i++) {
      ctx.strokeStyle = colors[Math.floor(random() * colors.length)]
      ctx.lineWidth = 5 + random() * 15
      ctx.globalAlpha = 0.6 + random() * 0.4
      
      ctx.beginPath()
      ctx.moveTo(random() * size, random() * size)
      
      for (let j = 0; j < 5; j++) {
        const cpx1 = random() * size
        const cpy1 = random() * size
        const cpx2 = random() * size
        const cpy2 = random() * size
        const x = random() * size
        const y = random() * size
        
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y)
      }
      
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }

  const generateSpaceAvatar = (ctx: CanvasRenderingContext2D, size: number, random: () => number, colors: string[]) => {
    // Space background
    ctx.fillStyle = '#000011'
    ctx.fillRect(0, 0, size, size)
    
    // Stars
    const starCount = config.complexity === 'simple' ? 20 : config.complexity === 'medium' ? 50 : 100
    
    for (let i = 0; i < starCount; i++) {
      const x = random() * size
      const y = random() * size
      const radius = random() * 2
      
      ctx.fillStyle = random() > 0.8 ? colors[Math.floor(random() * colors.length)] : '#ffffff'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Central planet/object
    const centerX = size / 2
    const centerY = size / 2
    const planetRadius = 40 + random() * 40
    
    const planetGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, planetRadius)
    planetGradient.addColorStop(0, colors[0])
    planetGradient.addColorStop(0.7, colors[1])
    planetGradient.addColorStop(1, colors[2])
    
    ctx.fillStyle = planetGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Rings
    if (random() > 0.5) {
      ctx.strokeStyle = colors[Math.floor(random() * colors.length)]
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.6
      
      for (let i = 0; i < 3; i++) {
        const ringRadius = planetRadius + 15 + i * 10
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    
    ctx.globalAlpha = 1
  }

  const generateAvatar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsGenerating(true)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 256
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    const random = seededRandom(config.seed)
    const colors = getColorPalette(config.colorScheme, random)

    // Generate based on style
    switch (config.style) {
      case 'geometric':
        generateGeometricAvatar(ctx, size, random, colors)
        break
      case 'pixel':
        generatePixelAvatar(ctx, size, random, colors)
        break
      case 'abstract':
        generateAbstractAvatar(ctx, size, random, colors)
        break
      case 'space':
        generateSpaceAvatar(ctx, size, random, colors)
        break
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
    setIsGenerating(false)
  }

  const handleUseAvatar = () => {
    if (previewUrl) {
      onAvatarGenerated(previewUrl)
    }
  }

  const randomizeSeed = () => {
    setConfig(prev => ({
      ...prev,
      seed: Math.random().toString(36).substring(7)
    }))
  }

  // Generate initial avatar
  useEffect(() => {
    generateAvatar()
  }, [config])

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="border border-green-400 p-4">
        <h4 className="text-sm mb-3">&gt; PREVIEW:</h4>
        <div className="flex items-center space-x-4">
          <div className="border border-green-400 p-2">
            {isGenerating ? (
              <div className="w-32 h-32 flex items-center justify-center text-green-600">
                GENERATING...
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-32 h-32 border border-green-400"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={generateAvatar}
              disabled={isGenerating}
              className="block px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50"
            >
              {isGenerating ? '[GENERATING...]' : '[REGENERATE]'}
            </button>
            <button
              onClick={handleUseAvatar}
              disabled={!previewUrl || isGenerating}
              className="block px-4 py-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors disabled:opacity-50"
            >
              [USE] SET AS AVATAR
            </button>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Style */}
        <div>
          <label className="block text-sm mb-2">&gt; STYLE:</label>
          <select
            value={config.style}
            onChange={(e) => setConfig(prev => ({ ...prev, style: e.target.value as any }))}
            className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
          >
            <option value="geometric">GEOMETRIC</option>
            <option value="pixel">PIXEL ART</option>
            <option value="abstract">ABSTRACT</option>
            <option value="space">SPACE THEME</option>
          </select>
        </div>

        {/* Color Scheme */}
        <div>
          <label className="block text-sm mb-2">&gt; COLOR SCHEME:</label>
          <select
            value={config.colorScheme}
            onChange={(e) => setConfig(prev => ({ ...prev, colorScheme: e.target.value as any }))}
            className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
          >
            <option value="neon">NEON</option>
            <option value="pastel">PASTEL</option>
            <option value="monochrome">MONOCHROME</option>
            <option value="rainbow">RAINBOW</option>
            <option value="terminal">TERMINAL GREEN</option>
          </select>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm mb-2">&gt; COMPLEXITY:</label>
          <select
            value={config.complexity}
            onChange={(e) => setConfig(prev => ({ ...prev, complexity: e.target.value as any }))}
            className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
          >
            <option value="simple">SIMPLE</option>
            <option value="medium">MEDIUM</option>
            <option value="complex">COMPLEX</option>
          </select>
        </div>

        {/* Seed */}
        <div>
          <label className="block text-sm mb-2">&gt; SEED:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={config.seed}
              onChange={(e) => setConfig(prev => ({ ...prev, seed: e.target.value }))}
              className="flex-1 bg-black border border-green-400 text-green-400 px-3 py-2 font-mono focus:outline-none focus:border-green-300"
              placeholder="Random seed..."
            />
            <button
              onClick={randomizeSeed}
              className="px-3 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
            >
              🎲
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <h4 className="text-sm mb-3">&gt; QUICK PRESETS:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'RETRO', style: 'pixel', colorScheme: 'neon', complexity: 'medium' },
            { name: 'MINIMAL', style: 'geometric', colorScheme: 'monochrome', complexity: 'simple' },
            { name: 'COSMIC', style: 'space', colorScheme: 'neon', complexity: 'complex' },
            { name: 'RAINBOW', style: 'abstract', colorScheme: 'rainbow', complexity: 'medium' }
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => setConfig(prev => ({
                ...prev,
                style: preset.style as any,
                colorScheme: preset.colorScheme as any,
                complexity: preset.complexity as any,
                seed: Math.random().toString(36).substring(7)
              }))}
              className="px-3 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors text-xs"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-green-600">
        <p>&gt; Generated avatars are unique based on the seed value</p>
        <p>&gt; Same seed + settings = same avatar</p>
        <p>&gt; Share seeds with friends to create matching avatars!</p>
      </div>
    </div>
  )
} 