import React, { useState, useEffect } from 'react';
import './StarryBackground.css';

interface StarryBackgroundProps {
    density?: 'light' | 'medium' | 'heavy';
}

interface Star {
    id: number;
    left: number;
    top: number;
    animationDelay: number;
}

interface ShootingStar {
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    delay: number;
    size: number;
    isZAxis?: boolean;
    startZ?: number;
    endZ?: number;
}

export default function StarryBackground({ density = 'medium' }: StarryBackgroundProps) {
    const [stars, setStars] = useState<{
        farStars: Star[];
        midStars: Star[];
        nearStars: Star[];
    }>({
        farStars: [],
        midStars: [],
        nearStars: []
    });

    const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

    const [targetMousePosition, setTargetMousePosition] = useState({ x: 0, y: 0 });
    const [currentMousePosition, setCurrentMousePosition] = useState({ x: 0, y: 0 });

    // Generate random star positions for each layer
    const generateStars = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            animationDelay: Math.random() * 3, // Random delay for twinkling
        }));
    };

    // Generate random shooting stars with good diagonal angles
    const generateShootingStars = (count: number) => {
        const stars: ShootingStar[] = [];
        let attempts = 0;

        while (stars.length < count && attempts < count * 10) {
            attempts++;

            // Random starting position around screen edges
            const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let startX, startY, endX, endY;

            switch (edge) {
                case 0: // Top edge
                    startX = Math.random() * 100;
                    startY = -5;
                    endX = startX + (Math.random() - 0.5) * 100;
                    endY = 50 + Math.random() * 50;
                    break;
                case 1: // Right edge
                    startX = 105;
                    startY = Math.random() * 100;
                    endX = 20 + Math.random() * 30;
                    endY = startY + (Math.random() - 0.5) * 60;
                    break;
                case 2: // Bottom edge
                    startX = Math.random() * 100;
                    startY = 105;
                    endX = startX + (Math.random() - 0.5) * 80;
                    endY = Math.random() * 40;
                    break;
                default: // Left edge
                    startX = -5;
                    startY = Math.random() * 100;
                    endX = 50 + Math.random() * 40;
                    endY = startY + (Math.random() - 0.5) * 60;
                    break;
            }

            // Clamp positions
            startX = Math.max(0, Math.min(100, startX));
            startY = Math.max(0, Math.min(100, startY));
            endX = Math.max(0, Math.min(100, endX));
            endY = Math.max(0, Math.min(100, endY));

            // Calculate angle to avoid straight vertical/horizontal
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

            // Normalize angle to 0-360
            const normalizedAngle = angle < 0 ? angle + 360 : angle;

            // Check if angle is too close to cardinal directions (within 15 degrees)
            const tooStraight = [0, 90, 180, 270].some(cardinalAngle => {
                const diff = Math.min(
                    Math.abs(normalizedAngle - cardinalAngle),
                    360 - Math.abs(normalizedAngle - cardinalAngle)
                );
                return diff <= 15;
            });

            if (!tooStraight) {
                stars.push({
                    id: stars.length,
                    startX,
                    startY,
                    endX,
                    endY,
                    duration: 3 + Math.random() * 4,
                    delay: Math.random() * 10,
                    size: 1 + Math.random() * 2
                });
            }
        }

        // Fill remaining slots if we couldn't generate enough good angles
        while (stars.length < count) {
            stars.push({
                id: stars.length,
                startX: Math.random() * 100,
                startY: Math.random() * 100,
                endX: Math.random() * 100,
                endY: Math.random() * 100,
                duration: 3 + Math.random() * 4,
                delay: Math.random() * 10,
                size: 1 + Math.random() * 2
            });
        }

        return stars;
    };

    // Generate z-axis shooting stars (coming toward or away from viewer)
    const generateZAxisShootingStars = (count: number) => {
        return Array.from({ length: count }, (_, i) => {
            const comingToward = Math.random() > 0.5; // 50% chance coming toward viewer

            return {
                id: i + 1000, // Offset ID to avoid conflicts
                startX: 20 + Math.random() * 60, // Start in center area
                startY: 20 + Math.random() * 60,
                endX: 20 + Math.random() * 60, // End in center area (minimal xy movement)
                endY: 20 + Math.random() * 60,
                startZ: comingToward ? -500 : 0, // Far away or close
                endZ: comingToward ? 0 : -500, // Close or far away
                duration: 4 + Math.random() * 3, // 4-7 seconds
                delay: Math.random() * 15, // 0-15 second delay (longer for more drama)
                size: 1 + Math.random() * 1.5, // Slightly smaller as they're more dramatic
                isZAxis: true
            };
        });
    };

    useEffect(() => {
        // Only generate stars on client side to avoid hydration mismatch
        // Reduced by about a third from original counts
        const starCounts = {
            light: { far: 55, mid: 40, near: 25 },
            medium: { far: 80, mid: 55, near: 35 },
            heavy: { far: 120, mid: 80, near: 45 }
        };

        const counts = starCounts[density];
        setStars({
            farStars: generateStars(counts.far),
            midStars: generateStars(counts.mid),
            nearStars: generateStars(counts.near)
        });

        // Generate shooting stars (6 regular + 2 z-axis)
        const regularStars = generateShootingStars(6);
        const zAxisStars = generateZAxisShootingStars(2);
        setShootingStars([...regularStars, ...zAxisStars]);
    }, [density]);

    useEffect(() => {
        // Track mouse movement for parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Normalize mouse position to -1 to 1 range
            const normalizedX = (e.clientX - centerX) / centerX;
            const normalizedY = (e.clientY - centerY) / centerY;

            setTargetMousePosition({ x: normalizedX, y: normalizedY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        // Smooth interpolation between current and target mouse positions
        let animationFrameId: number;

        const smoothUpdate = () => {
            setCurrentMousePosition(current => {
                const lerpFactor = 0.025; // Lower = smoother but slower, higher = faster but less smooth

                const deltaX = targetMousePosition.x - current.x;
                const deltaY = targetMousePosition.y - current.y;

                // If we're very close to target, snap to it to avoid infinite tiny movements
                if (Math.abs(deltaX) < 0.001 && Math.abs(deltaY) < 0.001) {
                    return targetMousePosition;
                }

                return {
                    x: current.x + deltaX * lerpFactor,
                    y: current.y + deltaY * lerpFactor
                };
            });

            animationFrameId = requestAnimationFrame(smoothUpdate);
        };

        smoothUpdate();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [targetMousePosition]);

    // Don't render anything until stars are generated (prevents hydration mismatch)
    if (stars.farStars.length === 0 || shootingStars.length === 0) {
        return <div className="starry-background" />;
    }

    // Calculate parallax transforms for each layer using smoothly interpolated position
    const farTransform = `translate(${currentMousePosition.x * 5}px, ${currentMousePosition.y * 5}px)`;
    const midTransform = `translate(${currentMousePosition.x * 15}px, ${currentMousePosition.y * 15}px)`;
    const nearTransform = `translate(${currentMousePosition.x * 25}px, ${currentMousePosition.y * 25}px)`;

    return (
        <div className="starry-background">
            {/* Far layer - smallest, most subtle, minimal parallax */}
            <div
                className="star-layer star-layer-far"
                style={{ transform: farTransform }}
            >
                {stars.farStars.map((star) => (
                    <div
                        key={`far-${star.id}`}
                        className="star star-far"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.animationDelay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Mid layer - medium size, medium parallax */}
            <div
                className="star-layer star-layer-mid"
                style={{ transform: midTransform }}
            >
                {stars.midStars.map((star) => (
                    <div
                        key={`mid-${star.id}`}
                        className="star star-mid"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.animationDelay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Near layer - largest, brightest, maximum parallax */}
            <div
                className="star-layer star-layer-near"
                style={{ transform: nearTransform }}
            >
                {stars.nearStars.map((star) => (
                    <div
                        key={`near-${star.id}`}
                        className="star star-near"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.animationDelay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Shooting stars - randomized positions and directions */}
            <div className="shooting-stars">
                {shootingStars.map((shootingStar) => (
                    <div
                        key={`shooting-${shootingStar.id}`}
                        className={`shooting-star ${shootingStar.isZAxis ? 'shooting-star-z-axis' : 'shooting-star-random'}`}
                        style={{
                            '--start-x': `${shootingStar.startX}%`,
                            '--start-y': `${shootingStar.startY}%`,
                            '--end-x': `${shootingStar.endX}%`,
                            '--end-y': `${shootingStar.endY}%`,
                            '--start-z': shootingStar.isZAxis ? `${shootingStar.startZ}px` : '0px',
                            '--end-z': shootingStar.isZAxis ? `${shootingStar.endZ}px` : '0px',
                            '--duration': `${shootingStar.duration}s`,
                            '--delay': `${shootingStar.delay}s`,
                            '--size': `${shootingStar.size}px`,
                            left: `${shootingStar.startX}%`,
                            top: `${shootingStar.startY}%`,
                            width: `${shootingStar.size}px`,
                            height: `${shootingStar.size}px`,
                            animationDuration: `${shootingStar.duration}s`,
                            animationDelay: `${shootingStar.delay}s`
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </div>
    );
} 