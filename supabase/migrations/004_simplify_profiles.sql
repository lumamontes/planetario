-- Simplify profiles table by removing unnecessary fields
-- Keep only essential fields: id, avatar_url, created_at, updated_at

-- Remove columns we no longer need
ALTER TABLE public.profiles DROP COLUMN IF EXISTS username;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS website;

-- Update the handle_new_user function to only set avatar_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update any existing views or functions that reference the removed columns
-- Update planet_stats view to remove profile references
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
  COUNT(DISTINCT pl.id) as like_count
FROM public.planets p
LEFT JOIN public.planet_content pc ON p.id = pc.planet_id AND pc.is_visible = true
LEFT JOIN public.planet_likes pl ON p.id = pl.planet_id
GROUP BY p.id;

-- Update functions that returned profile data
CREATE OR REPLACE FUNCTION public.get_popular_planets(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.slug,
    p.description,
    ps.view_count,
    ps.like_count,
    ps.created_at
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  ORDER BY (ps.view_count + ps.like_count * 2) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_recent_planets(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.slug,
    p.description,
    ps.view_count,
    ps.like_count,
    ps.created_at
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  ORDER BY ps.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.search_planets(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.slug,
    p.description,
    ps.view_count,
    ps.like_count,
    ps.created_at,
    ts_rank(
      to_tsvector('english', ps.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_term)
    ) as rank
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  AND (
    ps.name ILIKE '%' || search_term || '%' 
    OR p.description ILIKE '%' || search_term || '%'
    OR to_tsvector('english', ps.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term)
  )
  ORDER BY rank DESC, ps.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 