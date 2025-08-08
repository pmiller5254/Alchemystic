'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import ReactDOM from 'react-dom';

import './MultiSphereSystem.css';

interface DrippingSphereSystemProps {
    scrollProgress?: number;
}

interface SphereData {
    theme: 'purple' | 'blue' | 'forest' | 'gold';
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
}

// Portal-based camera controls that render outside the main component
function CameraControlsPortal({
    cameraPosition,
    setCameraPosition,
    cameraLookAt,
    setCameraLookAt,
    triggerCameraTransition,
    isTransitioning,
    isCloseUp
}: {
    cameraPosition: { x: number; y: number; z: number };
    setCameraPosition: (pos: { x: number; y: number; z: number }) => void;
    cameraLookAt: { x: number; y: number; z: number };
    setCameraLookAt: (lookAt: { x: number; y: number; z: number }) => void;
    triggerCameraTransition: () => void;
    isTransitioning: boolean;
    isCloseUp: boolean;
}) {
    const [showControls, setShowControls] = useState(true);
    const [isClient, setIsClient] = useState(false);

    console.log('CameraControlsPortal render - showControls:', showControls);

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Don't render anything during SSR
    if (!isClient) {
        return null;
    }

    const controlPanel = showControls ? (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000,
            fontFamily: 'monospace',
            fontSize: '12px',
            minWidth: '300px'
        }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                Camera Controls
                <button
                    onClick={() => setShowControls(false)}
                    style={{
                        float: 'right',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '2px 6px',
                        cursor: 'pointer'
                    }}
                >
                    X
                </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Camera Position:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    <label>X: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraPosition.x}
                        onChange={(e) => setCameraPosition({ ...cameraPosition, x: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraPosition.x.toFixed(1)}</span>

                    <label>Y: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraPosition.y}
                        onChange={(e) => setCameraPosition({ ...cameraPosition, y: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraPosition.y.toFixed(1)}</span>

                    <label>Z: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraPosition.z}
                        onChange={(e) => setCameraPosition({ ...cameraPosition, z: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraPosition.z.toFixed(1)}</span>
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Camera LookAt:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    <label>X: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraLookAt.x}
                        onChange={(e) => setCameraLookAt({ ...cameraLookAt, x: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraLookAt.x.toFixed(1)}</span>

                    <label>Y: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraLookAt.y}
                        onChange={(e) => setCameraLookAt({ ...cameraLookAt, y: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraLookAt.y.toFixed(1)}</span>

                    <label>Z: <input
                        type="range"
                        min="-20" max="20" step="0.1"
                        value={cameraLookAt.z}
                        onChange={(e) => setCameraLookAt({ ...cameraLookAt, z: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    /></label>
                    <span>{cameraLookAt.z.toFixed(1)}</span>
                </div>
            </div>

            <div style={{ fontSize: '10px', opacity: 0.7 }}>
                Position: ({cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)})<br />
                LookAt: ({cameraLookAt.x.toFixed(1)}, {cameraLookAt.y.toFixed(1)}, {cameraLookAt.z.toFixed(1)})
            </div>

            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <button
                    onClick={triggerCameraTransition}
                    disabled={isTransitioning}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: isTransitioning ? '#666' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isTransitioning ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    {isTransitioning ? 'Transitioning...' : isCloseUp ? 'Zoom Out' : 'Zoom In'}
                </button>
                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px' }}>
                    {isCloseUp ? 'Close-up view' : 'Distant view'}
                </div>
            </div>
        </div>
    ) : (
        <button
            onClick={() => setShowControls(true)}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '10px',
                zIndex: 1000,
                cursor: 'pointer'
            }}
        >
            Show Controls
        </button>
    );

    return ReactDOM.createPortal(controlPanel, document.body);
}

export default function DrippingSphereSystem({ scrollProgress = 0 }: DrippingSphereSystemProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const spheresRef = useRef<SphereData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const animationRef = useRef<number | null>(null);

    // Camera control state
    const [cameraPosition, setCameraPosition] = useState({ x: 12, y: 20, z: 0 });
    const [cameraLookAt, setCameraLookAt] = useState({ x: 0, y: 0, z: 0 });
    const cameraPositionRef = useRef(cameraPosition);
    const cameraLookAtRef = useRef(cameraLookAt);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isCloseUp, setIsCloseUp] = useState(false);

    // Hover state for planets - use ref instead of state for performance
    const hoveredPlanetRef = useRef<string | null>(null);

    // Mouse state for raycasting
    const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());

    // Mouse move handler for hover detection - remove console.log
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (rendererRef.current) {
                const canvas = rendererRef.current.domElement;
                const rect = canvas.getBoundingClientRect();
                setMouse({
                    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
                    y: -((event.clientY - rect.top) / rect.height) * 2 + 1
                });
                // Removed console.log for performance
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Debug logging
    console.log('DrippingSphereSystem render');

    // Remove the camera ref sync effect - not needed for performance
    // useEffect(() => {
    //     cameraPositionRef.current = cameraPosition;
    //     cameraLookAtRef.current = cameraLookAt;
    //     console.log('Camera state changed:', { cameraPosition, cameraLookAt });
    // }, [cameraPosition, cameraLookAt]);

    // Optimized camera transition function - avoid per-frame state updates
    const triggerCameraTransition = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        // startPosition not used beyond initialization
        const endPosition = isCloseUp ? { x: 12, y: 20, z: 0 } : { x: 12, y: -1.5, z: 0 };
        gsap.to(cameraPositionRef.current, {
            x: endPosition.x,
            y: endPosition.y,
            z: endPosition.z,
            duration: 2,
            ease: 'power2.inOut',
            // Remove onUpdate to avoid per-frame state updates
            onComplete: () => {
                setIsTransitioning(false);
                setIsCloseUp(!isCloseUp);
                setCameraPosition({ ...cameraPositionRef.current });
                console.log('Camera transition completed');
            }
        });
    };

    // Configuration variables - all hardcoded values now configurable
    const config = {
        globeRadius: 1.5,
        orbitRadius: 8,
        orbitSpeed: 0.1,
        sphereYPosition: -1,
        rotationSpeedX: 0.0,
        rotationSpeedY: 0.0,
        sphereSpacing: Math.PI / 2, // Angle between spheres (90 degrees)
        cameraFOV: 55,
        cameraNear: 0.1,
        cameraFar: 1000
    };

    // Theme colors for each sphere (same as working sphere)
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

    // Vertex shader (exact same as working sphere)
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

    // Fragment shader (exact same as working sphere)
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

    // Optimized GSAP ticker with minimal dependencies
    useGSAP(() => {
        let startTime = Date.now();
        const ticker = () => {
            const time = (Date.now() - startTime) / 1000;
            if (time > 1000000) {
                startTime = Date.now();
            }
            if (cameraRef.current) {
                cameraRef.current.position.set(cameraPositionRef.current.x, cameraPositionRef.current.y, cameraPositionRef.current.z);
                cameraRef.current.lookAt(cameraLookAtRef.current.x, cameraLookAtRef.current.y, cameraLookAtRef.current.z);
            }
            spheresRef.current.forEach((sphere, index) => {
                const material = sphere.material;
                if (material.uniforms) {
                    material.uniforms.time.value = time;
                    material.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
                }
                sphere.mesh.rotation.x += config.rotationSpeedX;
                sphere.mesh.rotation.y += config.rotationSpeedY;
                let systemRotation = config.orbitSpeed;
                if (hoveredPlanetRef.current) systemRotation = 0; // Use ref instead of state
                const orbitAngle = time * systemRotation;
                const x = Math.cos(orbitAngle + (index * config.sphereSpacing)) * config.orbitRadius;
                const z = Math.sin(orbitAngle + (index * config.sphereSpacing)) * config.orbitRadius;
                sphere.mesh.position.x = x;
                sphere.mesh.position.z = z;
                if (hoveredPlanetRef.current === sphere.theme) { // Use ref instead of state
                    sphere.mesh.scale.set(1.25, 1.25, 1.25);
                } else {
                    sphere.mesh.scale.set(1, 1, 1);
                }
            });
            if (rendererRef.current && cameraRef.current) {
                raycaster.current.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), cameraRef.current);
                const meshes = spheresRef.current.map(s => s.mesh);
                const intersects = raycaster.current.intersectObjects(meshes);
                let newHoveredId: string | null = null;
                if (intersects.length > 0) {
                    const intersectedObject = intersects[0].object as THREE.Mesh;
                    newHoveredId = intersectedObject.uuid;
                }
                if (newHoveredId !== hoveredPlanetRef.current) { // Use ref instead of state
                    const foundSphere = spheresRef.current.find(s => s.mesh.uuid === newHoveredId);
                    hoveredPlanetRef.current = foundSphere ? foundSphere.theme : null;
                    // Only update state if needed for UI
                    // setHoveredPlanet(hoveredPlanetRef.current); // This line is removed as per the edit hint
                }
            }
            const rotationAngle = scrollProgress * Math.PI * 2;
            if (sceneRef.current) sceneRef.current.rotation.y = rotationAngle;
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        gsap.ticker.add(ticker);
        return () => {
            gsap.ticker.remove(ticker);
        };
    }, [scrollProgress]); // Remove heavy dependencies, only keep scrollProgress

    // Initialize the 3D scene (based on working sphere)
    useEffect(() => {
        console.log('DrippingSphereSystem useEffect running');
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

        // Get viewport size (same as working sphere)
        const getSize = () => {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                min: Math.min(window.innerWidth, window.innerHeight)
            };
        };

        // Create renderer (same as working sphere)
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { width, height } = getSize();
        // globeRadius is embedded in geometry creation
        renderer.setClearColor(0x000000, 1); // Black background

        // Set renderer to fill the full viewport
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.className = 'sphere-renderer';
        renderer.autoClear = true;

        // Position the renderer to fill the entire screen
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100vw';
        renderer.domElement.style.height = '100vh';
        renderer.domElement.style.zIndex = '10';
        renderer.domElement.style.pointerEvents = 'auto';

        mountElement.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create camera (exact same as working sphere)
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Wider FOV and proper aspect ratio
        camera.position.set(10, 6, 10); // 
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        console.log('Creating spheres...');

        // Create 4 spheres positioned in a planetary orbit
        const themes: ('purple' | 'blue' | 'forest' | 'gold')[] = ['purple', 'blue', 'forest', 'gold'];

        themes.forEach((theme, index) => {
            // Calculate position in a perfect circle with equal spacing
            const angle = (index / themes.length) * Math.PI * 2;
            const x = Math.cos(angle) * config.orbitRadius;
            const z = Math.sin(angle) * config.orbitRadius;
            const y = config.sphereYPosition; // Slightly higher than before for better visibility

            // Create geometry (same as working sphere)
            const geometry = new THREE.SphereGeometry(config.globeRadius, 128, 64);

            // Create material (exact same as working sphere)
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
                    debugSeam: { value: false }
                }
            });

            const mesh = new THREE.Mesh(geometry, sphereMaterial);
            mesh.position.set(x, y, z); // Position spheres in orbital pattern

            // Add some initial rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            // Add hover handlers to the rendered spheres
            // (This is a conceptual note: the actual mesh creation is in the Three.js setup, so we need to add event listeners there)
            // We'll use raycasting in the animation loop to detect hover
            // Add this after mesh creation:
            mesh.userData.theme = theme;
            //
            // In the animation loop, after rendering:
            // (see next edit for raycasting logic)

            scene.add(mesh);

            spheresRef.current.push({
                theme,
                mesh,
                material: sphereMaterial
            });

            console.log(`Created sphere ${index} with theme ${theme} at position (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
        });

        console.log(`Total spheres created: ${spheresRef.current.length}`);

        // Initialize scroll-related uniforms immediately after creation (same as working sphere)
        spheresRef.current.forEach(sphere => {
            sphere.material.uniforms.scrollProgress.value = scrollProgress;
            sphere.material.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
            sphere.material.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;
        });

        // Handle resize (same as working sphere)
        const handleResize = () => {
            try {
                const { width, height } = getSize();
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = 1; // Keep square aspect ratio
                camera.updateProjectionMatrix();

                // Update uniforms for all spheres
                spheresRef.current.forEach(sphere => {
                    sphere.material.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
                });
            } catch (error) {
                console.error('DrippingSphereSystem resize error:', error);
            }
        };

        window.addEventListener('resize', handleResize);

        // WebGL context recovery for tab visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Reinitialize shader state when tab becomes visible
                spheresRef.current.forEach(sphere => {
                    if (sphere.material.uniforms) {
                        sphere.material.uniforms.time.value = 0;
                        sphere.material.uniforms.uMinDimension.value = Math.min(window.innerWidth, window.innerHeight);
                    }
                });
                console.log('DrippingSphereSystem: Tab became visible, reset shader state');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Properly dispose of Three.js objects
            if (mountElement && renderer.domElement) {
                mountElement.removeChild(renderer.domElement);
            }

            // Dispose of all materials and geometries
            spheresRef.current.forEach(sphere => {
                if (sphere.material) {
                    sphere.material.dispose();
                }
                if (sphere.mesh.geometry) {
                    sphere.mesh.geometry.dispose();
                }
            });

            if (renderer) {
                renderer.dispose();
            }

            console.log('DrippingSphereSystem: Cleanup completed');
        };
    }, []); // Re-run when camera controls change

    // Update scroll-related uniforms (separate from scene creation)
    useEffect(() => {
        spheresRef.current.forEach(sphere => {
            if (sphere.material.uniforms) {
                sphere.material.uniforms.scrollProgress.value = scrollProgress;
                sphere.material.uniforms.turbulence.value = 0.3 + 0.4 * scrollProgress;
                sphere.material.uniforms.diskIntensity.value = 0.8 + 0.4 * scrollProgress;
            }
        });
    }, [scrollProgress]);

    return (
        <div ref={mountRef} className="sphere-container">
            <CameraControlsPortal
                cameraPosition={cameraPosition}
                setCameraPosition={setCameraPosition}
                cameraLookAt={cameraLookAt}
                setCameraLookAt={setCameraLookAt}
                triggerCameraTransition={triggerCameraTransition}
                isTransitioning={isTransitioning}
                isCloseUp={isCloseUp}
            />
        </div>
    );
}