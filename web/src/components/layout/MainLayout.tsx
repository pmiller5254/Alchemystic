'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        let lastScrollY = 0;
        let ticking = false;

        const updateNav = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 10) {
                setShowNav(true);
            } else if (currentScrollY > lastScrollY) {
                setShowNav(false); // scrolling down
            } else {
                setShowNav(true); // scrolling up
            }
            lastScrollY = currentScrollY;
            ticking = false;
        };

        // Use Lenis if available, otherwise fall back to native scroll
        if (typeof window !== 'undefined') {
            const lenis = (window as any).lenis;

            if (lenis) {
                const onScroll = (e: any) => {
                    if (!ticking) {
                        window.requestAnimationFrame(updateNav);
                        ticking = true;
                    }
                };
                lenis.on('scroll', onScroll);
                return () => lenis.off('scroll', onScroll);
            } else {
                const onScroll = () => {
                    if (!ticking) {
                        window.requestAnimationFrame(updateNav);
                        ticking = true;
                    }
                };
                window.addEventListener('scroll', onScroll);
                return () => window.removeEventListener('scroll', onScroll);
            }
        }
    }, []);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Products', path: '/products' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* <nav ...> ... </nav> */}
            <main className="pt-0">
                {children}
            </main>
        </div>
    );
} 