'use client';

import WebGLFluidBlackHole from '@/components/ui/WebGLFluidBlackHole/WebGLFluidBlackHole';

export default function DrippingPage() {

    return (
        <div>
            <WebGLFluidBlackHole theme="purple" />

            <div className="relative z-10">
                {/* Header section */}
                <div className="min-h-screen flex flex-col items-center justify-center px-4">
                    <h1 className="text-6xl md:text-8xl font-bold text-white text-center mb-8">
                        Dripping
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                            Black Hole
                        </span>
                    </h1>
                </div>
            </div>
        </div>
    );
} 