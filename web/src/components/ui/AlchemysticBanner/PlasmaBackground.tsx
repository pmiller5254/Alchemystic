'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PlasmaBackgroundProps {
    width: number;
    height: number;
    className?: string;
}

// Fragment shader for plasma effect (extracted from ModernBlackHoleBackground)
const plasmaFragmentShader = `
    uniform float time;
    uniform vec3 themeColor;
    uniform vec3 themeColorSecondary;
    
    varying vec2 vUv;
    
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
    
    // Plasma turbulence function (heavily zoomed in)
    float plasmaTurbulence(vec2 uv, float time) {
        float turbulence = 0.0;
        turbulence += noise(uv * 1.5 + vec2(time * 0.5, time * 0.3)) * 0.5;
        turbulence += noise(uv * 3.0 + vec2(time * 0.8, time * 0.6)) * 0.25;
        turbulence += noise(uv * 6.0 + vec2(time * 1.2, time * 0.9)) * 0.125;
        return turbulence;
    }
    
    // Flame flicker function (heavily zoomed in)
    float flameFlicker(vec2 uv, float time) {
        float flicker = 0.0;
        flicker += sin(time * 8.0 + uv.x * 4.0) * 0.3;
        flicker += sin(time * 12.0 + uv.y * 3.0) * 0.2;
        flicker += sin(time * 6.0 + uv.x * 5.0 + uv.y * 3.5) * 0.25;
        return flicker;
    }
    
    void main() {
        vec2 uv = vUv;
        
        // Plasma effects (heavily zoomed in)
        float plasmaIntensity = plasmaTurbulence(uv * 0.8, time);
        float flameIntensity = flameFlicker(uv, time);
        float surfaceIntensity = plasmaIntensity * flameIntensity;
        
        // Constant peak intensity (no pulsing)
        float pulse = 1.53; // Peak value of the original pulsing (1.0 + 0.3 + 0.15 + 0.08)
        
        // Create intense plasma color gradient
        vec3 plasmaColor = mix(themeColorSecondary * 0.8, themeColor * 1.2, abs(surfaceIntensity));
        
        // Add intense plasma surface colors
        vec3 surfaceColor = mix(themeColor * 1.5, themeColor * 2.5, abs(surfaceIntensity));
        plasmaColor = mix(plasmaColor, surfaceColor, abs(surfaceIntensity) * 0.7);
        
        // Apply constant peak intensity
        plasmaColor *= pulse * 0.8;
        
        // Add base intensity
        float baseIntensity = 0.7 + 0.3 * abs(surfaceIntensity);
        
        gl_FragColor = vec4(plasmaColor * baseIntensity, 0.95);
    }
`;

const plasmaVertexShader = `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export default function PlasmaBackground({ width, height, className = '' }: PlasmaBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const animationIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Shader material for plasma effect
        const material = new THREE.ShaderMaterial({
            vertexShader: plasmaVertexShader,
            fragmentShader: plasmaFragmentShader,
            uniforms: {
                time: { value: 0 },
                themeColor: { value: new THREE.Vector3(0.961, 0.620, 0.043) }, // Match gold theme primary (#f59e0b)
                themeColorSecondary: { value: new THREE.Vector3(0.851, 0.467, 0.024) } // Match gold theme secondary (#d97706)
            },
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        // Plane geometry to display the shader
        const geometry = new THREE.PlaneGeometry(2, 2);
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // Store refs
        sceneRef.current = scene;
        rendererRef.current = renderer;
        materialRef.current = material;

        // Animation loop
        const animate = () => {
            if (materialRef.current) {
                materialRef.current.uniforms.time.value = performance.now() * 0.001;
            }

            renderer.render(scene, camera);
            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [width, height]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: -1
            }}
        />
    );
} 