'use client';

import React, { useState, useEffect } from 'react';
import './InvestigationBoard.css';

interface PhotoItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    position: { x: number; y: number };
    connections: string[]; // IDs of connected photos
}

interface InvestigationBoardProps {
    photos?: PhotoItem[];
}

export default function InvestigationBoard({ photos = [] }: InvestigationBoardProps) {
    const [boardPhotos, setBoardPhotos] = useState<PhotoItem[]>([
        {
            id: '1',
            title: 'Ancient Artifact',
            description: 'Mysterious relic discovered in the depths',
            imageUrl: '/spirit.jpeg',
            position: { x: 100, y: 80 },
            connections: ['2', '3']
        },
        {
            id: '2',
            title: 'Hidden Chamber',
            description: 'Secret room behind the old library',
            imageUrl: '/space.png',
            position: { x: 300, y: 120 },
            connections: ['1', '4']
        },
        {
            id: '3',
            title: 'Coded Message',
            description: 'Encrypted text found in the archives',
            imageUrl: '/noise.svg',
            position: { x: 150, y: 250 },
            connections: ['1', '5']
        },
        {
            id: '4',
            title: 'Strange Symbols',
            description: 'Unknown markings on the walls',
            imageUrl: '/file.svg',
            position: { x: 400, y: 200 },
            connections: ['2', '6']
        },
        {
            id: '5',
            title: 'Time Anomaly',
            description: 'Clock that runs backwards',
            imageUrl: '/globe.svg',
            position: { x: 200, y: 350 },
            connections: ['3', '6']
        },
        {
            id: '6',
            title: 'The Gateway',
            description: 'Portal to another dimension',
            imageUrl: '/window.svg',
            position: { x: 350, y: 320 },
            connections: ['4', '5']
        }
    ]);

    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handlePhotoMouseDown = (e: React.MouseEvent, photoId: string) => {
        e.preventDefault();
        setSelectedPhoto(photoId);
        setIsDragging(true);

        const photo = boardPhotos.find(p => p.id === photoId);
        if (photo) {
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && selectedPhoto) {
            const boardRect = e.currentTarget.getBoundingClientRect();
            const newX = Math.max(0, Math.min(boardRect.width - 150, e.clientX - boardRect.left - dragOffset.x));
            const newY = Math.max(0, Math.min(boardRect.height - 150, e.clientY - boardRect.top - dragOffset.y));

            setBoardPhotos(prev => prev.map(photo =>
                photo.id === selectedPhoto
                    ? { ...photo, position: { x: newX, y: newY } }
                    : photo
            ));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setSelectedPhoto(null);
    };

    const renderConnections = () => {
        const connections: JSX.Element[] = [];

        boardPhotos.forEach(photo => {
            photo.connections.forEach(connectedId => {
                const connectedPhoto = boardPhotos.find(p => p.id === connectedId);
                if (connectedPhoto) {
                    const x1 = photo.position.x + 75; // Center of photo
                    const y1 = photo.position.y + 75;
                    const x2 = connectedPhoto.position.x + 75;
                    const y2 = connectedPhoto.position.y + 75;

                    // Calculate distance for tension effect
                    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const tensionClass = distance > 200 ? 'tension-high' : distance > 150 ? 'tension-medium' : 'tension-low';

                    connections.push(
                        <line
                            key={`${photo.id}-${connectedId}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#8B4513"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            className={`connection-line ${tensionClass}`}
                        />
                    );
                }
            });
        });

        return connections;
    };

    return (
        <div className="investigation-board-container">
            <div
                className="investigation-board"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Cork board background */}
                <div className="cork-board">
                    {/* Connection lines */}
                    <svg className="connections-layer" width="100%" height="100%">
                        {renderConnections()}
                    </svg>

                    {/* Photos */}
                    {boardPhotos.map(photo => (
                        <div
                            key={photo.id}
                            className={`photo-item ${selectedPhoto === photo.id ? 'selected' : ''}`}
                            style={{
                                left: photo.position.x,
                                top: photo.position.y
                            }}
                            onMouseDown={(e) => handlePhotoMouseDown(e, photo.id)}
                        >
                            <div className="photo-pin"></div>
                            <div className="photo-image">
                                <img src={photo.imageUrl} alt={photo.title} />
                            </div>
                            <div className="photo-info">
                                <h3>{photo.title}</h3>
                                <p>{photo.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 