'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CustomShaderBackgroundProps {
    scale?: number;
    ax?: number;
    ay?: number;
    az?: number;
    aw?: number;
    bx?: number;
    by?: number;
    color1?: string;
    color2?: string;
    color3?: string;
    color4?: string;
}

export default function CustomShaderBackground({
    scale = 0.4,
    ax = 5,
    ay = 7,
    az = 9,
    aw = 13,
    bx = 1,
    by = 1,
    color1 = '#ffffff',
    color2 = '#ffafaf',
    color3 = '#0099ff',
    color4 = '#aaffff'
}: CustomShaderBackgroundProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const animationRef = useRef<number | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    // Convert hex colors to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 1, b: 1 };
    };

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        precision highp float;
        varying vec2 vUv;
        uniform float time;
        uniform float scale;
        uniform vec2 resolution;
        uniform vec3 color1, color2, color3, color4;
        uniform float ax, ay, az, aw;
        uniform float bx, by;
        
        const float PI = 3.141592654;
        
        // just a bunch of sin & cos to generate an interesting pattern
        float cheapNoise(vec3 stp) {
            vec3 p = vec3(stp.st, stp.p);
            vec4 a = vec4(ax, ay, az, aw);
            return mix(
                sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * 
                cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
                sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * 
                cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)), 
                .436
            );
        }
        
        void main() {
            vec2 aR = vec2(resolution.x/resolution.y, 1.);
            vec2 st = vUv * aR * scale;
            float S = sin(time * .005);
            float C = cos(time * .005);
            vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
            vec2 v2 = vec2(
                cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
                cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
            );
            float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
            
            vec3 color = mix(color1,
                color2,
                clamp((n*n)*8.,0.0,1.0));

            color = mix(color,
                color3,
                clamp(length(v1),0.0,1.0));

            color = mix(color,
                        color4,
                        clamp(length(v2.x),0.0,1.0));
            
            color /= n*n + n * 7.;
            gl_FragColor = vec4(color,1.);
        }
    `;

    useEffect(() => {
        if (!mountRef.current) return;

        const mountElement = mountRef.current;

        // Clear any existing content
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
                height: window.innerHeight
            };
        };

        const { width, height } = getSize();

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '1';
        renderer.domElement.style.pointerEvents = 'none';
        rendererRef.current = renderer;

        // Create camera
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        // Create geometry
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Convert colors
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const c3 = hexToRgb(color3);
        const c4 = hexToRgb(color4);

        // Create material
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0 },
                scale: { value: scale },
                resolution: { value: new THREE.Vector2(width, height) },
                color1: { value: new THREE.Vector3(c1.r, c1.g, c1.b) },
                color2: { value: new THREE.Vector3(c2.r, c2.g, c2.b) },
                color3: { value: new THREE.Vector3(c3.r, c3.g, c3.b) },
                color4: { value: new THREE.Vector3(c4.r, c4.g, c4.b) },
                ax: { value: ax },
                ay: { value: ay },
                az: { value: az },
                aw: { value: aw },
                bx: { value: bx },
                by: { value: by }
            }
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add to DOM
        mountElement.appendChild(renderer.domElement);

        // Animation loop
        let startTime = Date.now();
        const animate = () => {
            try {
                const time = (Date.now() - startTime) / 1000;

                // Reset time if it gets too large to prevent overflow
                if (time > 1000000) {
                    startTime = Date.now();
                }

                if (material.uniforms.time) {
                    material.uniforms.time.value = time;
                }

                renderer.render(scene, camera);
                animationRef.current = requestAnimationFrame(animate);
            } catch (error) {
                console.error('CustomShaderBackground animation error:', error);
                // Restart animation on error
                animationRef.current = requestAnimationFrame(animate);
            }
        };
        animate();

        // Handle resize
        const handleResize = () => {
            try {
                const { width, height } = getSize();
                renderer.setSize(width, height);
                if (material.uniforms.resolution) {
                    material.uniforms.resolution.value.set(width, height);
                }
            } catch (error) {
                console.error('CustomShaderBackground resize error:', error);
            }
        };
        window.addEventListener('resize', handleResize);

        // WebGL context recovery for tab visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Reinitialize shader state when tab becomes visible
                if (material.uniforms.time) {
                    material.uniforms.time.value = 0;
                }
                console.log('CustomShaderBackground: Tab became visible, reset shader state');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            if (mountElement && renderer.domElement) {
                mountElement.removeChild(renderer.domElement);
            }

            // Properly dispose of Three.js objects
            if (material) {
                material.dispose();
            }
            if (geometry) {
                geometry.dispose();
            }
            if (renderer) {
                renderer.dispose();
            }

            console.log('CustomShaderBackground: Cleanup completed');
        };
    }, [scale, ax, ay, az, aw, bx, by]); // Remove colors from dependency array

    // Handle color changes smoothly without recreating scene
    useEffect(() => {
        if (materialRef.current) {
            const material = materialRef.current;
            const c1 = hexToRgb(color1);
            const c2 = hexToRgb(color2);
            const c3 = hexToRgb(color3);
            const c4 = hexToRgb(color4);

            // Update color uniforms smoothly
            if (material.uniforms.color1) material.uniforms.color1.value.set(c1.r, c1.g, c1.b);
            if (material.uniforms.color2) material.uniforms.color2.value.set(c2.r, c2.g, c2.b);
            if (material.uniforms.color3) material.uniforms.color3.value.set(c3.r, c3.g, c3.b);
            if (material.uniforms.color4) material.uniforms.color4.value.set(c4.r, c4.g, c4.b);
        }
    }, [color1, color2, color3, color4]);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1
            }}
        />
    );
} 