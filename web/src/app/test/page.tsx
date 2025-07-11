'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import InvertedBlackHoleBackground from '@/components/ui/InvertedBlackHoleBackground/InvertedBlackHoleBackground';

export default function TestPage() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentTheme, setCurrentTheme] = useState<'purple' | 'blue' | 'forest' | 'gold'>('purple');

    // Performance optimization refs
    const lastUpdateTime = useRef(0);
    const animationFrameId = useRef<number | null>(null);
    const lastTheme = useRef<string>('purple');

    // Throttled update function using RAF
    const throttledUpdate = useCallback((progress: number) => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        animationFrameId.current = requestAnimationFrame(() => {
            const now = performance.now();

            // Limit updates to ~45fps for better performance while maintaining smoothness
            if (now - lastUpdateTime.current >= 22) {
                setScrollProgress(progress);

                // Only update theme if it actually changed
                let newTheme: 'purple' | 'blue' | 'forest' | 'gold';
                if (progress < 0.25) newTheme = 'purple';
                else if (progress < 0.5) newTheme = 'forest';
                else if (progress < 0.75) newTheme = 'blue';
                else newTheme = 'gold';

                if (newTheme !== lastTheme.current) {
                    setCurrentTheme(newTheme);
                    lastTheme.current = newTheme;
                }

                lastUpdateTime.current = now;
            }
        });
    }, []);

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

        // Handle scroll progress with throttling
        lenis.on('scroll', (e: { progress: number }) => {
            throttledUpdate(e.progress);
        });

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            lenis.destroy();
        };
    }, [throttledUpdate]);

    // Get theme display info
    const getThemeInfo = (theme: string) => {
        const themes = {
            purple: { name: 'Purple Plasma', range: '0% - 25%' },
            forest: { name: 'Forest Energy', range: '25% - 50%' },
            blue: { name: 'Blue Cosmos', range: '50% - 75%' },
            gold: { name: 'Golden Radiance', range: '75% - 100%' }
        };
        return themes[theme as keyof typeof themes] || themes.purple;
    };

    const themeInfo = getThemeInfo(currentTheme);

    return (
        <div style={{ position: 'relative' }}>
            {/* Inverted Black Hole Background - Fixed */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
                <InvertedBlackHoleBackground
                    scrollProgress={scrollProgress}
                    theme={currentTheme}
                />
            </div>

            {/* Debug info */}
            <div style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                color: 'white',
                fontSize: '16px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '8px',
                fontFamily: 'monospace'
            }}>
                <div>Inverted Black Hole Test</div>
                <div>Progress: {(scrollProgress * 100).toFixed(1)}%</div>
                <div>Theme: {themeInfo.name}</div>
                <div>Range: {themeInfo.range}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                    Optimized: ~45fps updates
                </div>
            </div>

            {/* Theme indicators */}
            <div style={{
                position: 'fixed',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {['purple', 'forest', 'blue', 'gold'].map((theme) => (
                    <div
                        key={theme}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: currentTheme === theme ?
                                (theme === 'purple' ? '#a78bfa' :
                                    theme === 'forest' ? '#22c55e' :
                                        theme === 'blue' ? '#3b82f6' : '#f59e0b') :
                                'rgba(255,255,255,0.3)',
                            border: '2px solid white',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>

            {/* Scroll instructions */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '18px',
                zIndex: 10,
                textAlign: 'center',
                background: 'rgba(0,0,0,0.5)',
                padding: '15px 30px',
                borderRadius: '25px',
                backdropFilter: 'blur(10px)'
            }}>
                Scroll to cycle through themes
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
                    Purple → Forest → Blue → Gold
                </div>
            </div>

            {/* Scrollable content to drive the theme changes */}
            <div style={{ height: '800vh', position: 'relative', zIndex: 2 }}>
                {/* Theme sections with subtle visual indicators */}
                <div style={{ height: '200vh', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        zIndex: 5
                    }}>
                        Purple Plasma
                        <div style={{ fontSize: '24px', opacity: 0.8, marginTop: '10px' }}>
                            0% - 25%
                        </div>
                    </div>
                </div>

                <div style={{ height: '200vh', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        zIndex: 5
                    }}>
                        Forest Energy
                        <div style={{ fontSize: '24px', opacity: 0.8, marginTop: '10px' }}>
                            25% - 50%
                        </div>
                    </div>
                </div>

                <div style={{ height: '200vh', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        zIndex: 5
                    }}>
                        Blue Cosmos
                        <div style={{ fontSize: '24px', opacity: 0.8, marginTop: '10px' }}>
                            50% - 75%
                        </div>
                    </div>
                </div>

                <div style={{ height: '200vh', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        zIndex: 5
                    }}>
                        Golden Radiance
                        <div style={{ fontSize: '24px', opacity: 0.8, marginTop: '10px' }}>
                            75% - 100%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 