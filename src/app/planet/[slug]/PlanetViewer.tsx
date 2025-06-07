'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Text, Html, Stars, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Planet, PlanetContent } from '@/types/database'
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

// Atmospheric Glow Effect
function PlanetAtmosphere() {
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
        color="#f59e0b"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Enhanced 3D Planet Component
function Planet3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  
  useEffect(() => {
    // Create planet texture using canvas
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')!
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
      gradient.addColorStop(0, '#fbbf24')
      gradient.addColorStop(0.2, '#f59e0b')
      gradient.addColorStop(0.4, '#d97706')
      gradient.addColorStop(0.7, '#92400e')
      gradient.addColorStop(1, '#451a03')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1024, 1024)
      
      // Add continents/landmasses
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)'
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const width = 100 + Math.random() * 200
        const height = 50 + Math.random() * 100
        
        ctx.beginPath()
        ctx.ellipse(x, y, width, height, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add surface details
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const radius = Math.random() * 40 + 15
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add darker spots (craters/seas)
      ctx.fillStyle = 'rgba(69, 26, 3, 0.5)'
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1024
        const y = Math.random() * 1024
        const radius = Math.random() * 30 + 10
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Add bright spots (cities/energy sources)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'
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
  }, [])
  
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
      <PlanetAtmosphere />
    </group>
  )
}

