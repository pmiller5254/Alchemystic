'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import MainLayout from '@/components/layout/MainLayout';
import ModernBlackHoleBackground from '@/components/ui/ModernBlackHoleBackground/ModernBlackHoleBackground';
import AlchemysticBanner from '@/components/ui/AlchemysticBanner/AlchemysticBanner';

export default function Home() {
  const [scrollStep, setScrollStep] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'purple' | 'blue' | 'forest' | 'gold'>('purple');

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Make lenis globally available
    (window as typeof window & { lenis: typeof lenis }).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle scroll progress
    lenis.on('scroll', (e: { progress: number }) => {
      const progress = e.progress;

      // Determine scroll step (0-3)
      const step = Math.floor(progress * 4);
      setScrollStep(Math.min(step, 3));

      // Map scrollProgress directly to theme
      let theme: 'purple' | 'blue' | 'forest' | 'gold';
      if (progress < 0.25) theme = 'purple';
      else if (progress < 0.5) theme = 'forest';
      else if (progress < 0.75) theme = 'blue';
      else theme = 'gold';
      setCurrentTheme(theme);
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  // Button text and links based on scroll step
  const getButtonConfig = (step: number) => {
    const configs = [
      { text: 'I seek movement and embodiment.', link: '/movement', color: 'from-purple-400 to-purple-600' },
      { text: 'I wish to tend to land and legacy.', link: '/legacy', color: 'from-green-400 to-green-600' },
      { text: 'I am here to co-create space.', link: '/co-create', color: 'from-blue-400 to-blue-600' },
      { text: 'I am called to nourish and shop.', link: '/nourish', color: 'from-orange-400 to-orange-600' }
    ];
    return configs[step] || configs[0];
  };

  const buttonConfig = getButtonConfig(scrollStep);

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        {/* ALCHEMYSTIC Banner that transforms to navbar */}
        <div className="relative z-50">
          <AlchemysticBanner page="home" theme={currentTheme} />
        </div>

        {/* Modern WebGL Background System */}
        <ModernBlackHoleBackground
          scrollProgress={1}
          theme={currentTheme}
        />

        {/* Hero Content - Fixed in Center */}
        <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ paddingTop: '80px' }}>
          <motion.div
            className="text-center px-4 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
              animate={{
                backgroundImage:
                  currentTheme === 'purple'
                    ? 'linear-gradient(120deg, #a78bfa 0%, #6d28d9 40%, #f472b6 80%, #fff1f2 100%)'
                    : currentTheme === 'forest'
                      ? 'linear-gradient(120deg, #15803d 0%, #16a34a 40%, #4ade80 80%, #dcfce7 100%)'
                      : currentTheme === 'blue'
                        ? 'linear-gradient(120deg, #3b82f6 0%, #1d4ed8 40%, #60a5fa 80%, #e0f2fe 100%)'
                        : 'linear-gradient(120deg, #f59e0b 0%, #d97706 40%, #fbbf24 80%, #fef9c3 100%)',
              }}
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              A L C H E M Y S T I C
            </motion.h1>

            <motion.div
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1] // easeInOut
              }}
            >
              <Link href={buttonConfig.link}>
                <motion.button
                  className={`px-8 py-4 text-lg font-semibold text-white rounded-full bg-gradient-to-r hover:scale-105 transition-all duration-300 shadow-2xl`}
                  animate={{
                    background: `linear-gradient(to right, ${currentTheme === 'purple' ? '#a78bfa, #6d28d9' :
                      currentTheme === 'forest' ? '#22c55e, #16a34a' :
                        currentTheme === 'blue' ? '#3b82f6, #1d4ed8' :
                          '#f59e0b, #d97706'
                      })`
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1] // easeInOut
                  }}
                >
                  {buttonConfig.text}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scrollable Content for Lenis */}
        <div className="relative z-20" style={{ height: '800vh' }}>
          {/* This creates the scrollable content that drives the background animations */}
        </div>
      </div>
    </MainLayout>
  );
}
