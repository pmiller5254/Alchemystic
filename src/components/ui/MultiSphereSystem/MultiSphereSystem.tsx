'use client';

import React from 'react';
import InvertedBlackHole3D from '@/components/ui/InvertedBlackHoleBackground/InvertedBlackHole3D';
import './MultiSphereSystem.css';

interface MultiSphereSystemProps {
    scrollProgress?: number;
}

export default function MultiSphereSystem({ scrollProgress = 0 }: MultiSphereSystemProps) {
    const themes: ('purple' | 'blue' | 'forest' | 'gold')[] = ['purple', 'blue', 'forest', 'gold'];
    
    // Calculate which sphere should be visible based on scroll progress
    const currentSphereIndex = Math.floor(scrollProgress * themes.length);
    const currentTheme = themes[currentSphereIndex] || themes[0];

    return (
        <div className="multi-sphere-container">
            {/* Render all spheres but only show the current one */}
            {themes.map((theme, index) => (
                <div
                    key={theme}
                    className={`sphere-wrapper ${index === currentSphereIndex ? 'active' : 'hidden'}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === currentSphereIndex ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out',
                        zIndex: index === currentSphereIndex ? 1 : 0
                    }}
                >
                    <InvertedBlackHole3D 
                        theme={theme}
                        scrollProgress={scrollProgress}
                    />
                </div>
            ))}
        </div>
    );
} 