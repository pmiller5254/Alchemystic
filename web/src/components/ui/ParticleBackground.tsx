'use client';

import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 240;
const PARTICLE_SIZE_MIN = 1;
const PARTICLE_SIZE_MAX = 4;
const FLOAT_SPEED = 0.3; // Much slower movement
const EDGE_BIAS = 0.85; // Bias toward edges (0.85 = 85% of particles near edges)

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

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

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

                // Calculate opacity based on life cycle
                const lifeProgress = particle.life / particle.maxLife;
                const fadeOpacity = Math.sin(lifeProgress * Math.PI) * particle.opacity;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = fadeOpacity;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

                // Create a subtle gradient effect
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2
                );
                gradient.addColorStop(0, '#a78bfa'); // Bright center
                gradient.addColorStop(0.7, '#8b5cf6'); // Medium purple
                gradient.addColorStop(1, 'transparent'); // Fade to transparent

                ctx.fillStyle = gradient;
                ctx.shadowColor = '#a21caf';
                ctx.shadowBlur = particle.size * 3;
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
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.9 }}
        />
    );
} 