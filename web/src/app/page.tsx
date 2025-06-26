'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import MainLayout from '@/components/layout/MainLayout';
import ParticleBackground from '@/components/ui/ParticleBackground';
import ComplexBlackHoleBackground from '@/components/ui/ComplexBlackHoleBackground';
import ComplexBlackHoleBackgroundBlue from '@/components/ui/ComplexBlackHoleBackgroundBlue';
import ComplexBlackHoleBackgroundForest from '@/components/ui/ComplexBlackHoleBackgroundForest';
import ComplexBlackHoleBackgroundGold from '@/components/ui/ComplexBlackHoleBackgroundGold';

export default function Home() {
  const [scrollStep, setScrollStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Make lenis globally available
    (window as any).lenis = lenis;

    // Lenis scroll function
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle scroll with Lenis
    lenis.on('scroll', (e: any) => {
      const scrollY = e.scroll;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;

      // Calculate overall scroll progress (0 to 1)
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Calculate step-based scroll (0, 1, 2, 3)
      const step = Math.min(Math.floor(progress * 4), 3); // 4 steps: 0, 1, 2, 3
      setScrollStep(step);
    });

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  // Calculate opacity for each background based on scroll step
  const getBackgroundOpacity = (backgroundStep: number) => {
    const currentStep = Math.floor(scrollProgress * 4);
    // Gold phase: always fully visible at the last step or at 100% scroll
    if (backgroundStep === 3 && (currentStep === 3 || scrollProgress === 1)) {
      return 1;
    }
    if (scrollProgress === 1) {
      return 0;
    }
    const stepProgress = (scrollProgress * 4) % 1;
    if (backgroundStep === currentStep) {
      // If this is the last step, don't fade out
      if (currentStep === 3) return 1;
      return 1 - stepProgress;
    } else if (backgroundStep === currentStep + 1) {
      // If next step would be out of bounds, don't fade in
      if (currentStep === 3) return 0;
      return stepProgress;
    }
    return 0;
  };

  // Theme configuration based on scroll step
  const getThemeConfig = (step: number) => {
    switch (step) {
      case 0: // Purple theme
        return {
          titleGradient: 'from-purple-400 to-slate-300',
          buttonBg: 'bg-purple-600',
          buttonHover: 'hover:bg-purple-700',
          buttonLink: '/services'
        };
      case 1: // Blue theme
        return {
          titleGradient: 'from-blue-400 to-cyan-300',
          buttonBg: 'bg-blue-600',
          buttonHover: 'hover:bg-blue-700',
          buttonLink: '/about'
        };
      case 2: // Forest theme
        return {
          titleGradient: 'from-green-800 to-gray-400',
          buttonBg: 'bg-green-600',
          buttonHover: 'hover:bg-green-700',
          buttonLink: '/contact'
        };
      case 3: // Gold theme
        return {
          titleGradient: 'from-yellow-400 to-orange-500',
          buttonBg: 'bg-amber-600',
          buttonHover: 'hover:bg-amber-700',
          buttonLink: '/products'
        };
      default: // Purple theme (fallback)
        return {
          titleGradient: 'from-purple-400 to-slate-300',
          buttonBg: 'bg-purple-600',
          buttonHover: 'hover:bg-purple-700',
          buttonLink: '/services'
        };
    }
  };

  const currentTheme = getThemeConfig(scrollStep);

  return (
    <MainLayout>
      {/* Persistent cosmic particle background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ParticleBackground />
      </div>

      {/* Purple Black Hole Background (Step 0) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: getBackgroundOpacity(0),
          transition: 'opacity 1s ease-in-out'
        }}
      >
        <ComplexBlackHoleBackground scrollProgress={scrollProgress} />
      </div>

      {/* Blue Black Hole Background (Step 1) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: getBackgroundOpacity(1),
          transition: 'opacity 1s ease-in-out'
        }}
      >
        <ComplexBlackHoleBackgroundBlue scrollProgress={scrollProgress} />
      </div>

      {/* Forest Black Hole Background (Step 2) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: getBackgroundOpacity(2),
          transition: 'opacity 1s ease-in-out'
        }}
      >
        <ComplexBlackHoleBackgroundForest scrollProgress={scrollProgress} />
      </div>

      {/* Gold Black Hole Background (Step 3) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: getBackgroundOpacity(3),
          transition: 'opacity 1s ease-in-out'
        }}
      >
        <ComplexBlackHoleBackgroundGold scrollProgress={scrollProgress} />
      </div>

      {/* Scroll Progress Indicator */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 20,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '14px'
      }}>
        <div>Step: {scrollStep}</div>
        <div>Progress: {(scrollProgress * 100).toFixed(1)}%</div>
      </div>

      {/* Fixed Hero Section - Always visible */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center pointer-events-auto"
        >
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.titleGradient} font-script transition-all duration-1000`}>
            A L C H E M Y S T I C
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Welcome to the Alchemystic Galaxy.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="space-x-4"
          >
            <Link
              href={currentTheme.buttonLink}
              className={`inline-block px-8 py-3 rounded-full ${currentTheme.buttonBg} text-white font-semibold ${currentTheme.buttonHover} transition-all duration-1000`}
            >
              {scrollStep === 0 && 'I seek movement and embodiment.'}
              {scrollStep === 1 && 'I wish to tend to land and legacy.'}
              {scrollStep === 2 && 'I am here to co-create space.'}
              {scrollStep === 3 && 'I am called to nourish and shop.'}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scrollable content sections for background transitions */}
      <div className="relative z-5 min-h-[200vh]"></div>
      <div className="relative z-5 min-h-[200vh]"></div>
      <div className="relative z-5 min-h-[200vh]"></div>
      <div className="relative z-5 min-h-[200vh]"></div>
    </MainLayout>
  );
}
