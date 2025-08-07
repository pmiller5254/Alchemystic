'use client';

import { useState, useEffect } from 'react';
import InvertedBlackHole3D from '@/components/ui/InvertedBlackHoleBackground/InvertedBlackHole3D';
import CustomShaderBackground from '@/components/ui/InvertedBlackHoleBackground/CustomShaderBackground';

export default function TestPage() {
    const [theme, setTheme] = useState<'purple' | 'blue' | 'forest' | 'gold'>('purple');
    const [rotationSpeed, setRotationSpeed] = useState(1.0);
    const [debugSeam, setDebugSeam] = useState(false);

    const [scrollProgress, setScrollProgress] = useState(0);

    // Handle scroll-based theme changes
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const totalHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollProgress = totalHeight > 0 ? scrollY / totalHeight : 0;

            setScrollProgress(scrollProgress);

            // Calculate which section we're in (4 sections total)
            const sectionHeight = totalHeight / 4;
            const currentSection = Math.floor(scrollY / sectionHeight);

            // Map sections to themes
            const themes: ('purple' | 'blue' | 'forest' | 'gold')[] = ['purple', 'blue', 'forest', 'gold'];
            const newTheme = themes[Math.min(currentSection, themes.length - 1)];

            if (newTheme !== theme) {
                setTheme(newTheme);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Set initial theme
        return () => window.removeEventListener('scroll', handleScroll);
    }, [theme]);

    return (
        <div className="bg-neutral-900">
            {/* Custom shader background */}
            <CustomShaderBackground
                scale={0.4}
                ax={5}
                ay={7}
                az={9}
                aw={13}
                bx={1}
                by={1}
                color1="#000000"
                color2="#000000"
                color3="#000000"
                color4={theme === 'purple' ? '#8b5cf6' : theme === 'blue' ? '#3b82f6' : theme === 'forest' ? '#10b981' : '#f59e0b'}
            />

            {/* Fixed sphere background */}
            <InvertedBlackHole3D
                theme={theme}
                rotationSpeed={rotationSpeed}
                debugSeam={debugSeam}
                scrollProgress={scrollProgress}
            />

            {/* Controls Panel */}
            <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
                <h2 className="text-lg font-bold mb-4">Controls</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-2">Theme: {theme}</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'purple' | 'blue' | 'forest' | 'gold')}
                            className="w-full bg-gray-800 text-white rounded px-3 py-2"
                        >
                            <option value="purple">Purple</option>
                            <option value="blue">Blue</option>
                            <option value="forest">Forest</option>
                            <option value="gold">Gold</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Speed: {rotationSpeed}
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={rotationSpeed}
                            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={debugSeam}
                                onChange={(e) => setDebugSeam(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Debug</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Content for scrolling */}
            <div className="relative z-10">
                {/* Theme sections for scrolling */}
                <section className="min-h-screen"></section>
                <section className="min-h-screen"></section>
                <section className="min-h-screen"></section>
                <section className="min-h-screen"></section>
                <section className="min-h-screen"></section>
            </div>
        </div>
    );
} 