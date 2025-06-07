'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        setMessage('Criando conta...')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Sucesso! Verifique seu email para o link de confirmação.')
      } else {
        setMessage('Autenticando...')
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        setMessage('Acesso liberado! Redirecionando...')

        router.push('/dashboard')
     
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getMessageColor = () => {
    if (message.includes('Erro')) return 'text-red-400'
    if (message.includes('Sucesso') || message.includes('Acesso liberado')) return 'text-green-400'
    return 'text-yellow-400'
  }


  return (
    <div className="w-full max-w-md">
      {/* Card Header */}
      <div className="bg-black/90 border border-green-400 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            {mode === 'signin' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <p className="text-green-600 text-sm">
            {mode === 'signin' 
              ? 'Acesse seu universo digital' 
              : 'Junte-se à comunidade Planetario'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-400 mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded transition-colors"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-green-400 mb-2 text-sm font-medium">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded transition-colors"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 text-black py-3 px-4 font-bold hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400 rounded"
          >
            {loading 
              ? 'Processando...' 
              : mode === 'signup' 
                ? 'Criar Conta' 
                : 'Entrar'
            }
          </button>
        </form>

        {/* Status Messages */}
        {message && (
          <div className={`mt-4 text-sm ${getMessageColor()}`}>
            {message}
          </div>
        )}

        {/* Navigation */}
        {!loading && (
          <div className="mt-6 pt-4 border-t border-green-400 text-center">
            <button
              type="button"
              onClick={() => router.push(mode === 'signup' ? '/' : '/signup')}
              className="text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              {mode === 'signup' 
                ? 'Já tem conta? Entrar' 
                : 'Precisa de conta? Criar conta'
              }
            </button>
          </div>
        )}

      </div>
    </div>
  )
} 