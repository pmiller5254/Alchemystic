'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import './PhysicsParticleSystem.css';

interface PhysicsParticleSystemProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
    particleCount?: number;
}

// Physics particle class
class PhysicsParticle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    mass: number;
    size: number;
    color: THREE.Color;
    life: number;
    maxLife: number;

    constructor(
        position: THREE.Vector3,
        velocity: THREE.Vector3,
        mass: number,
        size: number,
        color: THREE.Color,
        life: number
    ) {
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.mass = mass;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update(deltaTime: number, blackHolePosition: THREE.Vector3, blackHoleMass: number) {
        // Calculate gravitational force
        const direction = this.position.clone().sub(blackHolePosition);
        const distance = Math.max(direction.length(), 0.1);

        // Gravitational acceleration = G * M / r^2
        const G = 1.0; // Gravitational constant (scaled for our simulation)
        const acceleration = G * blackHoleMass / (distance * distance);

        // Apply gravitational pull
        direction.normalize().multiplyScalar(-acceleration * deltaTime);
        this.velocity.add(direction);

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Decay life over time
        this.life -= deltaTime;
    }

    isDead(): boolean {
        return this.life <= 0 || this.position.length() < 0.05; // Too close to black hole
    }

    getAlpha(): number {
        return Math.max(0, this.life / this.maxLife);
    }
}

// Shader code
const physicsVertexShader = `
    attribute float size;
    attribute float alpha;
    attribute float life;
    varying float vAlpha;
    varying float vLife;
    
    void main() {
        vAlpha = alpha;
        vLife = life;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size based on distance and life
        gl_PointSize = size * (300.0 / -mvPosition.z) * (0.5 + 0.5 * vLife);
    }
`;

const physicsFragmentShader = `
    varying float vAlpha;
    varying float vLife;
    
    void main() {
        // Create circular particle
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Fade from center
        float alpha = (1.0 - dist * 2.0) * vAlpha * (0.3 + 0.7 * vLife);
        
        // Color with some energy effect
        vec3 color = vec3(0.8, 0.9, 1.0);
        color += 0.3 * sin(vLife * 10.0);
        
        gl_FragColor = vec4(color, alpha);
    }
`;

export default function PhysicsParticleSystem({
    scrollProgress = 0,
    theme = 'purple',
    particleCount = 150
}: PhysicsParticleSystemProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef_ = useRef<PhysicsParticle[]>([]);
    const lastTimeRef = useRef(0);

    // Theme colors
    const themeColors = useMemo(() => ({
        purple: {
            primary: new THREE.Color(0xa78bfa),
            secondary: new THREE.Color(0x6d28d9),
            accent: new THREE.Color(0xf472b6)
        },
        blue: {
            primary: new THREE.Color(0x3b82f6),
            secondary: new THREE.Color(0x1d4ed8),
            accent: new THREE.Color(0x60a5fa)
        },
        forest: {
            primary: new THREE.Color(0x22c55e),
            secondary: new THREE.Color(0x16a34a),
            accent: new THREE.Color(0x4ade80)
        },
        gold: {
            primary: new THREE.Color(0xf59e0b),
            secondary: new THREE.Color(0xd97706),
            accent: new THREE.Color(0xfbbf24)
        }
    }), []);

    // Initialize particles
    const initializeParticles = useMemo(() => {
        const particles: PhysicsParticle[] = [];
        const colors = [themeColors[theme].primary, themeColors[theme].secondary, themeColors[theme].accent];

        for (let i = 0; i < particleCount; i++) {
            // Create particles in a ring around the black hole
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.1;
            const radius = 0.4 + Math.random() * 0.3;

            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );

            // Calculate orbital velocity for stable orbits
            const orbitalSpeed = Math.sqrt(1.0 / radius) * (0.8 + Math.random() * 0.4);
            const velocity = new THREE.Vector3(
                -Math.sin(angle) * orbitalSpeed,
                Math.cos(angle) * orbitalSpeed,
                0
            );

            // Add some random velocity for more dynamic motion
            velocity.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                0
            ));

            const mass = 0.1 + Math.random() * 0.2;
            const size = 0.015 + Math.random() * 0.02;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = 10 + Math.random() * 20;

            particles.push(new PhysicsParticle(position, velocity, mass, size, color, life));
        }

        return particles;
    }, [particleCount, theme, themeColors]);

    useEffect(() => {
        if (!mountRef.current) return;

        // Capture mount element for cleanup
        const mountElement = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera setup
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);
        camera.position.z = 1;
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        // Initialize physics particles
        particlesRef_.current = [...initializeParticles];

        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);
        const colors = new Float32Array(particleCount * 3);
        const lives = new Float32Array(particleCount);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('life', new THREE.BufferAttribute(lives, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: physicsVertexShader,
            fragmentShader: physicsFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        particlesRef.current = particles;

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Animation loop
        const blackHolePosition = new THREE.Vector3(0, 0, 0);
        const blackHoleMass = 2.0;

        const animate = (currentTime: number) => {
            const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.016);
            lastTimeRef.current = currentTime;

            // Update physics particles
            const particles = particlesRef_.current;
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.update(deltaTime, blackHolePosition, blackHoleMass);

                // Respawn dead particles
                if (particle.isDead()) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.6 + Math.random() * 0.2;

                    particle.position.set(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius,
                        0
                    );

                    const orbitalSpeed = Math.sqrt(1.0 / radius) * (0.8 + Math.random() * 0.4);
                    particle.velocity.set(
                        -Math.sin(angle) * orbitalSpeed,
                        Math.cos(angle) * orbitalSpeed,
                        0
                    );

                    particle.life = 10 + Math.random() * 20;
                    particle.maxLife = particle.life;
                }
            }

            // Update geometry attributes
            const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
            const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;
            const alphaAttr = geometry.getAttribute('alpha') as THREE.BufferAttribute;
            const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
            const lifeAttr = geometry.getAttribute('life') as THREE.BufferAttribute;

            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];

                positionAttr.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
                // Keep particles visible throughout scroll - use a more subtle size variation
                sizeAttr.setX(i, particle.size * (0.8 + 0.2 * scrollProgress));
                alphaAttr.setX(i, particle.getAlpha());
                colorAttr.setXYZ(i, particle.color.r, particle.color.g, particle.color.b);
                lifeAttr.setX(i, particle.life);
            }

            positionAttr.needsUpdate = true;
            sizeAttr.needsUpdate = true;
            alphaAttr.needsUpdate = true;
            colorAttr.needsUpdate = true;
            lifeAttr.needsUpdate = true;

            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate(0);

        // Handle resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const aspect = width / height;

            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (mountElement && renderer.domElement) {
                mountElement.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [initializeParticles, scrollProgress, particleCount]);

    return (
        <div
            ref={mountRef}
            className="physics-particle-container"
        />
    );
} 