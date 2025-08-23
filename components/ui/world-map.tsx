"use client";

import { useRef } from "react";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#ff0000",
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference props to satisfy lint while keeping API stable
  void dots?.length;
  void lineColor;

  return (
    <div ref={containerRef} className="w-full h-full relative font-sans">
      {/* Pre-loaded world map SVG */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: 'url("/india-map.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Connection lines and dots */}
     
      
      {/* CSS animations with hardware acceleration */}
      <style jsx>{`
        @keyframes fadeInLine {
          from {
            opacity: 0;
            transform: scaleX(0) rotate(var(--angle));
          }
          to {
            opacity: 1;
            transform: scaleX(1) rotate(var(--angle));
          }
        }
        
        @keyframes fadeInPoint {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        /* Hardware acceleration for smooth animations */
        .absolute {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
}
