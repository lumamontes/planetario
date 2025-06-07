import PlanetGalaxy from "@/components/PlanetGalaxy";
import TerminalAuthForm from "@/components/TerminalAuthForm";

export default function SignUp() {
  return (
    <main className="flex flex-row w-full h-screen">
      {/* Left side - Galaxy of planets */}
      <aside className="w-1/2 h-full relative">
        <PlanetGalaxy />
      </aside>
      
      {/* Right side - Terminal auth form */}
      <div className="w-1/2 h-full bg-black flex flex-col justify-center items-center p-8 relative">
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
            <div className="text-green-400 font-mono text-4xl font-bold mb-2">
              PLANETARIO
            </div>
            <div className="text-green-600 font-mono text-sm mb-4">
              Plataforma de criação de universos digitais
            </div>
            <div className="border border-green-400 p-4 bg-black/50 rounded">
              <div className="text-green-300 text-sm leading-relaxed">
                Junte-se à galáxia de criadores digitais. Cada planeta à esquerda representa um universo único. 
                <span className="text-green-400 font-bold"> Crie sua conta para construir seu primeiro planeta</span> e compartilhe com o universo.
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <TerminalAuthForm mode="signup" />
          
          {/* Footer info */}
          <div className="mt-8 text-center">
            <div className="text-green-600 font-mono text-xs">
              Construa • Compartilhe • Explore • Conecte
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 