
<div align="center">

| Planet | Login | Dashboard |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/c19824ab-1d21-48ff-897a-1748016ddc76" width="250"/>| <img src="https://github.com/user-attachments/assets/8a35ce53-9a75-40fa-995b-cf0a12a5cc53" width="250"/> | <img src="https://github.com/user-attachments/assets/ff7d4174-2da4-4d59-ad20-c039ca76e683" width="250"/> |

| Config | Details | Profile |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/b8e1fc06-1b4a-4e64-9fce-b56cb7f6dec1" width="250"/> | <img src="https://github.com/user-attachments/assets/3ce077db-8520-491c-a2c1-6d89dc24863d" width="250"/> | <img src="https://github.com/user-attachments/assets/878a1462-0a49-439a-a994-d276d9ae53b4" width="250"/> |

| Mobile View |
|:---:|
|<img src="https://github.com/user-attachments/assets/b83bbdcf-78f5-4535-9347-954657c02d28" width="250"/>   |

</div>


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
