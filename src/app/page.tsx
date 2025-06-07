import PlanetGalaxy from "@/components/PlanetGalaxy";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row w-full h-screen">
      {/* Left side - Galaxy of planets */}
      <aside className="w-full hidden md:block md:w-1/2 h-full relative">
        <PlanetGalaxy />
      </aside>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 h-full bg-black flex flex-col justify-center items-center p-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              #10b981 2px,
              #10b981 4px
            )`
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="text-green-400 font-bold text-4xl mb-2">
              PLANETARIO
            </div>
            <div className="text-green-600 text-sm mb-4">
              BETA
            </div>
            <div className="border border-green-400 p-4 bg-black/50 rounded">
              <div className="text-green-300 text-sm leading-relaxed">
                 tururu
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <AuthForm mode="signin" />
          
          {/* Footer info */}
          <div className="mt-8 text-center">
            <div className="text-green-600 text-xs">
              Explore a galáxia • Crie seu planeta • Compartilhe seu universo
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
