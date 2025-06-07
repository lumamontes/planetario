-- Create planet_notes table for user notes/comments on planets
CREATE TABLE public.planet_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  planet_id UUID REFERENCES public.planets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true, -- Whether the note is visible to others
  position_x REAL DEFAULT 0, -- X position for spatial notes (optional)
  position_y REAL DEFAULT 0, -- Y position for spatial notes (optional)
  position_z REAL DEFAULT 0, -- Z position for spatial notes (optional)
  color TEXT DEFAULT '#f59e0b', -- Note color/theme
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add unique constraint to prevent duplicate notes from same user on same planet
-- Uncomment the line below if you want to limit users to one note per planet
-- ALTER TABLE public.planet_notes ADD CONSTRAINT unique_user_planet_note UNIQUE(planet_id, user_id);

-- Create indexes for better performance
CREATE INDEX idx_planet_notes_planet_id ON public.planet_notes(planet_id);
CREATE INDEX idx_planet_notes_user_id ON public.planet_notes(user_id);
CREATE INDEX idx_planet_notes_is_public ON public.planet_notes(is_public);
CREATE INDEX idx_planet_notes_created_at ON public.planet_notes(created_at);

-- Enable Row Level Security
ALTER TABLE public.planet_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for planet_notes

-- Anyone can view public notes on public planets
CREATE POLICY "Public notes on public planets are viewable by everyone" ON public.planet_notes
  FOR SELECT USING (
    is_public = true 
    AND EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_notes.planet_id 
      AND planets.is_public = true
    )
  );

-- Users can view their own notes regardless of visibility
CREATE POLICY "Users can view their own notes" ON public.planet_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Planet owners can view all notes on their planets
CREATE POLICY "Planet owners can view all notes on their planets" ON public.planet_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_notes.planet_id 
      AND planets.user_id = auth.uid()
    )
  );

-- Authenticated users can add notes to public planets (but not their own)
CREATE POLICY "Users can add notes to public planets" ON public.planet_notes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_notes.planet_id 
      AND planets.is_public = true
      AND planets.user_id != auth.uid() -- Prevent self-notes
    )
    AND auth.uid() = user_id
  );

-- Users can update their own notes
CREATE POLICY "Users can update their own notes" ON public.planet_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" ON public.planet_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Planet owners can delete notes on their planets
CREATE POLICY "Planet owners can delete notes on their planets" ON public.planet_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_notes.planet_id 
      AND planets.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER handle_planet_notes_updated_at
  BEFORE UPDATE ON public.planet_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get notes for a planet with user info
CREATE OR REPLACE FUNCTION public.get_planet_notes(planet_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  is_public BOOLEAN,
  position_x REAL,
  position_y REAL,
  position_z REAL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  username TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pn.id,
    pn.content,
    pn.is_public,
    pn.position_x,
    pn.position_y,
    pn.position_z,
    pn.color,
    pn.created_at,
    pn.updated_at,
    pn.user_id,
    COALESCE(p.username, 'Anonymous') as username,
    p.avatar_url
  FROM public.planet_notes pn
  LEFT JOIN public.profiles p ON pn.user_id = p.id
  WHERE pn.planet_id = planet_uuid
  AND (
    pn.is_public = true 
    OR pn.user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.planets 
      WHERE planets.id = planet_uuid 
      AND planets.user_id = auth.uid()
    )
  )
  ORDER BY pn.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add a note to a planet
CREATE OR REPLACE FUNCTION public.add_planet_note(
  planet_uuid UUID,
  note_content TEXT,
  note_is_public BOOLEAN DEFAULT true,
  note_position_x REAL DEFAULT 0,
  note_position_y REAL DEFAULT 0,
  note_position_z REAL DEFAULT 0,
  note_color TEXT DEFAULT '#f59e0b'
)
RETURNS UUID AS $$
DECLARE
  new_note_id UUID;
  planet_owner UUID;
BEGIN
  -- Check if planet exists and is public
  SELECT user_id INTO planet_owner 
  FROM public.planets 
  WHERE id = planet_uuid AND is_public = true;
  
  IF planet_owner IS NULL THEN
    RAISE EXCEPTION 'Planet not found or not public';
  END IF;
  
  -- Prevent users from adding notes to their own planets
  IF planet_owner = auth.uid() THEN
    RAISE EXCEPTION 'Cannot add notes to your own planet';
  END IF;
  
  -- Insert the note
  INSERT INTO public.planet_notes (
    planet_id, 
    user_id, 
    content, 
    is_public, 
    position_x, 
    position_y, 
    position_z, 
    color
  )
  VALUES (
    planet_uuid, 
    auth.uid(), 
    note_content, 
    note_is_public, 
    note_position_x, 
    note_position_y, 
    note_position_z, 
    note_color
  )
  RETURNING id INTO new_note_id;
  
  RETURN new_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get note count for planets
CREATE OR REPLACE FUNCTION public.get_planet_note_count(planet_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.planet_notes 
    WHERE planet_id = planet_uuid 
    AND is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update planet_stats view to include note count
DROP VIEW IF EXISTS public.planet_stats;

CREATE OR REPLACE VIEW public.planet_stats AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.user_id,
  p.is_public,
  p.view_count,
  p.created_at,
  COUNT(DISTINCT pc.id) as content_count,
  COUNT(DISTINCT pl.id) as like_count,
  COUNT(DISTINCT pn.id) as note_count
FROM public.planets p
LEFT JOIN public.planet_content pc ON p.id = pc.planet_id AND pc.is_visible = true
LEFT JOIN public.planet_likes pl ON p.id = pl.planet_id
LEFT JOIN public.planet_notes pn ON p.id = pn.planet_id AND pn.is_public = true
GROUP BY p.id;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planet_notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_planet_notes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_planet_note(UUID, TEXT, BOOLEAN, REAL, REAL, REAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_planet_note_count(UUID) TO anon, authenticated; 