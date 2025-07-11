'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './InvertedBlackHoleBackground.css';

interface InvertedBlackHoleBackgroundProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
}

// Vertex shader for the inverted black hole - EXACT copy from ModernBlackHoleBackground
const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vDistance;
    
    void main() {
        vUv = uv;
        vPosition = position;
        vDistance = length(position.xy);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment shader - EXACT ModernBlackHoleBackground plasma but as filled circle
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
    varying float vDistance;
    
    // Advanced noise functions for plasma simulation
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    
    // Plasma turbulence function (limited to disk area)
    float plasmaTurbulence(vec2 uv, float time, float diskMask) {
        float turbulence = 0.0;
        
        // Only calculate turbulence where disk exists
        if (diskMask > 0.1) {
            turbulence += noise(uv * 8.0 + vec2(time * 0.5, time * 0.3)) * 0.5;
            turbulence += noise(uv * 16.0 + vec2(time * 0.8, time * 0.6)) * 0.25;
            turbulence += noise(uv * 32.0 + vec2(time * 1.2, time * 0.9)) * 0.125;
        }
        
        return turbulence * diskMask;
    }
    
    // Flame flicker function (limited to disk area)
    float flameFlicker(vec2 uv, float time, float diskMask) {
        float flicker = 0.0;
        
        // Only calculate flicker where disk exists
        if (diskMask > 0.1) {
            flicker += sin(time * 8.0 + uv.x * 20.0) * 0.3;
            flicker += sin(time * 12.0 + uv.y * 15.0) * 0.2;
            flicker += sin(time * 6.0 + uv.x * 25.0 + uv.y * 18.0) * 0.25;
        }
        
        return flicker * diskMask;
    }
    
    void main() {
        vec2 uv = vUv;
        vec2 center = vec2(0.5);
        vec2 centeredUv = uv - center;
        float dist = length(centeredUv);
        float angle = atan(centeredUv.y, centeredUv.x);
        
        // Create filled circle - same size as zoomed out ModernBlackHoleBackground
        float edge = smoothstep(0.35, 0.4, dist);  // Match ModernBlackHoleBackground zoomed size
        // REMOVED: float innerEdge = smoothstep(0.345, 0.46, dist); - this made the ring hollow
        
        float disk = 1.0 - edge;
        // REMOVED: disk *= innerEdge; - this created the hollow center
        
        // Add intense radial plasma gradient
        float radial = 1.0 - smoothstep(0.18, 0.4, dist);  // Match ModernBlackHoleBackground zoomed size
        radial = pow(radial, 1.2);
        disk *= radial;
        
        // Plasma effects limited to disk area only - stricter masking
        float plasmaIntensity = 0.0;
        float flameIntensity = 0.0;
        float surfaceIntensity = 0.0;
        
        // Only calculate plasma effects where disk actually exists
        if (disk > 0.1) {
            plasmaIntensity = plasmaTurbulence(uv * 4.0, time, disk) * (1.0 + 0.6 * scrollProgress);
            flameIntensity = flameFlicker(uv, time, disk) * (0.8 + 0.6 * scrollProgress);
            surfaceIntensity = plasmaIntensity * flameIntensity;
            disk *= (0.8 + 0.8 * surfaceIntensity);
        }
        
        // Intense pulsing with plasma rhythm - increased amplitude
        float pulse = 1.0 + 0.3 * sin(time * 3.0);
        pulse += 0.15 * sin(time * 7.0);
        pulse += 0.08 * sin(time * 11.0);
        disk *= pulse;
        
        // Declare variables outside conditional block for alpha calculations (zoomed out)
        float rimMask = smoothstep(0.38, 0.4, dist);  // Match ModernBlackHoleBackground zoomed size
        
        // Only apply colors and effects where disk exists
        vec3 finalColor = vec3(0.0);
        
        if (disk > 0.01) {
            // Create intense plasma color gradient for main disk
            vec3 plasmaColor = mix(themeColorSecondary * 0.5, themeColor, dist);
            
            // Add intense plasma surface colors
            vec3 surfaceColor = mix(themeColor * 2.0, themeColor * 4.0, surfaceIntensity);
            plasmaColor = mix(plasmaColor, surfaceColor, surfaceIntensity * 0.7);
            
            // Flame rim using pre-declared rimMask
            float flameRim = flameIntensity * rimMask;
            
            // Flame colors for rim only - increased intensity
            vec3 flameColor = mix(themeColorSecondary, vec3(1.0, 0.8, 0.4), flameRim);
            
            // Combine main disk with rim flames
            finalColor = plasmaColor * disk * diskIntensity * 1.5;
            finalColor = mix(finalColor, flameColor, flameRim * 0.8);
            
            // Add intense outer glow - increased intensity (only where disk exists) (zoomed out)
            float outerGlow = smoothstep(0.38, 0.4, dist) * 3.0 * disk;  // Match ModernBlackHoleBackground zoomed size
            finalColor += themeColor * outerGlow * diskIntensity;
        }
        
        // Calculate main disk alpha (for the inner disk) - restored brightness
        float diskAlpha = clamp(surfaceIntensity, 0.7, 1.0);
        
        // Calculate rim alpha (for the outermost rim only) - restored brightness
        float rimAlpha = rimMask * clamp(abs(flameIntensity), 0.7, 1.0);
        
        // Blend the two alphas: rim overrides disk where rimMask > 0
        float finalAlpha = mix(diskAlpha, rimAlpha, rimMask);
        finalAlpha = clamp(finalAlpha, 0.0, 1.0);
        
        gl_FragColor = vec4(finalColor, finalAlpha);
    }
`;





export default function InvertedBlackHoleBackground({
    scrollProgress = 0,
    theme = 'purple'
}: InvertedBlackHoleBackgroundProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const diskRef = useRef<THREE.Mesh | null>(null);

    const animationRef = useRef<number | null>(null);

    // Theme colors - EXACT copy from ModernBlackHoleBackground
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

        // Scene setup - EXACT copy from ModernBlackHoleBackground
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Get viewport size - EXACT copy from ModernBlackHoleBackground
        const getSize = () => {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                min: Math.min(window.innerWidth, window.innerHeight)
            };
        };

        // Create renderer with transparent background (CSS handles black background)
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true, // Enable for better visual quality
            powerPreference: 'high-performance',
        });
        const { width, height, min } = getSize();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Allow higher pixel ratio
        renderer.domElement.style.width = '100vw';
        renderer.domElement.style.height = '100vh';
        renderer.setClearColor(0x000000, 0); // Transparent background - CSS handles black void
        rendererRef.current = renderer;

        // Create camera - match ModernBlackHoleBackground setup exactly
        const camera = new THREE.OrthographicCamera(
            -min / 2, min / 2, min / 2, -min / 2, 0.1, 1000
        );
        camera.position.z = 1;
        cameraRef.current = camera;

        // Create accretion disk geometry - EXACT copy from ModernBlackHoleBackground
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

        // Particle effects disabled for now

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Smooth animation loop without flickering optimizations
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

            // Particle animation disabled

            // Render the scene
            renderer.render(scene, camera);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize - match ModernBlackHoleBackground
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
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [scrollProgress]);

    // Update theme colors
    useEffect(() => {
        if (diskRef.current?.material) {
            const diskMaterial = diskRef.current.material as THREE.ShaderMaterial;
            const colors = themeColors[theme];

            // Update disk material theme colors
            diskMaterial.uniforms.themeColor.value = colors.primary;
            diskMaterial.uniforms.themeColorSecondary.value = colors.secondary;
        }
    }, [theme, themeColors]);

    return (
        <div
            ref={mountRef}
            className="inverted-black-hole-container"
        />
    );
} 