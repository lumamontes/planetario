'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const validateUsername = (username: string) => {
    // Username validation: only lowercase letters, numbers, and underscores
    const usernameRegex = /^[a-z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return 'Nome de usuário deve conter apenas letras minúsculas, números e _'
    }
    if (username.length < 3) {
      return 'Nome de usuário deve ter pelo menos 3 caracteres'
    }
    if (username.length > 30) {
      return 'Nome de usuário deve ter no máximo 30 caracteres'
    }
    return null
  }

  // Check username availability with debouncing
  useEffect(() => {
    if (mode !== 'signup' || !username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const validationError = validateUsername(username)
    if (validationError) {
      setUsernameAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (error && error.code === 'PGRST116') {
          // No rows returned, username is available
          setUsernameAvailable(true)
        } else if (data) {
          // Username is taken
          setUsernameAvailable(false)
        }
      } catch (err) {
        console.error('Error checking username availability:', err)
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [username, mode, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        // Validate username for signup
        const usernameError = validateUsername(username)
        if (usernameError) {
          setMessage(`Erro: ${usernameError}`)
          setLoading(false)
          return
        }

        // Check if username is available
        if (usernameAvailable === false) {
          setMessage('Erro: Nome de usuário já está em uso')
          setLoading(false)
          return
        }

        setMessage('Criando conta...')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username.toLowerCase().trim()
            }
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

  const getUsernameStatusColor = () => {
    if (checkingUsername) return 'text-yellow-400'
    if (usernameAvailable === true) return 'text-green-400'
    if (usernameAvailable === false) return 'text-red-400'
    return 'text-green-600'
  }

  const getUsernameStatusText = () => {
    if (checkingUsername) return 'Verificando disponibilidade...'
    if (usernameAvailable === true) return '✓ Nome de usuário disponível'
    if (usernameAvailable === false) return '✗ Nome de usuário já está em uso'
    return `${username.length}/30 caracteres • Apenas letras minúsculas, números e _`
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
          {mode === 'signup' && (
            <div>
              <label className="block text-green-400 mb-2 text-sm font-medium">
                Nome de usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-green-300 rounded transition-colors"
                placeholder="meuusername"
                disabled={loading}
                maxLength={30}
              />
              <div className={`text-xs mt-1 ${getUsernameStatusColor()}`}>
                {getUsernameStatusText()}
              </div>
            </div>
          )}

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
              minLength={6}
            />
            {mode === 'signup' && (
              <div className="text-xs text-green-600 mt-1">
                Mínimo de 6 caracteres
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && (usernameAvailable === false || checkingUsername))}
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