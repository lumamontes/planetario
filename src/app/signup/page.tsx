import PlanetGalaxy from "@/components/PlanetGalaxy";
import AuthForm from "@/components/AuthForm";

export default function SignUp() {
  return (
    <main className="flex flex-row w-full h-screen">
      {/* Left side - Galaxy of planets */}
      <aside className="w-full hidden md:w-1/2 h-full relative">
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
          </div>
          {/* Auth Form */}
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
} 