'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './ModernBlackHoleBackground.css';

interface ModernBlackHoleBackgroundProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
}

// Vertex shader for the accretion disk
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

// Fragment shader for the accretion disk with intense plasma effects
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
        
        // Create dynamic accretion disk (original size)
        float edge = smoothstep(0.69, 0.75, dist);
        float innerEdge = smoothstep(0.345, 0.46, dist);
        
        float disk = 1.0 - edge;
        disk *= innerEdge;
        
        // Stronger black hole center - ensure no artifacts
        float blackHole = 1.0 - smoothstep(0.0, 0.35, dist);
        disk *= (1.0 - blackHole);
        
        // Add intense radial plasma gradient
        float radial = 1.0 - smoothstep(0.345, 0.75, dist);
        radial = pow(radial, 1.2);
        disk *= radial;
        
        // Plasma effects limited to disk area only - stricter masking
        float plasmaIntensity = 0.0;
        float flameIntensity = 0.0;
        float surfaceIntensity = 0.0;
        
        // Only calculate plasma effects where disk actually exists
        if (disk > 0.1) {
            plasmaIntensity = plasmaTurbulence(uv * 4.0, time, disk); // Lower frequency for larger disk
            flameIntensity = flameFlicker(uv, time, disk);
            surfaceIntensity = plasmaIntensity * flameIntensity;
            disk *= (0.8 + 0.8 * surfaceIntensity);
        }
        
        // Intense pulsing with plasma rhythm - increased amplitude
        float pulse = 1.0 + 0.3 * sin(time * 3.0);
        pulse += 0.15 * sin(time * 7.0);
        pulse += 0.08 * sin(time * 11.0);
        disk *= pulse;
        
        // Declare variables outside conditional block for alpha calculations (original size)
        float rimMask = smoothstep(0.72, 0.75, dist);
        
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
            
            // Add intense outer glow - increased intensity (only where disk exists) (original size)
            float outerGlow = smoothstep(0.72, 0.75, dist) * 3.0 * disk;
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

// Removed unused particle shaders to satisfy lint rules

