import { BarChart3, Sparkles, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminPolls() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('coming-soon-card')?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    if (isHovering) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create particle effect
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    
    setParticles([...particles, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1000);
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg min-h-[600px] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div
          id="coming-soon-card"
          className="relative bg-gradient-to-br from-[#0f172a] via-[#1a2f55] to-[#102a4e] p-12 rounded-2xl border-2 border-[#3e5a8a] overflow-hidden group cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleClick}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#5ea4ff]/10 via-[#9cc9ff]/10 to-[#b3d9ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Mouse follow spotlight */}
          {isHovering && (
            <div
              className="absolute w-64 h-64 rounded-full bg-[#5ea4ff]/20 blur-3xl pointer-events-none transition-all duration-300"
              style={{
                left: mousePosition.x - 128,
                top: mousePosition.y - 128,
              }}
            />
          )}

          {/* Click particles */}
          {particles.map((particle, index) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-[#9cc9ff] rounded-full pointer-events-none animate-particle"
              style={{
                left: particle.x,
                top: particle.y,
                transform: `rotate(${index * 45}deg) translateY(-100px)`,
                opacity: 0,
                animation: `particle-burst 1s ease-out forwards`,
                animationDelay: `${index * 0.05}s`,
              }}
            />
          ))}

          {/* Floating icons */}
          <div className="absolute top-8 right-8 animate-float">
            <Sparkles className="text-[#b3d9ff] opacity-60" size={32} />
          </div>
          <div className="absolute bottom-8 left-8 animate-float-delayed">
            <Zap className="text-[#9cc9ff] opacity-60" size={28} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Animated icon */}
            <div className="mb-6 p-6 bg-[#2563eb]/20 rounded-full border-2 border-[#5ea4ff]/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <BarChart3 className="text-[#9cc9ff] animate-pulse-slow" size={64} />
            </div>

            {/* Title with gradient */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#9cc9ff] via-[#5ea4ff] to-[#b3d9ff] bg-clip-text text-transparent animate-gradient">
              Poll Management
            </h2>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#5ea4ff] px-6 py-3 rounded-full mb-6 group-hover:shadow-lg group-hover:shadow-[#5ea4ff]/50 transition-all duration-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3d9ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9cc9ff]"></span>
              </span>
              <span className="text-white font-bold text-lg">Coming Soon</span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg max-w-md mb-8 leading-relaxed">
              We're building an amazing polling system where you can create, manage, and analyze community polls with advanced analytics.
            </p>

            {/* Animated dots */}
            <div className="flex gap-2 items-center mt-8">
              <div className="w-2 h-2 bg-[#9cc9ff] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#5ea4ff] rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-[#b3d9ff] rounded-full animate-bounce delay-200"></div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#5ea4ff]/30 rounded-tl-2xl group-hover:border-[#5ea4ff]/60 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#9cc9ff]/30 rounded-br-2xl group-hover:border-[#9cc9ff]/60 transition-colors duration-300" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateY(0);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateY(-100px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}