'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './WebGLFluidBlackHole.css';

interface WebGLFluidBlackHoleProps {
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
}

export default function WebGLFluidBlackHole({
    theme = 'purple'
}: WebGLFluidBlackHoleProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationIdRef = useRef<number | null>(null);

    // Theme colors
    const themeColors = {
        purple: {
            primary: '#a78bfa',
            secondary: '#6d28d9',
            accent: '#f472b6',
            gradient: 'linear-gradient(45deg, #6d28d9, #a78bfa, #f472b6)'
        },
        blue: {
            primary: '#3b82f6',
            secondary: '#1d4ed8',
            accent: '#60a5fa',
            gradient: 'linear-gradient(45deg, #1d4ed8, #3b82f6, #60a5fa)'
        },
        forest: {
            primary: '#22c55e',
            secondary: '#16a34a',
            accent: '#4ade80',
            gradient: 'linear-gradient(45deg, #16a34a, #22c55e, #4ade80)'
        },
        gold: {
            primary: '#fbbf24',
            secondary: '#d97706',
            accent: '#f59e0b',
            gradient: 'linear-gradient(45deg, #d97706, #fbbf24, #f59e0b)'
        }
    };

    const currentTheme = themeColors[theme];

    // 3D droplet material with lighting
    const createDropletMaterial = (color: string) => {
        return new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            shininess: 100,
            emissive: color,
            emissiveIntensity: 0.3
        });
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup with lighting
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Add lighting for 3D effect
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(currentTheme.primary, 1, 100);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        // Camera setup - fixed position, no scroll interaction
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        camera.position.x = 0;
        camera.position.y = 0;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        // Create fluid droplets
        const createDroplet = (radius: number, angle: number, size: number) => {
            const geometry = new THREE.SphereGeometry(size, 16, 16);
            const material = createDropletMaterial(currentTheme.primary);
            const droplet = new THREE.Mesh(geometry, material);

            // Position in orbit
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            droplet.position.set(x, y, 0);

            return { mesh: droplet, radius, angle, speed: 0.02 + Math.random() * 0.01 };
        };

        // Create orbital rings
        const innerRing = Array.from({ length: 8 }, (_, i) =>
            createDroplet(2, (i * Math.PI * 2) / 8, 0.15)
        );

        const middleRing = Array.from({ length: 12 }, (_, i) =>
            createDroplet(3, (i * Math.PI * 2) / 12, 0.12)
        );

        const outerRing = Array.from({ length: 16 }, (_, i) =>
            createDroplet(4, (i * Math.PI * 2) / 16, 0.1)
        );

        // Add all droplets to scene
        [...innerRing, ...middleRing, ...outerRing].forEach(({ mesh }) => {
            scene.add(mesh);
        });

        // Create black hole center
        const blackHoleGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const blackHoleMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
            emissive: currentTheme.primary,
            emissiveIntensity: 0.2
        });

        const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
        scene.add(blackHole);

        // Animation loop
        const animate = (time: number) => {
            const timeValue = time * 0.001;

            // Update droplet positions (orbital motion)
            innerRing.forEach((droplet) => {
                droplet.angle += droplet.speed;
                const x = Math.cos(droplet.angle) * droplet.radius;
                const y = Math.sin(droplet.angle) * droplet.radius;
                droplet.mesh.position.set(x, y, 0);
            });

            middleRing.forEach((droplet) => {
                droplet.angle -= droplet.speed * 0.7; // Reverse direction
                const x = Math.cos(droplet.angle) * droplet.radius;
                const y = Math.sin(droplet.angle) * droplet.radius;
                droplet.mesh.position.set(x, y, 0);
            });

            outerRing.forEach((droplet) => {
                droplet.angle += droplet.speed * 0.5;
                const x = Math.cos(droplet.angle) * droplet.radius;
                const y = Math.sin(droplet.angle) * droplet.radius;
                droplet.mesh.position.set(x, y, 0);
            });

            renderer.render(scene, camera);
            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate(0);

        // Handle resize only
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [currentTheme]);

    return (
        <div
            ref={containerRef}
            className="webgl-fluid-container"
        />
    );
} 