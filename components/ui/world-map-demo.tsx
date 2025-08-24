"use client";
import { useState, useEffect, useRef } from "react";
import IndiaMap from "@/components/ui/india-map";

export default function WorldMapDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true);
          setIsLoaded(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="w-full h-screen relative">
      {isVisible && <IndiaMap showLegend={false} />}
    </div>
  );
}
