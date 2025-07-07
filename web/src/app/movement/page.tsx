'use client';

import { useState, useEffect } from 'react';
import SpiralCarousel from '../../components/ui/SpiralCarousel/SpiralCarousel';
import SiteCard from '../../components/ui/SiteCard/SiteCard';
import './page.css';

export default function MovementPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const siteData = [
        {
            title: "Embodied Flow",
            price: "$120",
            description: "Dynamic movement sequences that awaken your body's natural wisdom",
            image: "/globe.svg",
            location: "Studio A"
        },
        {
            title: "Somatic Therapy",
            price: "$150",
            description: "Gentle practices to release trauma stored in the body",
            image: "/file.svg",
            location: "Private Room"
        },
        {
            title: "Dance Therapy",
            price: "$100",
            description: "Express and heal through the language of movement",
            image: "/window.svg",
            location: "Dance Studio"
        },
        {
            title: "Breath Work",
            price: "$80",
            description: "Conscious breathing techniques for transformation",
            image: "/noise.svg",
            location: "Meditation Room"
        },
        {
            title: "Yoga Nidra",
            price: "$90",
            description: "Deep relaxation practices for nervous system healing",
            image: "/globe.svg",
            location: "Quiet Space"
        },
        {
            title: "Martial Arts",
            price: "$110",
            description: "Discipline and presence through mindful combat",
            image: "/file.svg",
            location: "Training Hall"
        },
        {
            title: "Ecstatic Dance",
            price: "$85",
            description: "Free-form movement for emotional release",
            image: "/window.svg",
            location: "Open Floor"
        },
        {
            title: "Body Awareness",
            price: "$95",
            description: "Develop deeper connection with your physical self",
            image: "/noise.svg",
            location: "Movement Studio"
        }
    ];

    return (
        <div className="movement-page">
            {/* Purple gradient background */}
            <div className="movement-background" />

            {/* Split-screen content */}
            <div className="movement-split-content">
                {/* Left side - Text content */}
                <div className="movement-text-section">
                    <div className="text-content">
                        <h2 className="text-6xl font-bold text-white mb-8">
                            Movement & Embodiment
                        </h2>
                        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                            <p>
                                Your body holds infinite wisdom, stories, and healing potential.
                                Through conscious movement and embodied practices, we create space
                                for this wisdom to emerge.
                            </p>
                            <p>
                                Our offerings integrate somatic therapy, dance, breathwork, and
                                mindful movement to support your journey of healing, growth, and
                                authentic self-expression.
                            </p>
                            <p>
                                Whether you're seeking trauma healing, emotional release, or deeper
                                body awareness, our practitioners guide you with compassion and expertise.
                            </p>
                        </div>
                        <div className="mt-8">
                            <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg transition-all backdrop-blur-sm border border-white/20">
                                Book a Session
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side - Spiral Carousel */}
                <div className="movement-carousel-section">
                    <div className="w-full max-w-lg">
                        <SpiralCarousel doubleHelix={true}>
                            {siteData.map((site, index) => (
                                <SiteCard
                                    key={index}
                                    title={site.title}
                                    price={site.price}
                                    description={site.description}
                                    image={site.image}
                                    location={site.location}
                                    onView={() => console.log('View:', site.title)}
                                    onInfo={() => console.log('Info:', site.title)}
                                    index={index}
                                    totalCards={siteData.length}
                                />
                            ))}
                        </SpiralCarousel>
                        <div className="text-center mt-6">
                            <p className="text-white/80 text-sm font-light">
                                Drag vertically to explore the DNA-like helix
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 