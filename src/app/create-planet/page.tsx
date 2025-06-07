import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreatePlanetClient from './CreatePlanetClient'

export default async function CreatePlanet() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  return <CreatePlanetClient user={user} />
} 