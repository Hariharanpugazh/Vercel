import React from 'react';

const Button = ({
  type = "button",
  className = "",
  children,
  disabled = false,
  color = "rgba(81, 83, 237, 0.8)",  // Gold-like shimmer
  speed = "6s",
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...rest}
    >
      {/* Bottom Glow */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>

      {/* Top Glow */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>

      {/* Main Button */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center py-[16px] px-[26px] rounded-[20px]">
        {children}
      </div>
    </button>
  );
};

export default Button;