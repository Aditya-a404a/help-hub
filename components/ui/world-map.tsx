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
      {/* India Map SVG */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `url("/india-map.svg")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Connection lines and dots */}
      {dots.map((dot, index) => (
        <div key={index} className="absolute inset-0">
          {/* Start point */}
          <div
            className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((dot.start.lng + 180) / 360) * 100}%`,
              top: `${((90 - dot.start.lat) / 180) * 100}%`,
            }}
          >
            {dot.start.label && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {dot.start.label}
              </div>
            )}
          </div>

          {/* End point */}
          <div
            className="absolute w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((dot.end.lng + 180) / 360) * 100}%`,
              top: `${((90 - dot.end.lat) / 180) * 100}%`,
            }}
          >
            {dot.end.label && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {dot.end.label}
              </div>
            )}
          </div>

          {/* Connection line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <line
              x1={`${((dot.start.lng + 180) / 360) * 100}%`}
              y1={`${((90 - dot.start.lat) / 180) * 100}%`}
              x2={`${((dot.end.lng + 180) / 360) * 100}%`}
              y2={`${((90 - dot.end.lat) / 180) * 100}%`}
              stroke={lineColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        </div>
      ))}

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
