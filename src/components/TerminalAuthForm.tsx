'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface TerminalAuthFormProps {
  mode: 'signin' | 'signup'
}

export default function TerminalAuthForm({ mode }: TerminalAuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [terminalText, setTerminalText] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Animation text - simplified and friendlier
  const steps = [
    '> Inicializando Planetario...',
    '> Carregando sistema de autenticação...',
    '> Pronto para começar',
    mode === 'signin' ? '> Entre com suas credenciais para acessar seu universo' : '> Crie uma nova conta para construir seu primeiro planeta'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < steps.length) {
        setTerminalText(steps[currentStep])
        setCurrentStep(prev => prev + 1)
      } else {
        clearInterval(timer)
      }
    }, 800)

    return () => clearInterval(timer)
  }, [currentStep, steps])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        setMessage('> Criando conta...')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('> Sucesso! Verifique seu email para o link de confirmação.')
      } else {
        setMessage('> Autenticando...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        setMessage('> Acesso liberado! Redirecionando para seu universo...')
        
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      setMessage(`> Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getMessageColor = () => {
    if (message.includes('ERRO')) return 'text-red-400'
    if (message.includes('SUCESSO') || message.includes('ACESSO LIBERADO')) return 'text-green-400'
    return 'text-yellow-400'
  }

  return (
    <div className="w-full max-w-md">
      {/* Window Header - keeping the cool dots */}
      <div className="bg-black border border-green-400 rounded-t-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="text-green-400 text-sm font-mono ml-4">
            PLANETARIO
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="bg-black border-l border-r border-green-400 p-6 font-mono text-sm">
        {/* Startup Animation */}
        <div className="mb-6 space-y-2">
          {steps.slice(0, currentStep).map((step, index) => (
            <div key={index} className="text-green-400">
              {step}
            </div>
          ))}
          {currentStep < steps.length && (
            <div className="text-green-400">
              {terminalText}
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>

        {/* Form */}
        {currentStep >= steps.length && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 font-mono rounded"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-green-400 mb-2">
                Senha:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 font-mono rounded"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-black py-3 px-4 font-bold hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400 font-mono rounded"
            >
              {loading 
                ? 'Processando...' 
                : mode === 'signup' 
                  ? 'Criar Conta' 
                  : 'Entrar'
              }
            </button>
          </form>
        )}

        {/* Status Messages */}
        {message && (
          <div className={`mt-4 ${getMessageColor()}`}>
            {message}
            {(message.includes('Autenticando') || message.includes('Criando')) && (
              <span className="animate-pulse">_</span>
            )}
          </div>
        )}

        {/* Navigation */}
        {currentStep >= steps.length && !loading && (
          <div className="mt-6 pt-4 border-t border-green-400">
            <button
              type="button"
              onClick={() => router.push(mode === 'signup' ? '/' : '/signup')}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {mode === 'signup' 
                ? 'Já tem conta? Entrar' 
                : 'Precisa de conta? Criar conta'
              }
            </button>
          </div>
        )}
      </div>

      {/* Window Footer */}
      <div className="bg-black border border-green-400 rounded-b-lg p-3">
        <div className="text-green-600 text-xs font-mono">
          Conexão segura • Criptografia ativa
        </div>
      </div>
    </div>
  )
} 