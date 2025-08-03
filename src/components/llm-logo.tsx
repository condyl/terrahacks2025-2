import React from "react";
import Image from "next/image";

const BaymaxLogo = () => {
  return (
    <div className="relative">
      {/* Radial gradient background circle with border */}
      <div className="w-12 h-12 bg-gradient-radial from-red-500 to-red-600 rounded-full border-2 border-red-400 flex items-center justify-center shadow-lg p-1">
        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
          <Image
            src="/baymax.png"
            alt="Baymax Lite"
            width={28}
            height={28}
            className="rounded-full"
            priority
          />
        </div>
      </div>
      
      {/* Animated pulse ring */}
      <div className="absolute inset-0 rounded-full border-2 border-red-300/30 animate-ping" />
    </div>
  );
};

export default BaymaxLogo;
