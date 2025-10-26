import React from "react";

interface HodCardProps {
  name: string;
  role: string;

  image: string;
}

const HodCard: React.FC<HodCardProps> = ({ name, role, image }) => {
  return (
    <div className="relative  w-[200px] h-[260px] rounded-2xl overflow-hidden shadow-lg hover:scale-102 transition-transform duration-300 ease-out">
      <img src={image} alt={name} className="w-full h-full object-cover" />

      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute text-center bottom-2 left-10 text-white">
        <h3 className="text-md w-full font-bold ">{name}</h3>
        <p className="text-sm text-gray-300">{role}</p>
      </div>
    </div>
  );
};

export default HodCard;
