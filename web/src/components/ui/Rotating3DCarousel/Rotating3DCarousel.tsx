'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import SiteCard from '../SiteCard/SiteCard';
import './Rotating3DCarousel.css';

// Register GSAP plugins
gsap.registerPlugin(Observer);

interface Site {
    id: number;
    title: string;
    price: string;
    description: string;
    image: string;
    location?: string;
}

interface Rotating3DCarouselProps {
    sites?: Site[];
    numPanels?: number;
}

export default function Rotating3DCarousel({
    sites,
    numPanels = 8
}: Rotating3DCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const progress = useRef({ value: 0 });
    const radius = 400; // Further reduced to maximize card visibility

    useGSAP(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const images = carousel.querySelectorAll('.carousel-item');

        const observer = Observer.create({
            target: carousel,
            type: "wheel,pointer",
            onChange: (self) => {
                gsap.killTweensOf(progress.current);
                const p = self.event.type === 'wheel' ? self.deltaY * -.000125 : self.deltaX * .0125;
                gsap.to(progress.current, {
                    duration: 2,
                    ease: 'power4.out',
                    value: `+=${p}`
                });
            }
        });

        const animate = () => {
            images.forEach((image, index) => {
                const theta = index / images.length - progress.current.value;
                const x = -Math.sin(theta * Math.PI * 2) * radius;
                const y = Math.cos(theta * Math.PI * 2) * radius;

                // Calculate distance from center front position (x=0, y=radius)
                const distanceFromFront = Math.sqrt(x * x + (y - radius) * (y - radius));
                const maxDistance = radius * 2; // Maximum possible distance
                const normalizedDistance = Math.min(distanceFromFront / maxDistance, 1);

                // Calculate scale and opacity based on distance from front center
                const visibility = Math.max(0, 1 - normalizedDistance * 1.5); // More aggressive falloff
                const scale = 0.5 + (visibility * 0.5); // Scale from 0.5 to 1.0
                const opacity = visibility; // Direct mapping for opacity

                // Apply transforms
                (image as HTMLElement).style.transform = `translate3d(${x}px, 0px, ${y}px) rotateY(${360 * -theta}deg) scale(${scale})`;
                (image as HTMLElement).style.opacity = opacity.toString();
            });
        };

        gsap.ticker.add(animate);

        return () => {
            observer.kill();
            gsap.ticker.remove(animate);
        };
    }, [numPanels]);

    // Generate panels if no sites provided, otherwise use sites
    const panels = sites || Array.from({ length: numPanels }, (_, i) => ({
        id: i + 1,
        title: `Site ${i + 1}`,
        price: `$${(i + 1) * 100}/night`,
        description: `Experience the magic of Site ${i + 1}. A transformative space for connection and growth.`,
        image: '/space.png', // placeholder image
        location: `Location ${i + 1}`
    }));

    const handleView = (siteId: number) => {
        console.log(`View requested for site ${siteId}`);
        // TODO: Implement view functionality (e.g., navigate to site details)
    };

    const handleInfo = (siteId: number) => {
        console.log(`More info requested for site ${siteId}`);
        // TODO: Implement info modal or popup
    };

    return (
        <div className="carousel-container">
            <div
                className="carousel"
                ref={carouselRef}
            >
                {panels.map((site, index) => (
                    <div key={site.id} className="carousel-item">
                        <SiteCard
                            title={site.title}
                            price={site.price}
                            description={site.description}
                            image={site.image}
                            location={site.location}
                            onView={() => handleView(site.id)}
                            onInfo={() => handleInfo(site.id)}
                            index={index}
                            totalCards={panels.length}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
} 