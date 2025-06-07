'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Text, Html, Stars, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Planet, PlanetContent, PlanetTheme, PlanetLayout } from '@/types/database'
import { User } from '@supabase/supabase-js'
import PlanetNotes from '@/components/PlanetNotes'

interface PlanetViewerProps {
  planet: Planet
  content: PlanetContent[]
  user: User | null
  isOwner: boolean
}

interface ContentBlockProps {
  block: PlanetContent
  index: number
  totalBlocks: number
  ringRadius: number
  onBlockClick?: (block: PlanetContent) => void
  theme: PlanetTheme
}

// Particle System for Space Dust
function SpaceDust() {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 1000
  
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    // Random positions in a large sphere
    const radius = 50 + Math.random() * 100
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
    
    // Warm space colors
    const color = new THREE.Color()
    color.setHSL(0.1 + Math.random() * 0.1, 0.5, 0.3 + Math.random() * 0.4)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002
      pointsRef.current.rotation.x += 0.0001
    }
  })
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Enhanced 3D Planet Component with theme support
function Planet3D({ theme }: { theme: PlanetTheme }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  
  useEffect(() => {
    // Create planet texture using canvas with theme colors
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')!
      
      // Use theme colors for planet generation
      const primaryColor = theme.colors.primary
      const secondaryColor = theme.colors.secondary
      const accentColor = theme.colors.accent
      
      // Create gradient background using theme colors
      const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
      gradient.addColorStop(0, primaryColor)
      gradient.addColorStop(0.2, secondaryColor)
      gradient.addColorStop(0.4, accentColor)
      gradient.addColorStop(0.7, primaryColor)
      gradient.addColorStop(1, theme.colors.background)
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1024, 1024)
      
      // Add continents/landmasses with theme colors
      ctx.fillStyle = `${secondaryColor}66` // Add transparency
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const width = 100 + Math.random() * 200
        const height = 50 + Math.random() * 100
        
        ctx.beginPath()
        ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add surface details with accent color
      ctx.fillStyle = `${accentColor}4D` // Add transparency
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const radius = Math.random() * 40 + 15
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add darker spots using background color
      ctx.fillStyle = `${theme.colors.background}80`
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const radius = Math.random() * 30 + 10
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add bright spots using primary color
      ctx.fillStyle = `${primaryColor}CC`
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const radius = Math.random() * 5 + 2
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      return new THREE.CanvasTexture(canvas)
    }
    
    setTexture(createPlanetTexture())
  }, [theme])
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      // Subtle wobble
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05
    }
  })
  
  if (!texture) return null
  
  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.7}
          metalness={0.1}
          bumpMap={texture}
          bumpScale={0.1}
        />
      </mesh>
      <PlanetAtmosphere theme={theme} />
    </group>
  )
}

