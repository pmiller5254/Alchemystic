'use client';

import { useState, useEffect } from 'react';
import PlanetSystem from '@/components/ui/MultiSphereSystem/PlanetSystem';

export default function DebugRoutePage() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(scrollTop / docHeight, 1);
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return <PlanetSystem scrollProgress={scrollProgress} showControls />;
}
