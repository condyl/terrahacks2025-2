import React from "react";

const LlmLogo = () => {
  return (
    <div className="relative">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background gradient circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        <circle cx="18" cy="18" r="18" fill="url(#logoGradient)" />
        
        {/* Healthcare cross */}
        <path
          d="M18 8V28M8 18H28"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* AI pulse effect */}
        <circle
          cx="18"
          cy="18"
          r="4"
          fill="white"
          opacity="0.9"
        />
        <circle
          cx="18"
          cy="18"
          r="2"
          fill="url(#logoGradient)"
        />
      </svg>
      
      {/* Animated pulse ring */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
    </div>
  );
};

export default LlmLogo;
