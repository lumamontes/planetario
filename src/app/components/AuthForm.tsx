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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        console.log('Attempting to sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        
        console.log('Sign in successful:', data)
        setMessage('Login successful! Redirecting...')
        
        // The middleware will handle the session and redirect properly
        // Just refresh the page to trigger the middleware
        setTimeout(() => {
          console.log('Refreshing page to sync auth state...')
          window.location.reload()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-400 text-white py-2 px-4 rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
      
      {message && (
        <div className={`text-sm text-center ${message.includes('Check your email') || message.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </div>
      )}
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push(mode === 'signup' ? '/' : '/signup')}
          className="text-pink-400 hover:text-pink-300 text-sm"
        >
          {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  )
} 