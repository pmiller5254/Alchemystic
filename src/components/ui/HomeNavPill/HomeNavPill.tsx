'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import './HomeNavPill.css';

interface HomeNavPillProps {
    className?: string;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
    scrollStep?: number;
    scrollDirection?: 'up' | 'down';
}

export default function HomeNavPill({ className = '', theme, scrollStep = 0, scrollDirection = 'down' }: HomeNavPillProps) {
    const [dimensions, setDimensions] = useState({
        isMobile: false,
        isTablet: false
    });

    // Handle responsive dimensions
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                isMobile: window.innerWidth <= 480,
                isTablet: window.innerWidth <= 768
            });
        };

        updateDimensions(); // Initial call
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Get theme-based gradient that matches the ALCHEMYSTIC text
    const getThemeGradient = (theme?: string) => {
        switch (theme) {
            case 'purple':
                return 'linear-gradient(120deg, #a78bfa 0%, #6d28d9 40%, #f472b6 80%, rgba(255, 241, 242, 0.1) 100%)';
            case 'forest':
                return 'linear-gradient(120deg, #15803d 0%, #16a34a 40%, #4ade80 80%, rgba(220, 252, 231, 0.1) 100%)';
            case 'blue':
                return 'linear-gradient(120deg, #3b82f6 0%, #1d4ed8 40%, #60a5fa 80%, rgba(224, 242, 254, 0.1) 100%)';
            case 'gold':
                return 'linear-gradient(120deg, #f59e0b 0%, #d97706 40%, #fbbf24 80%, rgba(254, 249, 195, 0.1) 100%)';
            default:
                return 'rgba(0, 0, 0, 0.95)'; // Default dark background
        }
    };

    // Get the 3 other black hole options that aren't currently active
    const getQuickLinks = (currentStep: number) => {
        const allOptions = [
            { label: 'Movement', href: '/movement', step: 0 },
            { label: 'Legacy', href: '/legacy', step: 1 },
            { label: 'Co-create', href: '/co-create', step: 2 },
            { label: 'Nourish', href: '/nourish', step: 3 }
        ];

        // Return the 3 options that aren't currently active
        return allOptions.filter(option => option.step !== currentStep);
    };

    const quickLinks = getQuickLinks(scrollStep);

    // Get responsive dimensions
    const pillWidth = dimensions.isMobile ? "70%" : dimensions.isTablet ? "50%" : "33.333%";
    const pillHeight = dimensions.isMobile ? "45px" : dimensions.isTablet ? "50px" : "60px";
    const pillRadius = dimensions.isMobile ? "22.5px" : dimensions.isTablet ? "25px" : "30px";

    return (
        <motion.div
            className={`home-nav-pill ${className}`}
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: pillWidth,
                height: pillHeight,
                backdropFilter: 'blur(20px)',
                borderRadius: pillRadius,
                border: '1px solid rgba(251, 191, 36, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center'
            }}
            animate={{
                background: getThemeGradient(theme)
            }}
            transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
            }}
        >
            {/* Logo section (left 20%) */}
            <div
                className="logo-section"
                style={{
                    height: '100%',
                    width: '20%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '30px 0 0 30px',
                    flexShrink: 0,
                    padding: '8px'
                }}
            >
                <Link
                    href="/"
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        borderRadius: '30px 0 0 30px'
                    }}
                >
                    <Image
                        src="/download.png"
                        alt="Alchemystic Logo"
                        width={120}
                        height={40}
                        style={{
                            height: '100%',
                            width: 'auto',
                            objectFit: 'contain',
                            maxWidth: '100%',
                            pointerEvents: 'none'
                        }}
                    />
                </Link>
            </div>

            {/* Empty space section (middle 20%) */}
            <div
                className="empty-section"
                style={{
                    height: '100%',
                    width: '20%',
                    flexShrink: 0
                }}
            />

            {/* Navigation sections (right 60%) */}
            <div className="nav-sections" style={{
                height: '100%',
                width: '60%',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
            }}>
                {quickLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', height: '100%', flex: 1 }}>
                        {/* Link section - fully clickable with animated text */}
                        <Link href={link.href} className="nav-section" style={{ height: '100%', width: '100%' }}>
                        <motion.div
                            className="nav-section"
                            style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                borderRadius: index === quickLinks.length - 1 ? '0 30px 30px 0' : '0',
                                boxSizing: 'border-box',
                                border: 'none',
                                outline: 'none',
                                userSelect: 'none',
                                overflow: 'hidden',
                                backgroundColor: 'transparent'
                            }}
                            whileHover={{
                                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{
                                backgroundColor: 'rgba(251, 191, 36, 0.25)',
                                scale: 0.98,
                                transition: { duration: 0.1 }
                            }}
                            initial={{ backgroundColor: 'transparent' }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={`${link.label}-${scrollStep}`}
                                    initial={{
                                        y: scrollDirection === 'down' ? 20 : -20,
                                        opacity: 0
                                    }}
                                    animate={{
                                        y: 0,
                                        opacity: 1
                                    }}
                                    exit={{
                                        y: scrollDirection === 'down' ? -20 : 20,
                                        opacity: 0
                                    }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.4, 0, 0.2, 1]
                                    }}
                                >
                                    {link.label}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>
                        </Link>

                        {/* Vertical divider (except after last item) */}
                        {index < quickLinks.length - 1 && (
                            <div
                                style={{
                                    width: '1px',
                                    height: '60%',
                                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                                    alignSelf: 'center',
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
} 