export default function ModernBlackHoleBackground({
    scrollProgress = 0,
    theme = 'purple'
}: ModernBlackHoleBackgroundProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const diskRef = useRef<THREE.Mesh | null>(null);
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

        // Star/particle system disabled for now
        // const starCount = 40;
        // const starGeometry = new THREE.BufferGeometry();
        // const starPositions = new Float32Array(starCount * 3);
        // const starColors = new Float32Array(starCount * 3);

        // for (let i = 0; i < starCount; i++) {
        //     // Place stars in the four corners of the screen
        //     const corner = Math.floor(i / 10); // 10 stars per corner
        //     const cornerIndex = i % 10;

        //     let x, y;
        //     const cornerDistance = 0.3 + Math.random() * 0.15; // Distance from exact corner
        //     const cornerSpread = 0.2 + Math.random() * 0.15; // Spread within corner area

        //     switch (corner) {
        //         case 0: // Top-left
        //             x = (-min / 2) + cornerDistance * min + cornerSpread * min * Math.random();
        //             y = (min / 2) - cornerDistance * min - cornerSpread * min * Math.random();
        //             break;
        //         case 1: // Top-right
        //             x = (min / 2) - cornerDistance * min - cornerSpread * min * Math.random();
        //             y = (min / 2) - cornerDistance * min - cornerSpread * min * Math.random();
        //             break;
        //         case 2: // Bottom-left
        //             x = (-min / 2) + cornerDistance * min + cornerSpread * min * Math.random();
        //             y = (-min / 2) + cornerDistance * min + cornerSpread * min * Math.random();
        //             break;
        //         case 3: // Bottom-right
        //         default:
        //             x = (min / 2) - cornerDistance * min - cornerSpread * min * Math.random();
        //             y = (-min / 2) + cornerDistance * min + cornerSpread * min * Math.random();
        //             break;
        //     }

        //     starPositions[i * 3] = x;
        //     starPositions[i * 3 + 1] = y;
        //     starPositions[i * 3 + 2] = 0;

        //     // Mix of white and theme-colored stars
        //     const isThemed = Math.random() > 0.8;
        //     if (isThemed) {
        //         const color = themeColors[theme].accent;
        //         starColors[i * 3] = color.r * 0.7;
        //         starColors[i * 3 + 1] = color.g * 0.7;
        //         starColors[i * 3 + 2] = color.b * 0.7;
        //     } else {
        //         const brightness = 0.5 + Math.random() * 0.4;
        //         starColors[i * 3] = brightness;
        //         starColors[i * 3 + 1] = brightness;
        //         starColors[i * 3 + 2] = brightness;
        //     }
        // }

        // starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        // starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        // Star texture and material creation disabled
        // const createStarTexture = () => {
        //     const canvas = document.createElement('canvas');
        //     canvas.width = 16;
        //     canvas.height = 16;
        //     const ctx = canvas.getContext('2d')!;

        //     // Create bright center point for stars
        //     const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        //     gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        //     gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        //     gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        //     ctx.fillStyle = gradient;
        //     ctx.fillRect(0, 0, 16, 16);

        //     return new THREE.CanvasTexture(canvas);
        // };

        // // Star material
        // const starMaterial = new THREE.PointsMaterial({
        //     size: min * 0.003, // Smaller for distant stars
        //     map: createStarTexture(),
        //     transparent: true,
        //     opacity: 0.7,
        //     vertexColors: true,
        //     blending: THREE.AdditiveBlending,
        //     sizeAttenuation: false
        // });

        // const stars = new THREE.Points(starGeometry, starMaterial);
        // scene.add(stars);
        // particlesRef.current = stars; // Store stars reference for now

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Animation loop
        const startTime = Date.now();
        const animate = () => {
            const time = (Date.now() - startTime) / 1000;

            // Update disk uniforms
            if (diskMaterial.uniforms) {
                diskMaterial.uniforms.time.value = time;
                diskMaterial.uniforms.scrollProgress.value = scrollProgress;
                diskMaterial.uniforms.turbulence.value = 0.5; // Fixed value, no scroll intensity
                diskMaterial.uniforms.diskIntensity.value = 1.0; // Fixed value, no scroll intensity
                diskMaterial.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
            }

            // Star animation disabled
            // if (particlesRef.current) {
            //     const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;

            //     for (let i = 0; i < starCount; i++) {
            //         // Subtle twinkling by adjusting brightness
            //         const twinkle = 0.8 + 0.2 * Math.sin(time * 2 + i * 0.5);

            //         // Update star colors with twinkling
            //         if (i % 5 === 0) { // Some themed stars
            //             const color = themeColors[theme].accent;
            //             colors[i * 3] = color.r * 0.7 * twinkle;
            //             colors[i * 3 + 1] = color.g * 0.7 * twinkle;
            //             colors[i * 3 + 2] = color.b * 0.7 * twinkle;
            //         } else {
            //             const brightness = 0.6 * twinkle;
            //             colors[i * 3] = brightness;
            //             colors[i * 3 + 1] = brightness;
            //             colors[i * 3 + 2] = brightness;
            //         }
            //     }

            //     particlesRef.current.geometry.attributes.color.needsUpdate = true;
            // }

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

            // Star resize handling disabled
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

    // Star theme updates disabled
    // useEffect(() => {
    //     if (particlesRef.current) {
    //         const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;

    //         for (let i = 0; i < 40; i++) { // starCount
    //             if (i % 5 === 0) { // Some themed stars
    //                 const color = themeColors[theme].accent;
    //                 colors[i * 3] = color.r * 0.7;
    //                 colors[i * 3 + 1] = color.g * 0.7;
    //                 colors[i * 3 + 2] = color.b * 0.7;
    //             }
    //         }

    //         particlesRef.current.geometry.attributes.color.needsUpdate = true;
    //     }
    // }, [theme, themeColors]);

    return (
        <div
            ref={mountRef}
            className="modern-blackhole-container"
        />
    );
} 