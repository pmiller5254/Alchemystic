import React, { useEffect } from 'react';
import './BookingModal.css';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="booking-modal-backdrop" onClick={onClose} />

            {/* Modal */}
            <div className="booking-modal">
                <div className="booking-modal-header">
                    <h2>Book Your Sacred Space</h2>
                    <button className="booking-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="booking-modal-content">
                    <p className="booking-modal-description">
                        Schedule a consultation to discuss your retreat needs and find the perfect sacred space for your transformative gathering.
                    </p>

                    {/* Calendly Embed */}
                    <div className="calendly-container">
                        <iframe
                            src="https://calendly.com/your-calendly-link" // Replace with your actual Calendly link
                            width="100%"
                            height="500"
                            frameBorder="0"
                            title="Schedule a Consultation"
                        />
                    </div>

                    <div className="booking-modal-footer">
                        <p className="booking-modal-note">
                            Can&apos;t find a suitable time? <a href="mailto:hello@alchemystic.com">Email us directly</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
} 