// Enhanced Orbital Ring Component
function OrbitalRing({ radius, opacity = 0.1, speed = 0.001 }: { radius: number; opacity?: number; speed?: number }) {
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
        color="#f59e0b" 
        transparent 
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Enhanced Content Block in 3D Space - Now as mini planets/stars
function ContentBlock3D({ block, index, totalBlocks, ringRadius, onBlockClick }: ContentBlockProps) {
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
      case 'text': return '#10b981'      // Emerald
      case 'image': return '#3b82f6'     // Blue
      case 'link': return '#8b5cf6'      // Purple
      case 'audio': return '#ec4899'     // Pink
      default: return '#6b7280'          // Gray
    }
  }
  
  const getSecondaryColor = () => {
    switch (block.type) {
      case 'text': return '#34d399'      // Lighter emerald
      case 'image': return '#60a5fa'     // Lighter blue
      case 'link': return '#a78bfa'      // Lighter purple
      case 'audio': return '#f472b6'     // Lighter pink
      default: return '#9ca3af'          // Lighter gray
    }
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
            
            {block.type === 'image' && (block.content as any)?.url && (
              <div>
                <img 
                  src={(block.content as any).url} 
                  alt={block.title || 'Planet content image'}
                  className="w-full h-24 object-cover rounded-lg border"
                  style={{ borderColor: getBlockColor() }}
                />
                {(block.content as any)?.description && (
                  <p className="text-gray-400 text-xs mt-2 leading-tight">
                    {(block.content as any).description}
                  </p>
                )}
              </div>
            )}
            
            {block.type === 'link' && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-lg">{getBlockIcon()}</span>
                  <div className="font-bold text-sm" style={{ color: getBlockColor() }}>
                    {block.title}
                  </div>
                </div>
                {(block.content as any)?.description && (
                  <p className="text-gray-300 text-xs mb-3 leading-tight">
                    {(block.content as any).description}
                  </p>
                )}
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
                    {block.title}
                  </div>
                </div>
                <div className="flex gap-2 mb-3 text-xs">
                  {(block.content as any)?.artist && (
                    <div className="bg-gray-900/40 rounded px-2 py-1">
                      <span className="text-gray-500">by</span> {(block.content as any).artist}
                    </div>
                  )}
                  {(block.content as any)?.duration && (
                    <div className="bg-gray-900/40 rounded px-2 py-1">
                      {(block.content as any).duration}s
                    </div>
                  )}
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

// Main 3D Scene
function Scene3D({ planet, content, onBlockClick }: { planet: Planet; content: PlanetContent[]; onBlockClick?: (block: PlanetContent) => void }) {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#f59e0b" />
      <pointLight position={[5, -5, 10]} intensity={0.2} color="#3b82f6" />
      
      {/* Background Elements */}
      <Stars radius={300} depth={50} count={2000} factor={4} saturation={0.5} fade />
      <SpaceDust />
      
      {/* Planet */}
      <Planet3D />
      
      {/* Enhanced Orbital Rings */}
      <OrbitalRing radius={4} opacity={0.2} speed={0.001} />
      <OrbitalRing radius={6} opacity={0.15} speed={0.0008} />
      <OrbitalRing radius={8} opacity={0.1} speed={0.0006} />
      <OrbitalRing radius={10} opacity={0.08} speed={0.0004} />
      
      {/* Content Blocks around the planet */}
      {content.map((block, index) => (
        <ContentBlock3D
          key={block.id}
          block={block}
          index={index}
          totalBlocks={content.length}
          ringRadius={4} // Not used anymore, but keeping for compatibility
          onBlockClick={onBlockClick}
        />
      ))}
      
      {/* Planet Name with Glow */}
      <Text
        position={[0, -3.8, 0]}
        fontSize={0.6}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
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

export default function PlanetViewer({ planet, content, user, isOwner }: PlanetViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<PlanetContent | null>(null)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBlockClick = (block: PlanetContent) => {
    setSelectedBlock(block)
    // Add any additional interaction logic here
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/10 via-black to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/5 to-purple-900/10"></div>
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
            <Scene3D planet={planet} content={content} onBlockClick={handleBlockClick} />
          </Suspense>
        </Canvas>
      </div>

      {/* Enhanced UI Overlay */}
      <div className="relative z-20 pointer-events-none">
        {/* Planet Info */}
        <div className="fixed top-8 left-8">
          <div className="bg-black/90 border border-amber-400/40 backdrop-blur-md rounded-xl p-6 pointer-events-auto shadow-2xl">
            <h1 className="text-3xl font-bold text-amber-400 mb-3 font-serif">
              {planet.name}
            </h1>
            {planet.description && (
              <p className="text-amber-200/90 text-sm leading-relaxed max-w-sm font-serif italic mb-4">
                {planet.description}
              </p>
            )}
            <div className="flex items-center space-x-6 text-amber-600/80 text-sm font-mono">
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

        {/* Planet Notes Panel */}
        <div className="fixed top-8 right-8">
          <div className="flex flex-col items-end space-y-4">
            {/* Notes Toggle Button */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="bg-black/90 border border-green-400/40 backdrop-blur-md rounded-lg px-4 py-2 pointer-events-auto shadow-xl hover:border-green-400 transition-colors"
            >
              <span className="text-green-400 font-bold text-sm">
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

        {/* Enhanced Instructions */}
        <div className="fixed bottom-8 left-8">
          <div className="bg-black/90 border border-amber-400/30 backdrop-blur-md rounded-lg p-4 pointer-events-auto">
            <div className="text-amber-400/90 text-sm font-serif space-y-1">
              <div>🖱️ Arraste para rotacionar • 🔍 Role para zoom</div>
              <div>✨ Passe o mouse nos orbes para prévia • 🎯 Clique para expandir conteúdo</div>
              <div>💭 Alterne notas para ver pensamentos dos visitantes</div>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        {content.length > 0 && (
          <div className="fixed bottom-8 right-8">
            <div className="bg-black/90 border border-amber-400/30 backdrop-blur-md rounded-lg p-4 pointer-events-auto">
              <div className="text-amber-400 font-serif text-sm mb-2">Distribuição de Conteúdo</div>
              <div className="space-y-1 text-xs font-mono">
                {['text', 'image', 'link', 'audio'].map(type => {
                  const count = content.filter(c => c.type === type).length
                  if (count === 0) return null
                  
                  const typeNames = {
                    text: 'Texto',
                    image: 'Imagem', 
                    link: 'Link',
                    audio: 'Áudio'
                  }
                  
                  return (
                    <div key={type} className="flex justify-between text-amber-600/80">
                      <span>{typeNames[type as keyof typeof typeNames]}:</span>
                      <span>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {content.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-amber-600/60 text-2xl font-serif italic mb-3">
                Este reino aguarda conteúdo...
              </div>
              <div className="text-amber-700/50 text-lg font-mono">
                Nenhum fragmento orbita este mundo ainda
              </div>
              <div className="mt-4 text-amber-800/40 text-sm">
                Adicione conteúdo para vê-lo ganhar vida no espaço 3D
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="fixed bottom-8 right-8">
          <div className="text-amber-600/50 text-sm font-serif italic">
            PLANETARIO
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!isLoaded && <LoadingScene />}
    </div>
  )
} 