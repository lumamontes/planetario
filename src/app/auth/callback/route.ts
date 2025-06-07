import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('Auth callback received:', { 
    code: !!code, 
    error, 
    errorDescription, 
    next,
    origin,
    fullUrl: request.url 
  })

  // If there's an error in the URL params, redirect to error page
  if (error) {
    console.error('Auth error from URL:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      console.log('Attempting to exchange code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.email)
        
        // Check if user has a profile, if not the trigger should create one
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError)
        }

        if (!profile) {
          console.log('No profile found, should be created by trigger')
          // Wait a moment for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log('Redirecting to:', `${origin}${next}`)
        
        // Create a response with proper headers
        const response = NextResponse.redirect(`${origin}${next}`)
        
        // Ensure cookies are properly set
        const { data: session } = await supabase.auth.getSession()
        if (session.session) {
          response.cookies.set('sb-access-token', session.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: session.session.expires_in
          })
          response.cookies.set('sb-refresh-token', session.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
        }
        
        return response
      } else {
        console.error('No user data returned after successful code exchange')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected&details=${encodeURIComponent(String(err))}`)
    }
  }

  // No code provided
  console.error('No auth code provided in callback')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
} 