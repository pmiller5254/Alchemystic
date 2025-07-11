'use client';

import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        let ticking = false;

        const updateNav = () => {
            // Navigation logic remains for potential future use
            ticking = false;
        };

        // Use Lenis if available, otherwise fall back to native scroll
        if (typeof window !== 'undefined') {
            const lenis = (window as typeof window & {
                lenis?: {
                    on: (event: string, callback: () => void) => void;
                    off: (event: string, callback: () => void) => void;
                }
            }).lenis;

            if (lenis) {
                const onScroll = () => {
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

    return (
        <div className="min-h-screen bg-black text-white">
            {/* <nav ...> ... </nav> */}
            <main className="pt-0">
                {children}
            </main>
        </div>
    );
} 