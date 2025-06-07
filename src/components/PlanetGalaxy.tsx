'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Planet {
  id: string
  name: string
  slug: string
  description: string | null
  view_count: number
  like_count: number
  created_at: string
}

interface PlanetOrb {
  planet: Planet
  x: number
  y: number
  z: number
  size: number
  speed: number
  angle: number
  color: string
  glowIntensity: number
}

export default function PlanetGalaxy() {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [planetOrbs, setPlanetOrbs] = useState<PlanetOrb[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  const supabase = createClient()

  const planetColors = [
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#6366f1', // Indigo
  ]

  const loadPlanets = async () => {
    try {
      const { data, error } = await supabase.rpc('get_popular_planets', {
        limit_count: 20
      })

      if (error) throw error
      setPlanets(data || [])
    } catch (error) {
      console.error('Error loading planets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPlanetOrbs = (planetsData: Planet[]) => {
    const orbs: PlanetOrb[] = planetsData.map((planet, index) => {
      const angle = (index / planetsData.length) * Math.PI * 2
      const radius = 150 + Math.random() * 200
      const z = Math.random() * 100 - 50
      
      return {
        planet,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z,
        size: Math.max(8, Math.min(24, 12 + (planet.view_count + planet.like_count) / 10)),
        speed: 0.0005 + Math.random() * 0.001,
        angle,
        color: planetColors[index % planetColors.length],
        glowIntensity: 0.3 + Math.random() * 0.4
      }
    })
    setPlanetOrbs(orbs)
  }

  const animate = () => {
    setPlanetOrbs(prevOrbs => 
      prevOrbs.map(orb => ({
        ...orb,
        angle: orb.angle + orb.speed,
        x: Math.cos(orb.angle + orb.speed) * (150 + Math.sin(orb.angle * 0.5) * 50),
        y: Math.sin(orb.angle + orb.speed) * (150 + Math.cos(orb.angle * 0.3) * 30),
        z: orb.z + Math.sin(orb.angle * 2) * 2
      }))
    )
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    loadPlanets()
  }, [])

  useEffect(() => {
    if (planets.length > 0) {
      createPlanetOrbs(planets)
    }
  }, [planets])

  useEffect(() => {
    if (planetOrbs.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [planetOrbs.length])

  const getPlanetStyle = (orb: PlanetOrb) => {
    const scale = 1 + orb.z / 200
    const opacity = Math.max(0.3, 1 - Math.abs(orb.z) / 100)
    const isHovered = hoveredPlanet === orb.planet.id
    
    return {
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) translate(${orb.x}px, ${orb.y}px) scale(${scale})`,
      width: `${orb.size}px`,
      height: `${orb.size}px`,
      backgroundColor: orb.color,
      borderRadius: '50%',
      opacity: isHovered ? 1 : opacity,
      boxShadow: `0 0 ${isHovered ? 30 : 15}px ${orb.color}${Math.floor(orb.glowIntensity * 255).toString(16)}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: Math.floor(orb.z + 50),
      border: isHovered ? `2px solid ${orb.color}` : 'none',
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400/20 border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-green-400 font-mono text-lg">
            Escaneando galáxia...
          </div>
          <div className="text-green-600 font-mono text-sm mt-2">
            Descobrindo planetas no universo
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-black relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0f1a 0%, #000000 80%)'
      }}
    >
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 1 + 0.5}px`,
              height: `${Math.random() * 1 + 0.5}px`,
              opacity: Math.random() * 0.4 + 0.1
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-24 h-24 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, transparent 60%)',
            filter: 'blur(15px)'
          }}
        />
      </div>

      {planetOrbs.map((orb) => (
        <Link
          key={orb.planet.id}
          href={`/planet/${orb.planet.slug}`}
          className="block"
        >
          <div
            style={getPlanetStyle(orb)}
            onMouseEnter={() => setHoveredPlanet(orb.planet.id)}
            onMouseLeave={() => setHoveredPlanet(null)}
          />
        </Link>
      ))}

      {hoveredPlanet && (
        <div className="fixed top-4 left-4 bg-black/95 border border-green-400 backdrop-blur-md rounded-lg p-4 max-w-sm z-50">
          {(() => {
            const planet = planets.find(p => p.id === hoveredPlanet)
            if (!planet) return null
            
            return (
              <div>
                <h3 className="text-green-400 font-bold text-lg mb-2">
                  {planet.name}
                </h3>
                {planet.description && (
                  <p className="text-green-300 text-sm mb-3 leading-relaxed">
                    {planet.description}
                  </p>
                )}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-green-600">
                    <span>Visualizações:</span>
                    <span>{planet.view_count}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Curtidas:</span>
                    <span>{planet.like_count}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Criado:</span>
                    <span>{formatDate(planet.created_at)}</span>
                  </div>
                </div>
                <div className="mt-3 text-green-400 text-xs font-mono">
                  Clique para explorar este planeta
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black/80 border border-green-400/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-green-400 font-mono text-sm">
          Galáxia Planetario
        </div>
        <div className="text-green-600 font-mono text-xs mt-1">
          {planets.length} planetas descobertos
        </div>
        <div className="text-green-600 font-mono text-xs">
          Passe o mouse para explorar • Clique para visitar
        </div>
      </div>

      {planets.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-600 text-xl font-mono mb-2">
              Galáxia vazia
            </div>
            <div className="text-green-700 text-sm font-mono">
              Nenhum planeta foi descoberto ainda
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 