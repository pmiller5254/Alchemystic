'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import './InvertedBlackHoleBackground.css';

interface InvertedBlackHole3DProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
    animationEngine?: 'gsap' | 'framer'; // Choose animation engine
    rotationSpeed?: number; // Control rotation speed
    onTransitionStateChange?: (isTransitioning: boolean) => void; // Callback for transition state
    debugSeam?: boolean; // Debug seam visibility
    showFluidEffect?: boolean; // Show fluid effect
    fluidColWidth?: number; // Fluid column width
    fluidSpeed?: number; // Fluid animation speed
    fluidScale?: number; // Fluid scale
    fluidSeed?: number; // Fluid randomization seed
}

// Vertex shader adapted for 3D sphere
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

// Original swirling plasma fragment shader
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



// Comment out background shader code
// const bgFragmentShader = `
//     precision highp float;
//     uniform float u_time;
//     uniform vec2 u_resolution;

//     // Tunnel warp function (softer)
//     vec2 tunnelWarp(vec2 uv) {
//         float strength = 0.35;
//         float yCurve = pow(abs(uv.y), 1.5) * strength;
//         uv.x *= 1.0 - yCurve;
//         return uv;
//     }

//     void main() {
//         vec2 uv = gl_FragCoord.xy / u_resolution.xy;
//         uv = uv * 2.0 - 1.0;
//         uv.x *= u_resolution.x / u_resolution.y;

//         // Apply tunnel/hourglass warp
//         uv = tunnelWarp(uv);

//         vec3 color = vec3(0.0);
//         float t = u_time * 0.3;

//         // Narrower, brighter streaks
//         for(int i = 0; i < 8; i++) {
//             float offset = float(i) * 0.22 - 0.8;
//             float speed = 0.5 + float(i) * 0.13;
//             float phase = t + float(i) * 0.7;
//             float y = uv.y + offset + sin(uv.x * 2.0 + phase) * 0.08;
//             float streak = exp(-pow(y, 2.0) * 120.0); // narrower
//             streak *= smoothstep(0.8, 0.0, abs(uv.x));

//             // Color blending
//             vec3 streakColor = mix(
//                 mix(vec3(0.8, 0.2, 1.0), vec3(0.2, 0.4, 1.0), float(i) / 7.0),
//                 vec3(1.0, 0.7, 1.0),
//                 0.5 + 0.5 * sin(phase + uv.x * 2.0)
//             );
//             color += streak * streakColor * 2.5; // brighter
//         }
//         // Add a soft white core
//         float core = exp(-pow(uv.y, 2.0) * 10.0) * exp(-pow(uv.x, 2.0) * 2.0);
//         color += core * vec3(1.0, 0.9, 1.0) * 0.7;
//         // Stronger vignette
//         float vignette = smoothstep(1.0, 0.4, length(uv));
//         color *= vignette;
//         // Clamp to avoid over-brightness
//         color = clamp(color, 0.0, 1.0);
//         gl_FragColor = vec4(color, 1.0);
//     }
// `;

