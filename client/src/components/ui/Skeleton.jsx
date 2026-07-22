import React from "react";

export const Skeleton = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 border border-white/5 rounded-2xl ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
