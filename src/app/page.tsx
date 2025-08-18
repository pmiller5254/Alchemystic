'use client';

import { useState, useEffect } from 'react';
import PlanetSystem from '@/components/ui/MultiSphereSystem/PlanetSystem';

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* 4-Sphere Rotating 3D System that fills the viewport */}
      <PlanetSystem scrollProgress={scrollProgress} />

    </div>
  );
} 