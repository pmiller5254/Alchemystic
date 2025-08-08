'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './MultiSphereSystem.css';

interface MultiSphere3DSpaceProps {
    scrollProgress?: number;
}

interface SphereData {
    theme: 'purple' | 'blue' | 'forest' | 'gold';
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
}

export default function MultiSphere3DSpace({ scrollProgress = 0 }: MultiSphere3DSpaceProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const spheresRef = useRef<SphereData[]>([]);
    const animationRef = useRef<number | null>(null);

    // Theme colors for each sphere
    const themeColors = {
        purple: { primary: new THREE.Color(0x8b5cf6), secondary: new THREE.Color(0xa855f7) },
        blue: { primary: new THREE.Color(0x3b82f6), secondary: new THREE.Color(0x60a5fa) },
        forest: { primary: new THREE.Color(0x10b981), secondary: new THREE.Color(0x34d399) },
        gold: { primary: new THREE.Color(0xf59e0b), secondary: new THREE.Color(0xfbbf24) }
    };

    // Vertex shader (same as InvertedBlackHole3D)
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normal;
            vDistance = length(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Fragment shader (exact copy from InvertedBlackHole3D)
    const fragmentShader = `
        uniform float time;
        uniform float scrollProgress;
        uniform vec3 themeColor;
        uniform vec3 themeColorSecondary;
        uniform float diskIntensity;
        uniform float turbulence;
        uniform float uMinDimension;
        uniform bool debugSeam;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vDistance;
        
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
        float sphericalPlasmaTurbulence(vec2 uv, vec3 normal, float time) {
            float turbulence = 0.0;
            vec2 sphereUv = uv * 3.14159;
            turbulence += noise(sphereUv * 4.0 + vec2(time * 0.5, time * 0.3)) * 0.5;
            turbulence += noise(sphereUv * 8.0 + vec2(time * 0.8, time * 0.6)) * 0.25;
            turbulence += noise(sphereUv * 16.0 + vec2(time * 1.2, time * 0.9)) * 0.125;
            turbulence += noise(normal.xy * 10.0 + time * 0.4) * 0.3;
            return turbulence;
        }
        float sphericalFlameFlicker(vec2 uv, vec3 normal, float time) {
            float flicker = 0.0;
            flicker += sin(time * 8.0 + uv.x * 20.0 + normal.z * 5.0) * 0.3;
            flicker += sin(time * 12.0 + uv.y * 15.0 + normal.x * 4.0) * 0.2;
            flicker += sin(time * 6.0 + uv.x * 25.0 + uv.y * 18.0 + normal.y * 3.0) * 0.25;
            return flicker;
        }
        void main() {
            vec2 uv = vUv;
            vec3 normal = normalize(vNormal);
            float seamDebug = 0.0;
            if (debugSeam && (abs(uv.x - 0.0) < 0.02 || abs(uv.x - 1.0) < 0.02)) {
                seamDebug = 1.0;
            }
            uv.x = uv.x + 0.01;
            float sphereIntensity = 1.0;
            float normalLighting = dot(normal, vec3(0.0, 1.0, 0.5)) * 0.3 + 0.7;
            sphereIntensity = mix(sphereIntensity, normalLighting, 0.1);
            float plasmaIntensity = sphericalPlasmaTurbulence(uv, normal, time) * (1.0 + 0.6 * scrollProgress);
            float flameIntensity = sphericalFlameFlicker(uv, normal, time) * (0.8 + 0.6 * scrollProgress);
            float surfaceIntensity = plasmaIntensity * flameIntensity;
            float finalIntensity = sphereIntensity * (0.8 + 0.8 * surfaceIntensity);
            float pulse = 1.0 + 0.3 * sin(time * 3.0);
            pulse += 0.15 * sin(time * 7.0);
            pulse += 0.08 * sin(time * 11.0);
            finalIntensity *= pulse;
            vec3 plasmaColor = mix(themeColorSecondary * 0.5, themeColor, surfaceIntensity);
            vec3 surfaceColor = mix(themeColor * 2.0, themeColor * 4.0, surfaceIntensity);
            plasmaColor = mix(plasmaColor, surfaceColor, surfaceIntensity * 0.7);
            vec3 finalColor = plasmaColor * finalIntensity * diskIntensity * 1.2;
            float finalAlpha = sphereIntensity * clamp(finalIntensity, 0.0, 1.0);
            float edgeFade = smoothstep(0.0, 0.1, finalAlpha);
            finalAlpha *= edgeFade;
            if (seamDebug > 0.0) {
                finalColor = mix(finalColor, vec3(1.0, 0.0, 0.0), 0.8);
            }
            gl_FragColor = vec4(finalColor, finalAlpha);
        }
    `;

    // Initialize the 3D scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!mountRef.current) return;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera (exact same as working sphere)
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000); // Square aspect ratio
        camera.position.set(0, 0, 3.0); // Move camera further back for more 3D depth
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Create renderer (exact same as working sphere)
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });
        const { width, height } = { width: window.innerWidth, height: window.innerHeight };
        const minDimension = Math.min(width, height);
        const rendererSize = minDimension * 0.75;
        renderer.setSize(rendererSize, rendererSize);
        renderer.domElement.className = 'sphere-renderer';
        renderer.setClearColor(0x000000, 1);
        renderer.autoClear = true;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create 4 spheres positioned in a circle
        const themes: ('purple' | 'blue' | 'forest' | 'gold')[] = ['purple', 'blue', 'forest', 'gold'];
        const globeRadius = 1.5; // Same as working sphere
        const orbitRadius = 4; // Increased distance between spheres

        themes.forEach((theme, index) => {
            const angle = (index / themes.length) * Math.PI * 2;
            const x = Math.cos(angle) * orbitRadius;
            const z = Math.sin(angle) * orbitRadius;

            // Create geometry (same as working sphere)
            const geometry = new THREE.SphereGeometry(globeRadius, 128, 64);
            
            // Create material (exact same as working sphere)
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                transparent: true,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: true,
                uniforms: {
                    time: { value: 0 },
                    scrollProgress: { value: scrollProgress },
                    themeColor: { value: themeColors[theme].primary },
                    themeColorSecondary: { value: themeColors[theme].secondary },
                    diskIntensity: { value: 1.0 },
                    turbulence: { value: 0.5 },
                    uMinDimension: { value: Math.min(window.innerWidth, window.innerHeight) },
                    debugSeam: { value: false }
                }
            });

            // Initialize scroll-related uniforms immediately after creation (same as working sphere)
            material.uniforms.scrollProgress.value = scrollProgress;
            material.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
            material.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, 0, z);
            
            // Add some rotation to make them more dynamic
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            
            scene.add(mesh);

            spheresRef.current.push({
                theme,
                mesh,
                material
            });
        });

        // Animation loop
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);

            const time = Date.now() * 0.001;

            // Update sphere materials and add individual rotation
            spheresRef.current.forEach((sphere) => {
                sphere.material.uniforms.time.value = time;
                sphere.material.uniforms.scrollProgress.value = scrollProgress;
                
                // Add individual sphere rotation
                sphere.mesh.rotation.x += 0.01;
                sphere.mesh.rotation.y += 0.02;
            });

            // Rotate entire system based on scroll progress
            const rotationAngle = scrollProgress * Math.PI * 2;
            scene.rotation.y = rotationAngle;

            renderer.render(scene, camera);
        };

        animate();

                // Handle resize (same as working sphere)
        const handleResize = () => {
            if (camera && renderer) {
                const rendererSize = Math.min(window.innerWidth, window.innerHeight) * 0.75;
                renderer.setSize(rendererSize, rendererSize);
                
                // Update uniforms for all spheres
                spheresRef.current.forEach(sphere => {
                    sphere.material.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div ref={mountRef} className="multi-sphere-container" />
    );
} 