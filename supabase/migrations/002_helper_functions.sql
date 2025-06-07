-- Drop and recreate view for planet statistics
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
  COUNT(DISTINCT pn.id) as note_count,
  prof.username as owner_username,
  prof.full_name as owner_name
FROM public.planets p
LEFT JOIN public.planet_content pc ON p.id = pc.planet_id AND pc.is_visible = true
LEFT JOIN public.planet_likes pl ON p.id = pl.planet_id
LEFT JOIN public.planet_notes pn ON p.id = pn.planet_id AND pn.is_public = true
LEFT JOIN public.profiles prof ON p.user_id = prof.id
GROUP BY p.id, prof.username, prof.full_name;

-- Create function to increment planet view count
CREATE OR REPLACE FUNCTION public.increment_planet_views(planet_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.planets 
  SET view_count = view_count + 1 
  WHERE slug = planet_slug AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular planets
CREATE OR REPLACE FUNCTION public.get_popular_planets(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  owner_username TEXT,
  owner_name TEXT,
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
    ps.owner_username,
    ps.owner_name,
    ps.created_at
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  ORDER BY (ps.view_count + ps.like_count * 2) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent planets
CREATE OR REPLACE FUNCTION public.get_recent_planets(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  owner_username TEXT,
  owner_name TEXT,
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
    ps.owner_username,
    ps.owner_name,
    ps.created_at
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  ORDER BY ps.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search planets
CREATE OR REPLACE FUNCTION public.search_planets(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  view_count INTEGER,
  like_count BIGINT,
  owner_username TEXT,
  owner_name TEXT,
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
    ps.owner_username,
    ps.owner_name,
    ps.created_at,
    ts_rank(
      to_tsvector('english', ps.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(ps.owner_username, '')),
      plainto_tsquery('english', search_term)
    ) as rank
  FROM public.planet_stats ps
  JOIN public.planets p ON ps.id = p.id
  WHERE ps.is_public = true
  AND (
    ps.name ILIKE '%' || search_term || '%' 
    OR p.description ILIKE '%' || search_term || '%'
    OR ps.owner_username ILIKE '%' || search_term || '%'
    OR to_tsvector('english', ps.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(ps.owner_username, '')) @@ plainto_tsquery('english', search_term)
  )
  ORDER BY rank DESC, ps.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's planets with stats
CREATE OR REPLACE FUNCTION public.get_user_planets(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  is_public BOOLEAN,
  view_count INTEGER,
  like_count BIGINT,
  content_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.is_public,
    p.view_count,
    ps.like_count,
    ps.content_count,
    p.created_at,
    p.updated_at
  FROM public.planets p
  JOIN public.planet_stats ps ON p.id = ps.id
  WHERE p.user_id = user_uuid
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to duplicate planet content (for templates)
CREATE OR REPLACE FUNCTION public.duplicate_planet_content(source_planet_id UUID, target_planet_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.planet_content (planet_id, type, title, content, position, is_visible)
  SELECT 
    target_planet_id,
    type,
    title,
    content,
    position,
    is_visible
  FROM public.planet_content
  WHERE planet_id = source_planet_id
  ORDER BY position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reorder planet content
CREATE OR REPLACE FUNCTION public.reorder_planet_content(content_ids UUID[], planet_uuid UUID)
RETURNS VOID AS $$
DECLARE
  content_id UUID;
  new_position INTEGER := 0;
BEGIN
  -- Verify all content belongs to the planet and user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.planets 
    WHERE id = planet_uuid AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Update positions
  FOREACH content_id IN ARRAY content_ids
  LOOP
    UPDATE public.planet_content 
    SET position = new_position 
    WHERE id = content_id AND planet_id = planet_uuid;
    new_position := new_position + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get planet analytics
CREATE OR REPLACE FUNCTION public.get_planet_analytics(planet_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_views BIGINT,
  unique_visitors BIGINT,
  total_likes BIGINT,
  views_by_day JSONB,
  top_referrers JSONB,
  visitor_countries JSONB
) AS $$
DECLARE
  planet_owner UUID;
BEGIN
  -- Check if user owns the planet
  SELECT user_id INTO planet_owner FROM public.planets WHERE id = planet_uuid;
  
  IF planet_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN QUERY
  WITH analytics_data AS (
    SELECT 
      COUNT(*) as total_views,
      COUNT(DISTINCT visitor_ip) as unique_visitors,
      (SELECT COUNT(*) FROM public.planet_likes WHERE planet_id = planet_uuid) as total_likes
    FROM public.planet_visits 
    WHERE planet_id = planet_uuid 
    AND visited_at >= NOW() - INTERVAL '1 day' * days_back
  ),
  daily_views AS (
    SELECT 
      jsonb_object_agg(
        date_trunc('day', visited_at)::date,
        count
      ) as views_by_day
    FROM (
      SELECT 
        date_trunc('day', visited_at) as day,
        COUNT(*) as count
      FROM public.planet_visits 
      WHERE planet_id = planet_uuid 
      AND visited_at >= NOW() - INTERVAL '1 day' * days_back
      GROUP BY date_trunc('day', visited_at)
      ORDER BY day
    ) daily_counts
  ),
  top_refs AS (
    SELECT 
      jsonb_object_agg(referrer, count) as top_referrers
    FROM (
      SELECT 
        COALESCE(referrer, 'Direct') as referrer,
        COUNT(*) as count
      FROM public.planet_visits 
      WHERE planet_id = planet_uuid 
      AND visited_at >= NOW() - INTERVAL '1 day' * days_back
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    ) ref_counts
  ),
  countries AS (
    SELECT 
      jsonb_object_agg(visitor_country, count) as visitor_countries
    FROM (
      SELECT 
        COALESCE(visitor_country, 'Unknown') as visitor_country,
        COUNT(*) as count
      FROM public.planet_visits 
      WHERE planet_id = planet_uuid 
      AND visited_at >= NOW() - INTERVAL '1 day' * days_back
      AND visitor_country IS NOT NULL
      GROUP BY visitor_country
      ORDER BY count DESC
      LIMIT 10
    ) country_counts
  )
  SELECT 
    ad.total_views,
    ad.unique_visitors,
    ad.total_likes,
    dv.views_by_day,
    tr.top_referrers,
    c.visitor_countries
  FROM analytics_data ad
  CROSS JOIN daily_views dv
  CROSS JOIN top_refs tr
  CROSS JOIN countries c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.planet_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_planet_views(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_planets(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_planets(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_planets(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_planets(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_planet_content(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_planet_content(UUID[], UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_planet_analytics(UUID, INTEGER) TO authenticated; 