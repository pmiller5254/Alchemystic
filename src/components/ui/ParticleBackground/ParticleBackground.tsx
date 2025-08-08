'use client';

import { useEffect, useRef } from 'react';
import './ParticleBackground.css';

// Constants for the particle system
const PARTICLE_COUNT = 250;
const PARTICLE_SIZE_MIN = 1;
const PARTICLE_SIZE_MAX = 3;
const FLOAT_SPEED = 0.3;
const EDGE_BIAS = 0.7; // 70% chance to place particles near edges

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
}

interface ParticleBackgroundProps {
    scrollProgress?: number;
    colorA?: string; // e.g. '#a78bfa' (purple)
    colorB?: string; // e.g. '#38bdf8' (blue)
}

export default function ParticleBackground({ scrollProgress = 0, colorA = '#a78bfa', colorB = '#38bdf8' }: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let centerX = width / 2;
        let centerY = height / 2;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
            canvas.width = width;
            canvas.height = height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Function to generate edge-biased positions
        const generateEdgePosition = () => {
            const rand = Math.random();

            if (rand < EDGE_BIAS) {
                // Place particles near edges and corners
                const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
                const edgeOffset = Math.random() * 0.3; // How far from edge (0-30% of screen)

                switch (side) {
                    case 0: // Top edge
                        return {
                            x: Math.random() * width,
                            y: Math.random() * (height * edgeOffset)
                        };
                    case 1: // Right edge
                        return {
                            x: width - (Math.random() * (width * edgeOffset)),
                            y: Math.random() * height
                        };
                    case 2: // Bottom edge
                        return {
                            x: Math.random() * width,
                            y: height - (Math.random() * (height * edgeOffset))
                        };
                    case 3: // Left edge
                        return {
                            x: Math.random() * (width * edgeOffset),
                            y: Math.random() * height
                        };
                }
            } else {
                // Place some particles in corners
                const corner = Math.floor(Math.random() * 4); // 0: top-left, 1: top-right, 2: bottom-right, 3: bottom-left
                const cornerSize = Math.min(width, height) * 0.2; // Corner area size

                switch (corner) {
                    case 0: // Top-left
                        return {
                            x: Math.random() * cornerSize,
                            y: Math.random() * cornerSize
                        };
                    case 1: // Top-right
                        return {
                            x: width - (Math.random() * cornerSize),
                            y: Math.random() * cornerSize
                        };
                    case 2: // Bottom-right
                        return {
                            x: width - (Math.random() * cornerSize),
                            y: height - (Math.random() * cornerSize)
                        };
                    case 3: // Bottom-left
                        return {
                            x: Math.random() * cornerSize,
                            y: height - (Math.random() * cornerSize)
                        };
                }
            }

            // Fallback to random position
            return {
                x: Math.random() * width,
                y: Math.random() * height
            };
        };

        // Initialize particles with edge-biased positions
        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
            const position = generateEdgePosition();
            return {
                x: position.x,
                y: position.y,
                vx: (Math.random() - 0.5) * FLOAT_SPEED,
                vy: (Math.random() - 0.5) * FLOAT_SPEED,
                size: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
                opacity: Math.random() * 0.6 + 0.2,
                life: Math.random() * 100,
                maxLife: 100
            };
        });

        // For smooth spin, lerp the rotation angle
        let currentAngle = 0;
        const maxAngle = Math.PI * 2; // One full spin per scroll

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Smoothly interpolate rotation angle with reduced sensitivity
            const targetAngle = scrollProgress * maxAngle * 0.5; // Reduced rotation speed
            currentAngle += (targetAngle - currentAngle) * 0.05; // Reduced lerp factor for better performance
            rotationRef.current = currentAngle;

            particles.forEach((particle, index) => {
                // Update particle position with gentle drift
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Add subtle random movement
                particle.vx += (Math.random() - 0.5) * 0.01;
                particle.vy += (Math.random() - 0.5) * 0.01;

                // Keep velocities within reasonable bounds
                particle.vx = Math.max(-FLOAT_SPEED, Math.min(FLOAT_SPEED, particle.vx));
                particle.vy = Math.max(-FLOAT_SPEED, Math.min(FLOAT_SPEED, particle.vy));

                // Wrap particles around screen edges
                if (particle.x < -50) particle.x = width + 50;
                if (particle.x > width + 50) particle.x = -50;
                if (particle.y < -50) particle.y = height + 50;
                if (particle.y > height + 50) particle.y = -50;

                // Update life cycle
                particle.life += 0.5;
                if (particle.life > particle.maxLife) {
                    particle.life = 0;
                    // Reset particle to a new edge-biased position
                    const position = generateEdgePosition();
                    particle.x = position.x;
                    particle.y = position.y;
                    particle.vx = (Math.random() - 0.5) * FLOAT_SPEED;
                    particle.vy = (Math.random() - 0.5) * FLOAT_SPEED;
                    particle.size = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
                    particle.opacity = Math.random() * 0.6 + 0.2;
                }

                // Calculate rotated position
                const dx = particle.x - centerX;
                const dy = particle.y - centerY;
                const r = Math.sqrt(dx * dx + dy * dy);
                const theta = Math.atan2(dy, dx) + currentAngle;
                const rotatedX = centerX + r * Math.cos(theta);
                const rotatedY = centerY + r * Math.sin(theta);

                // Color assignment: first N particles are colorA, rest are colorB
                const colorThreshold = Math.floor(PARTICLE_COUNT * (1 - scrollProgress));
                const useColorA = index < colorThreshold;
                const particleColor = useColorA ? colorA : colorB;

                // Calculate opacity based on life cycle and scroll progress
                const lifeProgress = particle.life / particle.maxLife;
                const fadeOpacity = Math.sin(lifeProgress * Math.PI) * particle.opacity;
                const scrollOpacity = fadeOpacity * (0.3 + 0.7 * scrollProgress);

                // Simplified rendering without gradients and shadows
                ctx.save();
                ctx.globalAlpha = scrollOpacity;
                ctx.beginPath();
                ctx.arc(rotatedX, rotatedY, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [scrollProgress, colorA, colorB]);

    return (
        <canvas
            ref={canvasRef}
            className="particle-canvas"
        />
    );
} 