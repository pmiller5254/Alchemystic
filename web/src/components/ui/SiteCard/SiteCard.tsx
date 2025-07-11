'use client';

import React from 'react';
import Image from 'next/image';
import './SiteCard.css';

interface SiteCardProps {
    title: string;
    price: string;
    description: string;
    image: string;
    location?: string;
    onView?: () => void;
    onInfo?: () => void;
    index?: number; // Position in the carousel
    totalCards?: number; // Total number of cards
}

export default function SiteCard({
    title,
    price,
    description,
    image,
    location,
    onView,
    onInfo,
    index = 0,
    totalCards = 1
}: SiteCardProps) {
    // Calculate background position for continuous sky panning effect
    const backgroundPositionX = totalCards > 1 ? (index / (totalCards - 1)) * 100 : 50;

    const cardStyle = {
        backgroundImage: 'url(/sky.jpg)',
        backgroundSize: '300% 100%', // Make image wider for panning effect
        backgroundPosition: `${backgroundPositionX}% center`,
        backgroundRepeat: 'no-repeat'
    };
    return (
        <div className="site-card" style={cardStyle}>
            <div className="site-card-image">
                <Image
                    src={image}
                    alt={title}
                    width={60}
                    height={60}
                    className="site-card-icon"
                />
                {location && (
                    <div className="site-card-location">
                        <span>{location}</span>
                    </div>
                )}
            </div>

            <div className="site-card-content">
                <div className="site-card-header">
                    <h3 className="site-card-title">{title}</h3>
                    <span className="site-card-price">{price}</span>
                </div>

                <p className="site-card-description">{description}</p>

                <div className="site-card-buttons">
                    <button
                        className="site-card-button view-button"
                        onClick={onView}
                    >
                        View
                    </button>
                    <button
                        className="site-card-button info-button"
                        onClick={onInfo}
                    >
                        Info
                    </button>
                </div>
            </div>
        </div>
    );
} 