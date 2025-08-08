'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PlasmaBackground from './PlasmaBackground';
import './AlchemysticBanner.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface AlchemysticBannerProps {
    className?: string;
    page?: string; // To determine which quick links to show
    theme?: 'purple' | 'blue' | 'forest' | 'gold'; // To match home page theme
}

export default function AlchemysticBanner({ className = '', page = 'nourish', theme }: AlchemysticBannerProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const pillContentRef = useRef<HTMLDivElement>(null);
    const [isPillMode, setIsPillMode] = useState(false);
    const [pillDimensions, setPillDimensions] = useState({ width: 0, height: 0 });

    useGSAP(() => {
        if (!bannerRef.current || !textRef.current || !pillContentRef.current) return;

        const banner = bannerRef.current;
        const text = textRef.current;
        const pillContent = pillContentRef.current;
        const letters = text.querySelectorAll('.letter');

        // Initial animation for letters - fast straight vertical fall
        gsap.fromTo(letters,
            {
                y: -200,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "bounce.out",
                stagger: 0.05,
                delay: 0.1
            }
        );

        // Get responsive pill dimensions
        const isMobile = window.innerWidth <= 480;
        const isTablet = window.innerWidth <= 768;

        const pillWidth = isMobile ? "70%" : isTablet ? "50%" : "33.333%";
        const pillHeight = isMobile ? "45px" : isTablet ? "50px" : "60px";
        const pillRadius = isMobile ? "22.5px" : isTablet ? "25px" : "30px";

        // Ensure banner starts in initial banner state (not pill)
        gsap.set(banner, {
            position: "relative",
            top: "auto",
            left: "auto",
            right: "auto",
            width: "100vw",
            height: "20vh",
            transform: "none",
            background: theme ? getThemeGradient(theme) : "linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #f59e0b 75%, #fbbf24 100%)",
            backdropFilter: "none",
            borderRadius: "0px",
            border: "none",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            zIndex: "auto"
        });

        // Set initial pill mode state
        setIsPillMode(false);



        // Ensure letters start in banner state
        gsap.set(letters, {
            fontSize: "clamp(2rem, 8vw, 4rem)",
            letterSpacing: "0.2em",
            y: 0,
            color: "#ffffff"  // White text as per CSS
        });

        // Ensure pill content starts invisible
        gsap.set(pillContent, {
            opacity: 0,
            display: "none"
        });

        // Create timeline for smooth scroll-linked transformation FROM banner TO pill
        const transformTimeline = gsap.timeline({ paused: true });

        // Set up the transformation timeline for smooth center-shrinking effect
        transformTimeline
            // First, instantly position as fixed and centered at top (but keep full width)
            .to(banner, {
                position: "fixed",
                top: "0px",
                left: "50%",
                right: "auto",
                transform: "translateX(-50%)",
                zIndex: 1000,
                duration: 0,
                ease: "none"
            }, 0)
            // Then animate the shrinking and styling changes
            .to(banner, {
                width: pillWidth,
                height: pillHeight,
                background: page === 'nourish' ? 'transparent' : getThemeGradient(theme),
                backdropFilter: "blur(20px)",
                borderRadius: pillRadius,
                border: "1px solid rgba(251, 191, 36, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                duration: 0.7,
                ease: "none",
                onStart: () => {
                    setIsPillMode(true);
                },
                onUpdate: () => {
                    // Update dimensions during animation for accurate sizing
                    const rect = banner.getBoundingClientRect();
                    setPillDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
                }
            }, 0)
            // Fade out banner text during shrinking
            .to(text, {
                opacity: 0,
                duration: 0.3,
                ease: "none"
            }, 0)
            // Hide banner content completely
            .set(text, {
                display: "none"
            }, 0.3)
            // Hide entire banner content container
            .set(banner.querySelector('.banner-content'), {
                display: "none"
            }, 0.3)
            // Show pill content
            .set(pillContent, {
                display: "flex",
                flexDirection: "row"
            }, 0.4)
            // Fade in pill content
            .to(pillContent, {
                opacity: 1,
                duration: 0.3,
                ease: "none"
            }, 0.4)
            // Finally, move to pill position
            .to(banner, {
                top: "20px",
                duration: 0.3,
                ease: "none"
            }, 0.7);

        // ScrollTrigger with delayed timing - only transform when banner is leaving screen
        ScrollTrigger.create({
            trigger: banner,
            start: "bottom top+=100px",   // Start when banner bottom is 100px past top of viewport
            end: "bottom top-=50px",      // End when banner is completely off screen
            animation: transformTimeline,
            scrub: 1.5
        });

        // Parallax effect disabled to prevent conflict with pill transformation
        // gsap.to(letters, {
        //     y: -20,
        //     ease: "none",
        //     scrollTrigger: {
        //         trigger: banner,
        //         start: "top bottom",
        //         end: "bottom top",
        //         scrub: 1
        //     }
        // });

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    // Update banner background when theme changes (for home page)
    useGSAP(() => {
        if (!theme || !bannerRef.current) return;

        const banner = bannerRef.current;

        // Update background for both initial banner and pill mode
        // But keep nourish page transparent in pill mode for plasma effect
        const shouldBeTransparent = page === 'nourish' && isPillMode;

        gsap.to(banner, {
            background: shouldBeTransparent ? 'transparent' : getThemeGradient(theme),
            duration: 0.8,
            ease: "power2.out"
        });
    }, [theme, isPillMode, page]);

    // Split text into individual letters with spaces
    const renderText = (text: string) => {
        return text.split('').map((char, index) => (
            <span
                key={index}
                className={`letter ${char === ' ' ? 'space' : ''}`}
                style={{ display: 'inline-block' }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    // Get page-specific quick links
    const getQuickLinks = (page: string) => {
        switch (page) {
            case 'home':
                return [
                    { label: 'About', href: '/about' },
                    { label: 'Services', href: '/services' },
                    { label: 'Contact', href: '/contact' }
                ];
            case 'shop':
                return [
                    { label: 'Cart', href: '/cart' },
                    { label: 'Checkout', href: '/checkout' }
                ];
            case 'nourish':
                return [
                    { label: 'Cart', href: '/cart' },
                    { label: 'Checkout', href: '/checkout' }
                ];
            default:
                return [
                    { label: 'Home', href: '/' },
                    { label: 'About', href: '/about' }
                ];
        }
    };

    const quickLinks = getQuickLinks(page);

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

    return (
        <div
            ref={bannerRef}
            className={`alchemystic-banner ${className}`}
            style={{ position: 'relative' }}
        >
            {/* Plasma background for nourish page pill mode */}
            {page === 'nourish' && isPillMode && pillDimensions.width > 0 && (
                <PlasmaBackground
                    width={pillDimensions.width}
                    height={pillDimensions.height}
                    className="plasma-pill-background"
                />
            )}

            {/* Banner content (visible initially) */}
            <div className="banner-content">
                <div ref={textRef} className="banner-text">
                    {renderText('A L C H E M Y S T I C')}
                </div>
            </div>

            {/* Pill content (visible when transformed) */}
            <div
                ref={pillContentRef}
                className="pill-content"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    zIndex: 10
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
                            {/* Link section - fully clickable */}
                            <Link
                                href={link.href}
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
                                    transition: 'all 0.2s ease',
                                    borderRadius: index === quickLinks.length - 1 ? '0 30px 30px 0' : '0',
                                    boxSizing: 'border-box',
                                    border: 'none',
                                    outline: 'none',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {link.label}
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
            </div>
        </div>
    );
} 