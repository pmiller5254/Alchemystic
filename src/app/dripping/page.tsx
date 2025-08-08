'use client';

import { useState, useEffect } from 'react';
import DrippingSphereSystem from '@/components/ui/MultiSphereSystem/DrippingSphereSystem';

export default function DrippingPage() {
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
            <DrippingSphereSystem
                scrollProgress={scrollProgress}
            />

            {/* Scrollable content to trigger sphere rotation */}
            <div className="min-h-[400vh]"></div>
        </div>
    );
} 