export default function InvertedBlackHole3D({
    scrollProgress = 0,
    theme = 'purple',
    debugSeam = false,
    showFluidEffect = false,
    fluidColWidth = 1.5,
    fluidSpeed = 0.05,
    fluidScale = 0.15,
    fluidSeed = 0.176
}: InvertedBlackHole3DProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sphereRef = useRef<THREE.Mesh | null>(null);
    const animationRef = useRef<number | null>(null);



    // Framer Motion state for rotation


    // Theme transition state


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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        console.log('InvertedBlackHole3D useEffect running');
        if (!mountRef.current) {
            console.log('No mountRef.current');
            return;
        }

        const mountElement = mountRef.current;
        console.log('Mount element found:', mountElement);

        // Set up mount element styling - remove conflicting styles
        mountElement.style.background = 'transparent';

        // Remove any existing children (e.g., old canvas)
        while (mountElement.firstChild) {
            mountElement.removeChild(mountElement.firstChild);
        }

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
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });
        const { width, height } = getSize();
        // SINGLE SIZE CONTROL - Sphere radius that naturally fills the canvas
        const globeRadius = 1.5; // Radius that fills the canvas by default
        renderer.setClearColor(0x000000, 1); // Black background

        // SINGLE SIZE CONTROL - This affects both sphere and canvas together
        const minDimension = Math.min(width, height);
        const rendererSize = minDimension * 0.75; // Overall size control
        renderer.setSize(rendererSize, rendererSize);
        renderer.domElement.className = 'sphere-renderer';
        renderer.autoClear = true; // Auto-clear the background
        rendererRef.current = renderer;



        // --- Globe setup (no fluid logic) ---
        // CAMERA DISTANCE CONTROL - This affects how close/far the sphere appears (affects both sphere and canvas proportionally)
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000); // Square aspect ratio
        camera.position.set(0, 0, 3.0); // Move camera further back for more 3D depth
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const geometry = new THREE.SphereGeometry(globeRadius, 128, 64);
        const sphereMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
            uniforms: {
                time: { value: 0 },
                scrollProgress: { value: 0 },
                themeColor: { value: themeColors[theme].primary },
                themeColorSecondary: { value: themeColors[theme].secondary },
                diskIntensity: { value: 1.0 },
                turbulence: { value: 0.5 },
                uMinDimension: { value: Math.min(width, height) },
                debugSeam: { value: debugSeam }
            }
        });
        const sphere = new THREE.Mesh(geometry, sphereMaterial);
        scene.add(sphere);
        sphereRef.current = sphere;

        // Calculate exact visual size of sphere using projection
        const sphereBoundingBox = new THREE.Box3().setFromObject(sphere);
        const sphereSize = sphereBoundingBox.getSize(new THREE.Vector3());
        console.log('Sphere bounding box size:', sphereSize);

        // Project sphere corners to screen space
        const corners = [
            new THREE.Vector3(-sphereSize.x / 2, -sphereSize.y / 2, -sphereSize.z / 2),
            new THREE.Vector3(sphereSize.x / 2, -sphereSize.y / 2, -sphereSize.z / 2),
            new THREE.Vector3(-sphereSize.x / 2, sphereSize.y / 2, -sphereSize.z / 2),
            new THREE.Vector3(sphereSize.x / 2, sphereSize.y / 2, -sphereSize.z / 2),
            new THREE.Vector3(-sphereSize.x / 2, -sphereSize.y / 2, sphereSize.z / 2),
            new THREE.Vector3(sphereSize.x / 2, -sphereSize.y / 2, sphereSize.z / 2),
            new THREE.Vector3(-sphereSize.x / 2, sphereSize.y / 2, sphereSize.z / 2),
            new THREE.Vector3(sphereSize.x / 2, sphereSize.y / 2, sphereSize.z / 2)
        ];

        const projectedCorners = corners.map(corner => {
            const worldCorner = corner.clone().add(sphere.position);
            const screenCorner = worldCorner.clone().project(camera);
            return screenCorner;
        });

        const minX = Math.min(...projectedCorners.map(c => c.x));
        const maxX = Math.max(...projectedCorners.map(c => c.x));
        const minY = Math.min(...projectedCorners.map(c => c.y));
        const maxY = Math.max(...projectedCorners.map(c => c.y));

        const visualWidth = (maxX - minX) * width / 2;
        const visualHeight = (maxY - minY) * height / 2;
        const visualRadius = Math.max(visualWidth, visualHeight) / 2;

        console.log('Sphere visual radius:', visualRadius);
        console.log('Sphere visual dimensions:', { width: visualWidth, height: visualHeight });



        console.log('Camera position:', camera.position);
        console.log('Sphere position:', sphere.position);
        console.log('Globe radius:', globeRadius);
        console.log('Renderer size:', renderer.getSize(new THREE.Vector2()));
        console.log('Sphere created and added to scene:', sphere);
        console.log('Scene children count:', scene.children.length);

        // Initialize scroll-related uniforms immediately after creation
        sphereMaterial.uniforms.scrollProgress.value = scrollProgress;
        sphereMaterial.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
        sphereMaterial.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Mark as loaded after initial setup
        // setIsLoaded(true);

        // --- Add fullscreen background shader canvas ---
        // Create background renderer
        // const bgRenderer = new THREE.WebGLRenderer({
        //     alpha: false,
        //     antialias: true,
        //     preserveDrawingBuffer: true
        // });
        // bgRenderer.setSize(window.innerWidth, window.innerHeight);
        // bgRenderer.domElement.style.position = 'fixed';
        // bgRenderer.domElement.style.top = '0';
        // bgRenderer.domElement.style.left = '0';
        // bgRenderer.domElement.style.width = '100vw';
        // bgRenderer.domElement.style.height = '100vh';
        // bgRenderer.domElement.style.zIndex = '0';
        // bgRenderer.domElement.style.pointerEvents = 'none';
        // document.body.appendChild(bgRenderer.domElement);

        // Temporarily hide the orb to see just the background
        // mountElement.appendChild(renderer.domElement);
        // mountElement.appendChild(container);

        // Create background scene
        // const bgScene = new THREE.Scene();
        // const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        // const bgGeometry = new THREE.PlaneGeometry(2, 2);
        // const bgMaterial = new THREE.ShaderMaterial({
        //     vertexShader: bgVertexShader,
        //     fragmentShader: bgFragmentShader,
        //     uniforms: {
        //         u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        //         u_time: { value: 0 },
        //     },
        //     depthWrite: false,
        //     depthTest: false,
        //     side: THREE.DoubleSide,
        // });
        // const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        // bgScene.add(bgMesh);

        // Animation loop
        const startTime = Date.now();

        const animate = () => {
            const time = (Date.now() - startTime) / 1000;

            // Update time-based uniforms only (continuous animations)
            if (sphereRef.current?.material) {
                const material = sphereRef.current.material as THREE.ShaderMaterial;
                if (material.uniforms) {
                    material.uniforms.time.value = time;
                    material.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
                }
            }
            // Animate background shader
            // if (bgMaterial.uniforms.u_time) {
            //     bgMaterial.uniforms.u_time.value = time;
            // }

            // SCROLL-BASED ROTATION - Direct rotation based on scroll progress
            if (sphereRef.current) {
                // Map scroll progress (0-1) to full rotation (0 to 2π)
                // Multiply by 4 to make rotation more visible during testing
                const fullRotation = scrollProgress * Math.PI * 2 * 4;
                sphereRef.current.rotation.y = fullRotation;


            }

            // Add subtle camera movement for enhanced 3D effect
            if (cameraRef.current) {
                const camera = cameraRef.current;
                camera.position.x = Math.sin(time * 0.2) * 0.1;
                camera.position.y = Math.cos(time * 0.15) * 0.05;
                camera.lookAt(0, 0, 0);
            }

            // Render the scene
            console.log('Rendering scene, children:', scene.children.length);
            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            const { width, height } = getSize();
            renderer.setSize(width, height);
            camera.aspect = 1; // Keep square aspect ratio for perfect circle
            camera.updateProjectionMatrix();

            // Ensure sphere stays perfectly round by using the smaller dimension
            const minDimension = Math.min(width, height);
            renderer.setSize(minDimension, minDimension);
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
            // Remove background renderer
            // if (bgRenderer.domElement && bgRenderer.domElement.parentNode) {
            //     bgRenderer.domElement.parentNode.removeChild(bgRenderer.domElement);
            // }
            // bgRenderer.dispose();
        };
    }, []); // Only run once on mount to prevent scene recreation

    // Handle theme changes without recreating scene
    useEffect(() => {
        if (sphereRef.current?.material) {
            const material = sphereRef.current.material as THREE.ShaderMaterial;
            if (material.uniforms) {
                material.uniforms.themeColor.value = themeColors[theme].primary;
                material.uniforms.themeColorSecondary.value = themeColors[theme].secondary;
            }
        }
    }, [theme, themeColors]);

    // SCROLL-BASED ROTATION - Disabled GSAP animations
    // useGSAP(() => {
    //     // All GSAP rotation code disabled for scroll-based rotation
    // }, [animationEngine, rotationSpeed]);

    // SCROLL-BASED ROTATION - Disabled GSAP restoration code
    // useEffect(() => {
    //     // All GSAP restoration code disabled for scroll-based rotation
    // }, [isTransitioning, animationEngine, rotationSpeed]);

    // Framer Motion rotation animation - Disabled
    // useEffect(() => {
    //     // Framer motion code disabled
    // }, [animationEngine, rotationSpeed]);

    // Update scroll-related uniforms (separate from scene creation)
    useEffect(() => {
        if (sphereRef.current?.material) {
            const material = sphereRef.current.material as THREE.ShaderMaterial;

            // Update scroll-dependent uniforms immediately
            material.uniforms.scrollProgress.value = scrollProgress;
            material.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
            material.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;
        }
    }, [scrollProgress]);

    // Smooth scroll progress updates with GSAP (optional enhancement)
    useGSAP(() => {
        if (sphereRef.current?.material) {
            const material = sphereRef.current.material as THREE.ShaderMaterial;
            gsap.to(material.uniforms.scrollProgress, {
                value: scrollProgress,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [scrollProgress]);

    // SCROLL-BASED THEME TRANSITIONS - Disabled GSAP transition effects
    // useEffect(() => {
    //     // All GSAP transition code disabled for scroll-based rotation
    // }, [theme, animationEngine, rotationSpeed, scrollProgress, themeColors]);

    // Update theme colors with smooth transition during spin
    useEffect(() => {
        if (sphereRef.current?.material) {
            const sphereMaterial = sphereRef.current.material as THREE.ShaderMaterial;
            const colors = themeColors[theme];

            // Only update colors when not transitioning (normal theme changes)
            sphereMaterial.uniforms.themeColor.value = colors.primary;
            sphereMaterial.uniforms.themeColorSecondary.value = colors.secondary;
        }
    }, [theme, themeColors]);

    // Update debug seam uniform
    useEffect(() => {
        if (sphereRef.current?.material) {
            const sphereMaterial = sphereRef.current.material as THREE.ShaderMaterial;
            sphereMaterial.uniforms.debugSeam.value = debugSeam;
        }
    }, [debugSeam]);

    // Update fluid uniforms reactively
    useEffect(() => {
        if (sphereRef.current?.material) {
            const mat = sphereRef.current.material as THREE.ShaderMaterial;
            if (mat.uniforms.showFluidEffect) mat.uniforms.showFluidEffect.value = showFluidEffect;
            if (mat.uniforms.fluidColWidth) mat.uniforms.fluidColWidth.value = fluidColWidth;
            if (mat.uniforms.fluidSpeed) mat.uniforms.fluidSpeed.value = fluidSpeed;
            if (mat.uniforms.fluidScale) mat.uniforms.fluidScale.value = fluidScale;
            if (mat.uniforms.fluidSeed) mat.uniforms.fluidSeed.value = fluidSeed;
        }
    }, [showFluidEffect, fluidColWidth, fluidSpeed, fluidScale, fluidSeed]);

    // SCROLL-BASED ROTATION - Disabled component's scroll handler since we're using props
    // useEffect(() => {
    //     // Component scroll handler disabled - using scrollProgress prop instead
    // }, []);


    return (
        <div ref={mountRef} className="sphere-container"></div>
    );
} 