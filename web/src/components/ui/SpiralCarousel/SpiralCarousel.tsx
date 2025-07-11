'use client';

import React, { useEffect, useRef, useState } from 'react';
import './SpiralCarousel.css';

interface SpiralCarouselProps {
    children: React.ReactNode[];
    numPanels?: number;
    radius?: number;
    spiralHeight?: number;
    doubleHelix?: boolean;
}

export default function SpiralCarousel({
    children,
    numPanels,
    radius = 120,
    spiralHeight = 100,
    doubleHelix = false
}: SpiralCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const progress = useRef({ value: 0 }); // Start at 0 for top/front position
    const [isDragging, setIsDragging] = useState(false);
    const [lastY, setLastY] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const animationRef = useRef<number | undefined>(undefined);

    // Use either provided numPanels or length of children
    const actualNumPanels = numPanels || children.length;

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const items = carousel.querySelectorAll('.spiral-carousel-item');

        const animate = () => {
            if (doubleHelix) {
                // DNA Double Helix: Two independent continuous spirals
                items.forEach((item, index) => {
                    const isSecondStrand = index % 2 === 1;

                    // Calculate position within each strand (0, 1, 2, 3... for each strand)
                    const strandPosition = Math.floor(index / 2);
                    const totalStrandItems = Math.ceil(items.length / 2);

                    // Make the spiral infinitely looping by using modulo
                    const loopLength = 1; // One full cycle through all items
                    const normalizedProgress = ((progress.current.value % loopLength) + loopLength) % loopLength;

                    // Each strand is a continuous spiral based on progress
                    const strandTheta = (strandPosition / totalStrandItems + normalizedProgress) * Math.PI * 2;

                    // Second strand is offset by 180 degrees (PI radians)
                    const theta = strandTheta + (isSecondStrand ? Math.PI : 0);

                    const x = -Math.sin(theta) * radius;
                    const z = Math.cos(theta) * radius;

                    // Create continuous spiral effect with progressive panel offset
                    const panelHeight = 320;
                    const progressiveOffset = strandPosition * (panelHeight * 0.8);
                    const continuousSpiral = strandTheta * spiralHeight / (Math.PI * 2);
                    const y = progressiveOffset + continuousSpiral;

                    // Calculate visibility based on z position (depth) - more generous for looping
                    const distanceFromFront = Math.sqrt(x * x + (z - radius) * (z - radius));
                    const maxDistance = radius * 2;
                    const normalizedDistance = Math.min(distanceFromFront / maxDistance, 1);

                    const visibility = Math.max(0.1, 1 - normalizedDistance * 0.8); // More visible range
                    const scale = 0.4 + (visibility * 0.6);
                    const opacity = visibility * (isSecondStrand ? 0.85 : 1);

                    // Apply transforms
                    (item as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-theta * 180 / Math.PI}deg) scale(${scale})`;
                    (item as HTMLElement).style.opacity = opacity.toString();
                });
            } else {
                // Single spiral with infinite looping
                items.forEach((item, index) => {
                    // Make the spiral infinitely looping
                    const loopLength = 1; // One full cycle through all items
                    const normalizedProgress = ((progress.current.value % loopLength) + loopLength) % loopLength;

                    const theta = (index / items.length + normalizedProgress) * Math.PI * 2;
                    const x = -Math.sin(theta) * radius;
                    const z = Math.cos(theta) * radius;

                    // Create continuous spiral effect with progressive panel offset
                    const panelHeight = 320;
                    const progressiveOffset = index * (panelHeight * 0.8);
                    const continuousSpiral = theta * spiralHeight / (Math.PI * 2);
                    const y = progressiveOffset + continuousSpiral;

                    // Calculate visibility - more generous for looping
                    const distanceFromFront = Math.sqrt(x * x + (z - radius) * (z - radius));
                    const maxDistance = radius * 2;
                    const normalizedDistance = Math.min(distanceFromFront / maxDistance, 1);

                    const visibility = Math.max(0.1, 1 - normalizedDistance * 0.8); // More visible range
                    const scale = 0.4 + (visibility * 0.6);
                    const opacity = visibility;

                    // Apply transforms
                    (item as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-theta * 180 / Math.PI}deg) scale(${scale})`;
                    (item as HTMLElement).style.opacity = opacity.toString();
                });
            }
        };

        // Animation loop
        const tick = () => {
            animate();
            requestAnimationFrame(tick);
        };
        tick();

        // Handle wheel events
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * 0.001;
            progress.current.value += delta;
        };

        carousel.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            carousel.removeEventListener('wheel', handleWheel);
        };
    }, [actualNumPanels, radius, spiralHeight, doubleHelix]);

    // Inertia effect for smooth momentum
    useEffect(() => {
        if (!isDragging && Math.abs(velocity) > 0.002) { // Higher threshold to stop sooner
            const decay = () => {
                const newVelocity = velocity * 0.92; // Stronger decay
                setVelocity(newVelocity);
                progress.current.value += newVelocity;

                // Stop if velocity is very small
                if (Math.abs(newVelocity) > 0.002) {
                    requestAnimationFrame(decay);
                } else {
                    setVelocity(0); // Ensure it stops completely
                }
            };
            requestAnimationFrame(decay);
        }
    }, [isDragging, velocity]);

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastY(e.clientY);
        setVelocity(0); // Stop any existing momentum
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaY = e.clientY - lastY;
        const movement = deltaY * 0.002; // Remove negative sign - drag down moves down
        progress.current.value += movement;
        setVelocity(movement * 0.5); // Reduce momentum buildup
        setLastY(e.clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setLastY(e.touches[0].clientY);
        setVelocity(0); // Stop any existing momentum
        e.preventDefault();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const deltaY = e.touches[0].clientY - lastY;
        const movement = deltaY * 0.002; // Remove negative sign - drag down moves down
        progress.current.value += movement;
        setVelocity(movement * 0.5); // Reduce momentum buildup
        setLastY(e.touches[0].clientY);
        e.preventDefault();
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Continuous spiral animation
    useEffect(() => {
        if (!isDragging) {
            const animate = () => {
                progress.current.value += 0.0008; // Slow continuous rotation
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }
        };
    }, [isDragging]);

    // Stop animation when dragging starts
    useEffect(() => {
        if (isDragging && animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = undefined;
        }
    }, [isDragging]);

    return (
        <div className="spiral-carousel-container">
            <div
                className="spiral-carousel"
                ref={carouselRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {children.map((child, index) => (
                    <div key={index} className={`spiral-carousel-item ${doubleHelix && index % 2 === 1 ? 'secondary' : 'primary'}`}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
} 