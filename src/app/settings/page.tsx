import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // Fetch user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists, create one
  if (profileError && profileError.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Terminal Header */}
        <div className="border border-green-400 mb-6">
          <div className="bg-green-400 text-black px-4 py-2 flex justify-between items-center">
            <span className="font-bold">PLANETARIO USER SETTINGS v1.0</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="p-4 border-b border-green-400">
            <p>&gt; USER: {user.email}</p>
            <p>&gt; ID: {user.id.substring(0, 8)}...</p>
            <p>&gt; STATUS: CONFIGURATION MODE</p>
          </div>
        </div>

        <SettingsForm user={user} profile={profile} />
      </div>
    </div>
  )
} 