// Enhanced Atmospheric Glow Effect with theme support
function PlanetAtmosphere({ theme }: { theme: PlanetTheme }) {
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.002
      // Subtle pulsing effect
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.02
      atmosphereRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <mesh ref={atmosphereRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.3, 64, 64]} />
      <meshBasicMaterial
        color={theme.colors.primary}
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Enhanced Orbital Ring Component with theme support
function OrbitalRing({ radius, opacity = 0.1, speed = 0.001, theme }: { radius: number; opacity?: number; speed?: number; theme: PlanetTheme }) {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += speed
      // Subtle pulsing
      const pulseScale = 1 + Math.sin(state.clock.getElapsedTime() * 2 + radius) * 0.02
      ringRef.current.scale.setScalar(pulseScale)
    }
  })
  
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.03, radius + 0.03, 128]} />
      <meshBasicMaterial 
        color={theme.colors.accent} 
        transparent 
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Enhanced Content Block in 3D Space with theme support
function ContentBlock3D({ block, index, totalBlocks, ringRadius, onBlockClick, theme }: ContentBlockProps) {
  const meshRef = useRef<THREE.Group>(null)
  const orbRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  // Fixed positions: distribute evenly around the planet
  const angle = (index / totalBlocks) * Math.PI * 2
  const radius = 4 + (index % 2) * 1.5 // Alternate between radius 4 and 5.5
  const yOffset = (index % 3 - 1) * 0.8 // Three height levels: -0.8, 0, 0.8
  
  const fixedPosition = {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    y: yOffset
  }
  
  const speed = 0.0002 + (index % 3) * 0.0001 // Very slow rotation
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      const currentAngle = angle + time * speed
      
      // Fixed orbital position with very slow movement
      meshRef.current.position.x = Math.cos(currentAngle) * radius
      meshRef.current.position.z = Math.sin(currentAngle) * radius
      meshRef.current.position.y = yOffset + Math.sin(time * 0.2 + index) * 0.03 // Minimal floating
    }
    
    // Animate orb rotation (not position)
    if (orbRef.current) {
      orbRef.current.rotation.x += 0.008
      orbRef.current.rotation.y += 0.012
    }
    
    // Animate atmosphere (not position)
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.x -= 0.005
      atmosphereRef.current.rotation.y += 0.008
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 1.5 + index) * 0.02
      atmosphereRef.current.scale.setScalar(pulse)
    }
  })
  
  const getBlockColor = () => {
    switch (block.type) {
      case 'text': return theme.colors.primary
      case 'image': return theme.colors.secondary
      case 'link': return theme.colors.accent
      case 'audio': return theme.colors.primary
      default: return theme.colors.text
    }
  }
  
  const getSecondaryColor = () => {
    // Lighter version of block color
    const color = getBlockColor()
    return color + '80' // Add transparency
  }
  
  const getBlockIcon = () => {
    switch (block.type) {
      case 'text': return '📝'
      case 'image': return '🖼️'
      case 'link': return '🔗'
      case 'audio': return '🎵'
      default: return '⚙️'
    }
  }
  
  const handleClick = (e: any) => {
    e.stopPropagation() // Prevent event bubbling
    setExpanded(!expanded)
    
    if (onBlockClick) {
      onBlockClick(block)
    }
  }
  
  // Create planet-like texture
  const createMiniPlanetTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    
    const color = getBlockColor()
    const secondaryColor = getSecondaryColor()
    
    // Base gradient
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, secondaryColor)
    gradient.addColorStop(0.7, color)
    gradient.addColorStop(1, '#000000')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    
    // Add surface details
    ctx.fillStyle = `${color}80`
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 128
      const y = Math.random() * 128
      const radius = Math.random() * 15 + 5
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }
  
  const texture = createMiniPlanetTexture()
  
  // Calculate modal position relative to planet position
  const modalPosition: [number, number, number] = [
    fixedPosition.x > 0 ? fixedPosition.x + 1.5 : fixedPosition.x - 1.5, // Left or right of planet
    fixedPosition.y + 1, // Above the planet
    fixedPosition.z > 0 ? fixedPosition.z + 0.5 : fixedPosition.z - 0.5  // Forward or back
  ]
  
  return (
    <group 
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
      onClick={handleClick}
    >
      {/* Orbital ring indicator - only show on hover */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[0.35, 0.37, 32]} />
          <meshBasicMaterial 
            color={getBlockColor()}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Main mini planet - NO SCALE CHANGE ON HOVER */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial 
          map={texture}
          transparent
          opacity={0.95}
          roughness={0.6}
          metalness={0.2}
          emissive={getBlockColor()}
          emissiveIntensity={hovered ? 0.25 : 0.15} // Only change glow, not size
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh 
        ref={atmosphereRef}
        scale={1.3}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color={getSecondaryColor()}
          transparent
          opacity={hovered ? 0.25 : 0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Star-like core for certain types */}
      {(block.type === 'link' || block.type === 'audio') && (
        <mesh scale={0.3}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Particle effects for hover - smaller and more subtle */}
      {hovered && (
        <>
          {[...Array(4)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * Math.PI / 2) * 0.35,
                Math.sin(i * Math.PI / 2) * 0.35,
                0
              ]}
              scale={0.05}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial 
                color={getSecondaryColor()}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Compact content panel - ONLY for THIS specific block */}
      {expanded && (
        <Html
          transform
          occlude={false}
          position={modalPosition}
          style={{
            width: block.type === 'image' ? '200px' : '240px',
            pointerEvents: 'auto',
            zIndex: 1000
          }}
        >
          <div className={`
            bg-black/96 border-2 backdrop-blur-lg rounded-xl p-3 
            text-sm transition-all duration-300
            shadow-2xl transform-gpu
          `} style={{ 
            borderColor: getBlockColor(),
            boxShadow: `0 0 30px ${getBlockColor()}30`
          }}>
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(false)
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-full text-white text-xs transition-colors flex items-center justify-center"
            >
              ✕
            </button>
            
            {/* Content based on type - compact layouts */}
            {block.type === 'text' && (
              <div className="text-gray-300 text-xs leading-relaxed max-h-32 overflow-y-auto">
                {(block.content as any)?.text || 'No text content available'}
              </div>
            )}
            
            {block.type === 'image' && ((block.content as any)?.images?.length > 0) && (
              <div>
                <div className={`grid gap-1 ${((block.content as any).images.length === 1) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {((block.content as any).images || []).slice(0, 4).map((image: any, index: number) => (
                    <img 
                      key={index}
                      src={image.url} 
                      alt={image.alt || block.title || 'Planet content image'}
                      className="w-full h-16 object-cover rounded border"
                      style={{ borderColor: getBlockColor() }}
                    />
                  ))}
                </div>
                {((block.content as any)?.caption) && (
                  <p className="text-gray-400 text-xs mt-2 leading-tight">
                    {(block.content as any).caption}
                  </p>
                )}
              </div>
            )}

            {block.type === 'video' && (block.content as any)?.url && (
              <div>
                {(() => {
                  const videoId = extractYouTubeId((block.content as any).url)
                  return videoId ? (
                    <div className="w-full">
                      <iframe
                        width="100%"
                        height="120"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={block.title || 'YouTube video'}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded border"
                        style={{ borderColor: getBlockColor() }}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      Vídeo não disponível
                    </div>
                  )
                })()}
              </div>
            )}
            
            {block.type === 'link' && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-emerald-400 mr-2">🔗</span>
                  <div className="font-bold text-sm" style={{ color: getBlockColor() }}>
                    {(block.content as any)?.title || block.title}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open((block.content as any).url, '_blank')
                  }}
                  className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium transition-colors"
                >
                  🚀 Visit Link
                </button>
              </div>
            )}
            
            {block.type === 'audio' && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-lg">{getBlockIcon()}</span>
                  <div className="font-bold text-sm" style={{ color: getBlockColor() }}>
                    {(block.content as any)?.title || block.title}
                  </div>
                </div>
                {(block.content as any)?.url && (
                  <audio 
                    controls 
                    className="w-full h-8"
                    style={{ 
                      filter: `hue-rotate(${getBlockColor() === '#ec4899' ? '320deg' : '0deg'})`
                    }}
                  >
                    <source src={(block.content as any).url} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            )}

            {block.type === 'custom_widget' && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-lg">⚙️</span>
                  <div className="font-bold text-sm" style={{ color: getBlockColor() }}>
                    {block.title}
                  </div>
                </div>
                <div className="bg-black/20 rounded p-2 border" style={{ borderColor: getBlockColor() }}>
                  {(block.content as any)?.html && (
                    <div
                      dangerouslySetInnerHTML={{ __html: (block.content as any).html }}
                    />
                  )}
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
        </Html>
      )}
      
      {/* Quick preview tooltip on hover */}
      {hovered && !expanded && (
        <Html
          transform
          position={[0, 0.5, 0]}
          style={{
            pointerEvents: 'none'
          }}
        >
          <div className={`
            bg-black/95 border backdrop-blur-sm rounded-lg px-2 py-1 
            text-xs font-mono transition-all duration-200
            animate-in fade-in slide-in-from-bottom-2
          `} style={{ 
            borderColor: getBlockColor(),
            color: getBlockColor()
          }}>
            <div className="flex items-center space-x-1">
              <span>{getBlockIcon()}</span>
              <span className="capitalize text-xs">{block.type}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Main 3D Scene with theme support
function Scene3D({ planet, content, onBlockClick, theme }: { planet: Planet; content: PlanetContent[]; onBlockClick?: (block: PlanetContent) => void; theme: PlanetTheme }) {
  return (
    <>
      {/* Enhanced Lighting with theme colors */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2}
        color={theme.colors.primary}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color={theme.colors.secondary} />
      <pointLight position={[5, -5, 10]} intensity={0.2} color={theme.colors.accent} />
      
      {/* Background Elements */}
      <Stars radius={300} depth={50} count={2000} factor={4} saturation={0.5} fade />
      <SpaceDust />
      
      {/* Planet with theme */}
      <Planet3D theme={theme} />
      
      {/* Enhanced Orbital Rings with theme */}
      <OrbitalRing radius={4} opacity={0.2} speed={0.001} theme={theme} />
      <OrbitalRing radius={6} opacity={0.15} speed={0.0008} theme={theme} />
      <OrbitalRing radius={8} opacity={0.1} speed={0.0006} theme={theme} />
      <OrbitalRing radius={10} opacity={0.08} speed={0.0004} theme={theme} />
      
      {/* Content Blocks around the planet with theme */}
      {content.map((block, index) => (
        <ContentBlock3D
          key={block.id}
          block={block}
          index={index}
          totalBlocks={content.length}
          ringRadius={4}
          onBlockClick={onBlockClick}
          theme={theme}
        />
      ))}
      
      {/* Planet Name with theme color */}
      <Text
        position={[0, -3.8, 0]}
        fontSize={0.6}
        color={theme.colors.primary}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={theme.colors.background}
      >
        {planet.name}
      </Text>
      
      {/* Enhanced Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={6}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={0.3}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}

// Loading component
function LoadingScene() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-amber-600/20 border-b-amber-600 rounded-full animate-spin mx-auto mt-2" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-amber-400 font-serif text-lg mb-2">Carregando universo...</div>
        <div className="text-amber-600/60 font-mono text-sm">Inicializando reino quântico</div>
      </div>
    </div>
  )
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default function PlanetViewer({ planet, content, user, isOwner }: PlanetViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<PlanetContent | null>(null)
  const [showNotes, setShowNotes] = useState(false)

  // Parse theme and layout from planet data
  const theme: PlanetTheme = (planet.theme as unknown as PlanetTheme) || {
    colors: {
      primary: '#00ff00',
      secondary: '#ffff00', 
      background: '#000000',
      text: '#ffffff',
      accent: '#ff00ff'
    },
    fonts: {
      heading: 'inherit',
      body: 'inherit'
    },
    spacing: {
      small: '8px',
      medium: '16px', 
      large: '24px'
    },
    borderRadius: '8px',
    shadows: true
  }

  const layout: PlanetLayout = (planet.layout as unknown as PlanetLayout) || {
    type: 'grid',
    columns: 2,
    gap: '16px',
    maxWidth: '800px',
    padding: '16px'
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBlockClick = (block: PlanetContent) => {
    setSelectedBlock(block)
  }

  // Apply theme colors to the page
  const pageStyle = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-background': theme.colors.background,
    '--theme-text': theme.colors.text,
    '--theme-accent': theme.colors.accent,
    '--theme-border-radius': theme.borderRadius,
  } as React.CSSProperties

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      ...pageStyle
    }}>
      {/* Enhanced Background with theme colors */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-gradient-radial from-transparent to-black"
          style={{
            background: `radial-gradient(circle at center, ${theme.colors.primary}10, ${theme.colors.background})`
          }}
        ></div>
        <div 
          className="absolute inset-0 bg-gradient-to-br from-transparent to-black"
          style={{
            background: `linear-gradient(135deg, transparent, ${theme.colors.secondary}05, ${theme.colors.accent}10)`
          }}
        ></div>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-10">
        <Canvas
          camera={{ position: [0, 2, 12], fov: 65 }}
          gl={{ 
            antialias: true, 
            alpha: true
          }}
        >
          <Suspense fallback={null}>
            <Scene3D planet={planet} content={content} onBlockClick={handleBlockClick} theme={theme} />
          </Suspense>
        </Canvas>
      </div>

      {/* Enhanced UI Overlay with theme colors */}
      <div className="relative z-20 pointer-events-none">
        {/* Planet Info with theme styling */}
        <div className="fixed top-8 left-8">
          <div 
            className="backdrop-blur-md rounded-xl p-6 pointer-events-auto shadow-2xl border"
            style={{ 
              backgroundColor: `${theme.colors.background}E6`,
              borderColor: `${theme.colors.primary}66`,
              borderRadius: theme.borderRadius
            }}
          >
            <h1 
              className="text-3xl font-bold mb-3"
              style={{ 
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading
              }}
            >
              {planet.name}
            </h1>
            {planet.description && (
              <p 
                className="text-sm leading-relaxed max-w-sm italic mb-4"
                style={{ 
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body
                }}
              >
                {planet.description}
              </p>
            )}
            <div 
              className="flex items-center space-x-6 text-sm font-mono"
              style={{ color: `${theme.colors.text}CC` }}
            >
              <span className="flex items-center space-x-2">
                <span>👁</span>
                <span>{planet.view_count}</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>⌛</span>
                <span>{new Date(planet.created_at).toLocaleDateString()}</span>
              </span>
              {content.length > 0 && (
                <span className="flex items-center space-x-2">
                  <span>✦</span>
                  <span>{content.length} fragmentos</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Planet Notes Panel with theme styling */}
        <div className="fixed top-8 right-8">
          <div className="flex flex-col items-end space-y-4">
            {/* Notes Toggle Button */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="backdrop-blur-md rounded-lg px-4 py-2 pointer-events-auto shadow-xl border transition-colors"
              style={{
                backgroundColor: `${theme.colors.background}E6`,
                borderColor: `${theme.colors.secondary}66`,
                color: theme.colors.secondary,
                borderRadius: theme.borderRadius
              }}
            >
              <span className="font-bold text-sm">
                💭 NOTAS {showNotes ? '[OCULTAR]' : '[MOSTRAR]'}
              </span>
            </button>

            {/* Notes Component */}
            {showNotes && (
              <div className="pointer-events-auto">
                <PlanetNotes
                  planetId={planet.id}
                  planetSlug={planet.slug}
                  user={user}
                  isOwner={isOwner}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Instructions with theme styling */}
        <div className="fixed bottom-8 left-8">
          <div 
            className="backdrop-blur-md rounded-lg p-4 pointer-events-auto border"
            style={{
              backgroundColor: `${theme.colors.background}E6`,
              borderColor: `${theme.colors.primary}4D`,
              borderRadius: theme.borderRadius
            }}
          >
            <div 
              className="text-sm space-y-1"
              style={{ 
                color: `${theme.colors.text}E6`,
                fontFamily: theme.fonts.body
              }}
            >
              <div>🖱️ Arraste para rotacionar • 🔍 Role para zoom</div>
              <div>✨ Passe o mouse nos orbes para prévia • 🎯 Clique para expandir conteúdo</div>
              <div>💭 Alterne notas para ver pensamentos dos visitantes</div>
            </div>
          </div>
        </div>

        {/* Empty state with theme styling */}
        {content.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="text-center">
              <div 
                className="text-2xl italic mb-3"
                style={{ 
                  color: `${theme.colors.text}99`,
                  fontFamily: theme.fonts.heading
                }}
              >
                Este reino aguarda conteúdo...
              </div>
              <div 
                className="text-lg font-mono"
                style={{ color: `${theme.colors.text}80` }}
              >
                Nenhum fragmento orbita este mundo ainda
              </div>
              <div 
                className="mt-4 text-sm"
                style={{ color: `${theme.colors.text}66` }}
              >
                Adicione conteúdo para vê-lo ganhar vida no espaço 3D
              </div>
            </div>
          </div>
        )}

        {/* Footer with theme styling */}
        <div className="fixed bottom-8 right-8">
          <div 
            className="text-sm italic"
            style={{ 
              color: `${theme.colors.text}80`,
              fontFamily: theme.fonts.body
            }}
          >
            PLANETARIO
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!isLoaded && <LoadingScene />}
    </div>
  )
} 