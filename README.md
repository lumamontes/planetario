# Planetario

Planetario is a platform where users can create planets filled with their content - text, images, videos, links, and custom widgets. Each planet exists in a 3D space where visitors can explore and leave notes.

## Features

- **3D Planet Creation** - Build planets with procedural textures and themes
- **Rich Content Blocks** - Add text, images, YouTube videos, links, audio, and custom widgets
- **Drag & Drop Interface** - Content creation with multi-image support
- **Planet Notes** - Visitors can leave notes around your planet
- **Galaxy Discovery** - Explore public planets in a galaxy view
- **Customizable Themes** - Personalize colors, fonts, and visual effects
- **Real-time 3D Viewer** - Three.js-powered planet exploration

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/lumamontes/planetario.git
   cd planetario
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel



## License

MIT License - feel free to use this project for your own digital universe.

---