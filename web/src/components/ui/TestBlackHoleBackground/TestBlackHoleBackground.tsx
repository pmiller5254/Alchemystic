'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './TestBlackHoleBackground.css';

interface TestBlackHoleBackgroundProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
}

// Vertex shader for the accretion disk
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader for the accretion disk with swirling effect
const fragmentShader = `
uniform float time;
uniform float scrollProgress;
uniform vec3 themeColor;
uniform vec3 themeColorSecondary;
uniform float diskIntensity;
uniform float turbulence;
uniform float uMinDimension;

varying vec2 vUv;
varying vec3 vPosition;

// Noise function
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Fractal Brownian motion for more complex patterns
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv - 0.5;
    float dist = length(st);
    float angle = atan(st.y, st.x);
    
    // Create spiral pattern
    float spiral = sin(angle * 3.0 + time * 2.0 - dist * 10.0);
    
    // Add turbulence based on scroll
    float turb = fbm(st * 4.0 + time * 0.5) * turbulence;
    
    // Create ring structure
    float ring = smoothstep(0.1, 0.3, dist) * smoothstep(0.5, 0.4, dist);
    
    // Combine effects
    float intensity = ring * (0.5 + 0.5 * spiral) * (0.7 + 0.3 * turb);
    intensity *= diskIntensity;
    
    // Color mixing based on theme
    vec3 color = mix(themeColorSecondary, themeColor, intensity);
    color += vec3(0.1, 0.05, 0.0) * intensity; // Add some warmth
    
    // Fade based on scroll progress
    float alpha = intensity * (0.3 + 0.7 * scrollProgress);
    
    gl_FragColor = vec4(color, alpha);
}
`;

// Particle vertex shader
const particleVertexShader = `
attribute float size;
attribute float speed;
attribute float offset;
uniform float time;

void main() {
    vec3 pos = position;
    
    // Orbital motion
    float angle = pos.z + time * speed;
    float radius = length(pos.xy);
    pos.x = cos(angle) * radius;
    pos.y = sin(angle) * radius;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = size * (300.0 / -mvPosition.z);
}
`;

// Particle fragment shader
const particleFragmentShader = `
void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - (dist * 2.0);
    alpha = pow(alpha, 2.0);
    
    gl_FragColor = vec4(1.0, 0.8, 0.6, alpha * 0.8);
}
`;

export default function TestBlackHoleBackground({
    scrollProgress = 0,
    theme = 'purple'
}: TestBlackHoleBackgroundProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const diskRef = useRef<THREE.Mesh | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const animationRef = useRef<number | null>(null);

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

    useEffect(() => {
        if (!mountRef.current) return;

        const mountElement = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Get viewport size
        const getSize = () => {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                min: Math.min(window.innerWidth, window.innerHeight)
            };
        };

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        const { width, height, min } = getSize();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.width = '100vw';
        renderer.domElement.style.height = '100vh';
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        // Create camera
        const camera = new THREE.OrthographicCamera(
            -min / 2, min / 2, min / 2, -min / 2, 0.1, 1000
        );
        camera.position.z = 1;
        cameraRef.current = camera;

        // Create accretion disk geometry
        const geometry = new THREE.PlaneGeometry(min, min);
        const diskMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            uniforms: {
                time: { value: 0 },
                scrollProgress: { value: scrollProgress },
                themeColor: { value: themeColors[theme].primary },
                themeColorSecondary: { value: themeColors[theme].secondary },
                diskIntensity: { value: 1.0 },
                turbulence: { value: 0.5 },
                uMinDimension: { value: min },
            }
        });

        const disk = new THREE.Mesh(geometry, diskMaterial);
        scene.add(disk);
        diskRef.current = disk;

        // Create particle system
        const particleCount = 200;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);
        const offsets = new Float32Array(particleCount);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.1;
            const radius = 0.3 + Math.random() * 0.4; // Normal particle radius

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius;
            positions[i * 3 + 2] = angle;

            sizes[i] = 0.02 + Math.random() * 0.03; // Normal particle size
            speeds[i] = 0.5 + Math.random() * 0.5;
            offsets[i] = Math.random() * Math.PI * 2;

            const color = themeColors[theme].accent;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        particleGeometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.ShaderMaterial({
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        particlesRef.current = particles;

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Animation loop
        const startTime = Date.now();
        const animate = () => {
            const time = (Date.now() - startTime) / 1000;

            // Update uniforms
            if (diskMaterial.uniforms) {
                diskMaterial.uniforms.time.value = time;
                diskMaterial.uniforms.scrollProgress.value = scrollProgress;
                diskMaterial.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
                diskMaterial.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;
                diskMaterial.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
            }

            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            const { width, height, min } = getSize();
            renderer.setSize(width, height);
            renderer.domElement.style.width = '100vw';
            renderer.domElement.style.height = '100vh';
            camera.left = -min / 2;
            camera.right = min / 2;
            camera.top = min / 2;
            camera.bottom = -min / 2;
            camera.updateProjectionMatrix();
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
    }, [theme, themeColors, scrollProgress]);

    // Update scroll progress with smooth transitions - using useGSAP for better React integration
    useGSAP(() => {
        if (diskRef.current?.material) {
            const material = diskRef.current.material as THREE.ShaderMaterial;
            gsap.to(material.uniforms.scrollProgress, {
                value: scrollProgress,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [scrollProgress]);

    return (
        <div
            ref={mountRef}
            className="test-blackhole-container"
        />
    );
} 