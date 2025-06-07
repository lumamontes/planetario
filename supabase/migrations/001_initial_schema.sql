-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planets table
CREATE TABLE public.planets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  theme JSONB DEFAULT '{}',
  layout JSONB DEFAULT '{}',
  custom_css TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planet_content table for different types of content blocks
CREATE TABLE public.planet_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  planet_id UUID REFERENCES public.planets(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'text', 'image', 'audio', 'video', 'link', 'spotify', 'letterboxd', etc.
  title TEXT,
  content JSONB NOT NULL, -- Flexible content storage
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planet_visits table for analytics
CREATE TABLE public.planet_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  planet_id UUID REFERENCES public.planets(id) ON DELETE CASCADE NOT NULL,
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_city TEXT,
  user_agent TEXT,
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planet_likes table
CREATE TABLE public.planet_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  planet_id UUID REFERENCES public.planets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_ip TEXT, -- For anonymous likes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(planet_id, user_id),
  UNIQUE(planet_id, visitor_ip)
);

-- Create media_files table for uploaded content
CREATE TABLE public.media_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integrations table for external service connections
CREATE TABLE public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL, -- 'spotify', 'letterboxd', 'instagram', 'twitter', etc.
  service_user_id TEXT,
  service_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Create indexes for better performance
CREATE INDEX idx_planets_user_id ON public.planets(user_id);
CREATE INDEX idx_planets_slug ON public.planets(slug);
CREATE INDEX idx_planets_is_public ON public.planets(is_public);
CREATE INDEX idx_planet_content_planet_id ON public.planet_content(planet_id);
CREATE INDEX idx_planet_content_type ON public.planet_content(type);
CREATE INDEX idx_planet_content_position ON public.planet_content(planet_id, position);
CREATE INDEX idx_planet_visits_planet_id ON public.planet_visits(planet_id);
CREATE INDEX idx_planet_visits_visited_at ON public.planet_visits(visited_at);
CREATE INDEX idx_planet_likes_planet_id ON public.planet_likes(planet_id);
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_service ON public.integrations(service);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Planets policies
CREATE POLICY "Public planets are viewable by everyone" ON public.planets
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own planets" ON public.planets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planets" ON public.planets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planets" ON public.planets
  FOR DELETE USING (auth.uid() = user_id);

-- Planet content policies
CREATE POLICY "Planet content is viewable based on planet visibility" ON public.planet_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_content.planet_id 
      AND (planets.is_public = true OR planets.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage content of their own planets" ON public.planet_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_content.planet_id 
      AND planets.user_id = auth.uid()
    )
  );

-- Planet visits policies (insert only for analytics)
CREATE POLICY "Anyone can insert planet visits" ON public.planet_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Planet owners can view their planet visits" ON public.planet_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_visits.planet_id 
      AND planets.user_id = auth.uid()
    )
  );

-- Planet likes policies
CREATE POLICY "Planet likes are viewable by everyone" ON public.planet_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can like planets" ON public.planet_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own likes" ON public.planet_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Media files policies
CREATE POLICY "Users can view their own media files" ON public.media_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media files" ON public.media_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media files" ON public.media_files
  FOR DELETE USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can manage their own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

-- Create functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_planets_updated_at
  BEFORE UPDATE ON public.planets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_planet_content_updated_at
  BEFORE UPDATE ON public.planet_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate unique planet slugs
CREATE OR REPLACE FUNCTION public.generate_planet_slug(planet_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from planet name
  base_slug := lower(regexp_replace(planet_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use user id
  IF base_slug = '' THEN
    base_slug := 'planet-' || substring(user_id::text from 1 for 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.planets WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql; 