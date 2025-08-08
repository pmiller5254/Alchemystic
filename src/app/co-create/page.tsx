'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import './page.css';
import Rotating3DCarousel from '@/components/ui/Rotating3DCarousel/Rotating3DCarousel';
import StarryBackground from '@/components/ui/StarryBackground/StarryBackground';
import BookingModal from '@/components/ui/BookingModal/BookingModal';

export default function CoCreatePage() {
    const [targetRotation, setTargetRotation] = useState({ x: -5, y: 0 }); // target rotation
    const [currentRotation, setCurrentRotation] = useState({ x: -5, y: 0 }); // smoothly interpolated rotation
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const maxRotateDown = 18; // degrees down (positive x, much more downward)
    const maxRotateY = 7;     // degrees left/right
    const maxTranslate = 80;

    // Sample site data for the carousel
    const sites = [
        {
            id: 1,
            title: "Mountain Retreat",
            price: "$150/night",
            description: "A serene mountain getaway perfect for meditation retreats and spiritual renewal. Surrounded by ancient forests and crystal-clear streams.",
            image: "/space.png", // Update with actual images
            location: "Colorado Rockies"
        },
        {
            id: 2,
            title: "Desert Sanctuary",
            price: "$200/night",
            description: "Experience the profound silence of the desert. Ideal for vision quests, stargazing ceremonies, and deep contemplation.",
            image: "/space.png",
            location: "Arizona Desert"
        },
        {
            id: 3,
            title: "Coastal Healing Center",
            price: "$175/night",
            description: "Ocean-front healing space with the rhythmic sounds of waves. Perfect for healing workshops and transformative gatherings.",
            image: "/space.png",
            location: "California Coast"
        },
        {
            id: 4,
            title: "Forest Grove",
            price: "$125/night",
            description: "Ancient redwood grove sanctuary offering deep connection with nature&apos;s wisdom and grounding earth energies.",
            image: "/space.png",
            location: "Northern California"
        },
        {
            id: 5,
            title: "Sacred Valley",
            price: "$300/night",
            description: "High-altitude sacred space inspired by Andean traditions. Ideal for ceremony, plant medicine work, and spiritual pilgrimage.",
            image: "/space.png",
            location: "Sacred Valley, Peru"
        },
        {
            id: 6,
            title: "Lake House Retreat",
            price: "$180/night",
            description: "Peaceful lakeside sanctuary perfect for group retreats, yoga intensives, and mindful community gatherings.",
            image: "/space.png",
            location: "Lake Tahoe"
        },
        {
            id: 7,
            title: "Canyon Sanctuary",
            price: "$220/night",
            description: "Dramatic red rock formations create a powerful container for transformation. Experience the ancient wisdom of the earth.",
            image: "/space.png",
            location: "Sedona, Arizona"
        },
        {
            id: 8,
            title: "Island Healing Lodge",
            price: "$350/night",
            description: "Private island sanctuary surrounded by pristine waters. Perfect for intimate ceremonies and deep soul work.",
            image: "/space.png",
            location: "Pacific Northwest"
        },
        {
            id: 9,
            title: "Alpine Crystal Cave",
            price: "$275/night",
            description: "Natural crystal formation deep in the mountains. A powerful space for meditation and energy healing work.",
            image: "/space.png",
            location: "Swiss Alps"
        },
        {
            id: 10,
            title: "Bamboo Forest Retreat",
            price: "$140/night",
            description: "Zen sanctuary nestled in ancient bamboo groves. Perfect for mindfulness practices and silent retreats.",
            image: "/space.png",
            location: "Kyoto, Japan"
        }
    ];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Normalize cursor position to -1 to 1 range
        const normalizedX = (e.clientX - rect.left - centerX) / centerX;
        const normalizedY = (e.clientY - rect.top - centerY) / centerY;

        setTargetRotation({
            x: -5 + normalizedY * maxRotateDown * 0.3, // start at -5, subtle movement
            y: normalizedX * maxRotateY * 0.3,
        });
    };

    // Smooth interpolation for rotation
    useEffect(() => {
        let animationFrameId: number;

        const smoothUpdate = () => {
            setCurrentRotation(current => {
                const lerpFactor = 0.025; // Same smooth factor as stars

                const deltaX = targetRotation.x - current.x;
                const deltaY = targetRotation.y - current.y;

                // If we're very close to target, snap to it
                if (Math.abs(deltaX) < 0.001 && Math.abs(deltaY) < 0.001) {
                    return targetRotation;
                }

                return {
                    x: current.x + deltaX * lerpFactor,
                    y: current.y + deltaY * lerpFactor
                };
            });

            animationFrameId = requestAnimationFrame(smoothUpdate);
        };

        smoothUpdate();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [targetRotation]);

    const translateX = -currentRotation.y * maxTranslate / maxRotateY;
    const translateY = -currentRotation.x * maxTranslate / maxRotateDown - 100; // offset by -100px to position higher

    return (
        <>
            {/* Starry background - positioned absolutely, won't affect layout */}
            <StarryBackground density="heavy" />

            <div
                className="co-create-page"
                onMouseMove={handleMouseMove}
            >
                {/* Perspective background image */}
                <Image
                    src="/space.png"
                    alt="Space Background"
                    width={1920}
                    height={1080}
                    className="background-perspective-image"
                    style={{
                        transform: `perspective(1200px) scale(1.8) rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg) translate(${translateX}px, ${translateY}px)`,
                    }}
                    draggable={false}
                />
                {/* Main content */}
                <div className="co-create-main-content">
                    <div className="content-container">
                        <div className="hero-text">
                            <h1 className="text-6xl md:text-8xl font-bold text-white text-center mb-8">
                                Co-Create
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                                    Sacred Spaces
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
                                <button
                                    className="book-button"
                                    onClick={() => setIsBookingModalOpen(true)}
                                >
                                    Book
                                </button>{' '}
                                transformative spaces for retreats, ceremonies, and conscious gatherings.
                                Each location offers unique energies for deep healing and spiritual growth.
                            </p>
                        </div>
                        <Rotating3DCarousel sites={sites} />

                        <div className="text-center mt-16 mb-8">
                            <p className="text-gray-400 text-lg">
                                Explore our sacred spaces • Scroll or drag to navigate
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </>
    );
} 