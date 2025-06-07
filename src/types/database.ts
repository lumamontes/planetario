export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      planets: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          is_public: boolean
          theme: Json
          layout: Json
          custom_css: string | null
          favicon_url: string | null
          og_image_url: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          is_public?: boolean
          theme?: Json
          layout?: Json
          custom_css?: string | null
          favicon_url?: string | null
          og_image_url?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          is_public?: boolean
          theme?: Json
          layout?: Json
          custom_css?: string | null
          favicon_url?: string | null
          og_image_url?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      planet_content: {
        Row: {
          id: string
          planet_id: string
          type: string
          title: string | null
          content: Json
          position: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          planet_id: string
          type: string
          title?: string | null
          content: Json
          position?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          planet_id?: string
          type?: string
          title?: string | null
          content?: Json
          position?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      planet_notes: {
        Row: {
          id: string
          planet_id: string
          user_id: string
          content: string
          is_public: boolean
          position_x: number
          position_y: number
          position_z: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          planet_id: string
          user_id: string
          content: string
          is_public?: boolean
          position_x?: number
          position_y?: number
          position_z?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          planet_id?: string
          user_id?: string
          content?: string
          is_public?: boolean
          position_x?: number
          position_y?: number
          position_z?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      planet_visits: {
        Row: {
          id: string
          planet_id: string
          visitor_ip: string | null
          visitor_country: string | null
          visitor_city: string | null
          user_agent: string | null
          referrer: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          planet_id: string
          visitor_ip?: string | null
          visitor_country?: string | null
          visitor_city?: string | null
          user_agent?: string | null
          referrer?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          planet_id?: string
          visitor_ip?: string | null
          visitor_country?: string | null
          visitor_city?: string | null
          user_agent?: string | null
          referrer?: string | null
          visited_at?: string
        }
      }
      planet_likes: {
        Row: {
          id: string
          planet_id: string
          user_id: string | null
          visitor_ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          planet_id: string
          user_id?: string | null
          visitor_ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          planet_id?: string
          user_id?: string | null
          visitor_ip?: string | null
          created_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_filename: string
          file_type: string
          file_size: number
          storage_path: string
          public_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          original_filename: string
          file_type: string
          file_size: number
          storage_path: string
          public_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          original_filename?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          public_url?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          service: string
          service_user_id: string | null
          service_username: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          service_user_id?: string | null
          service_username?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          service_user_id?: string | null
          service_username?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      planet_stats: {
        Row: {
          id: string
          name: string
          slug: string
          user_id: string
          is_public: boolean
          view_count: number
          created_at: string
          content_count: number
          like_count: number
          note_count: number
        }
      }
    }
    Functions: {
      generate_planet_slug: {
        Args: {
          planet_name: string
          user_id: string
        }
        Returns: string
      }
      increment_planet_views: {
        Args: {
          planet_slug: string
        }
        Returns: void
      }
      get_popular_planets: {
        Args: {
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          view_count: number
          like_count: number
          created_at: string
        }[]
      }
      get_recent_planets: {
        Args: {
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          view_count: number
          like_count: number
          created_at: string
        }[]
      }
      search_planets: {
        Args: {
          search_term: string
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          view_count: number
          like_count: number
          created_at: string
          rank: number
        }[]
      }
      get_user_planets: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          is_public: boolean
          view_count: number
          like_count: number
          content_count: number
          created_at: string
          updated_at: string
        }[]
      }
      get_planet_notes: {
        Args: {
          planet_uuid: string
        }
        Returns: {
          id: string
          content: string
          is_public: boolean
          position_x: number
          position_y: number
          position_z: number
          color: string
          created_at: string
          updated_at: string
          user_id: string
          username: string | null
          avatar_url: string | null
        }[]
      }
      add_planet_note: {
        Args: {
          planet_uuid: string
          note_content: string
          note_is_public?: boolean
          note_position_x?: number
          note_position_y?: number
          note_position_z?: number
          note_color?: string
        }
        Returns: string
      }
      get_planet_note_count: {
        Args: {
          planet_uuid: string
        }
        Returns: number
      }
    }
  }
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Planet = Database['public']['Tables']['planets']['Row']
export type PlanetContent = Database['public']['Tables']['planet_content']['Row']
export type PlanetNote = Database['public']['Tables']['planet_notes']['Row']
export type PlanetVisit = Database['public']['Tables']['planet_visits']['Row']
export type PlanetLike = Database['public']['Tables']['planet_likes']['Row']
export type MediaFile = Database['public']['Tables']['media_files']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']

// Extended types for function returns
export type PlanetNoteWithUser = {
  id: string
  content: string
  is_public: boolean
  position_x: number
  position_y: number
  position_z: number
  color: string
  created_at: string
  updated_at: string
  user_id: string
  username: string | null
  avatar_url: string | null
}

// Content types for planet_content
export type ContentType = 
  | 'text'
  | 'image' 
  | 'audio'
  | 'video'
  | 'link'
  | 'spotify_track'
  | 'spotify_playlist'
  | 'spotify_album'
  | 'letterboxd_film'
  | 'letterboxd_list'
  | 'instagram_post'
  | 'twitter_tweet'
  | 'custom_widget'

// Content interfaces for type safety
export interface TextContent {
  text: string
  style?: {
    fontSize?: string
    color?: string
    fontWeight?: string
    textAlign?: string
  }
}

export interface ImageContent {
  url: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}

export interface AudioContent {
  url: string
  title?: string
  artist?: string
  duration?: number
}

export interface VideoContent {
  url: string
  title?: string
  thumbnail?: string
  duration?: number
}

export interface LinkContent {
  url: string
  title?: string
  description?: string
  target?: '_blank' | '_self'
}

export interface CustomWidgetContent {
  html: string
  css?: string
  js?: string
}

// Theme configuration
export interface PlanetTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    small: string
    medium: string
    large: string
  }
  borderRadius: string
  shadows: boolean
}

// Layout configuration
export interface PlanetLayout {
  type: 'grid' | 'masonry' | 'timeline' | 'custom'
  columns?: number
  gap?: string
  maxWidth?: string
  padding?: string
} 