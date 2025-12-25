interface HodCardProps {
  name: string;
  role: string;
  image: string;
}

const HodCard = ({ name, role, image }: HodCardProps) => {
  return (
    <div className="group relative w-[280px] h-[320px] perspective-1000">
      <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-[#254b80]/30">
            {/* Image */}
            <img
              src={image}
              alt={name}
              className="w-full object-contain object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/280/320";
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
              <h5 className="text-white font-bold text-xl mb-1 leading-tight tracking-wide">
                {name}
              </h5>
              <p className="text-[#9cc9ff] font-semibold text-sm uppercase tracking-wider">
                {role}
              </p>
            </div>
            
            {/* Decorative Corner */}
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#9cc9ff]/40 rounded-tr-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodCard;