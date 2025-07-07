'use client';

import TestBlackHoleBackground from '@/components/ui/TestBlackHoleBackground/TestBlackHoleBackground';

export default function TestPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
            {/* Force the background to be visible */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <TestBlackHoleBackground scrollProgress={1} />
            </div>

            {/* Debug info */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '16px', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '10px' }}>
                <div>Test Background Page</div>
                <div>scrollProgress: 1</div>
                <div>zIndex: 1</div>
            </div>

            {/* Center text */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontSize: '24px', zIndex: 10, textAlign: 'center' }}>
                <div>Black Hole Test</div>
                <div style={{ fontSize: '16px', marginTop: '10px' }}>You should see a purple swirling black hole</div>
            </div>
        </div>
    );
} 