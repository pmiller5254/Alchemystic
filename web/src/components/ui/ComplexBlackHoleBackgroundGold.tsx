import { useEffect, useRef } from 'react';

interface ComplexBlackHoleBackgroundProps {
    scrollProgress?: number;
}

const PARTICLE_COUNT = 120;
const DISK_INNER_RADIUS_RATIO = 0.483; // Increased by 15% from 0.42
const DISK_OUTER_RADIUS_RATIO = 0.633; // Increased by 15% from 0.55
const PARTICLE_SIZE = 3;
const SWIRL_SPEED = 0.18;
const COLORS = [
    '#fbbf24', // amber
    '#f59e0b', // amber-500
    '#d97706', // amber-600
    '#ea580c', // orange-600
    '#dc2626', // red-600
    '#fef3c7', // amber-100
];

export default function ComplexBlackHoleBackgroundGold({ scrollProgress = 0 }: ComplexBlackHoleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate random phase/amplitude arrays once per component mount
    const randomPhase = useRef(Array.from({ length: 181 }, () => Math.random() * Math.PI * 2));
    const randomAmp = useRef(Array.from({ length: 181 }, () => 0.97 + Math.random() * 0.03));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let minDim = Math.min(width, height);
        let centerX = width / 2;
        let centerY = height / 2;
        let startTime = Date.now();

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            minDim = Math.min(width, height);
            centerX = width / 2;
            centerY = height / 2;
            canvas.width = width;
            canvas.height = height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Precompute particle orbits
        const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const angle = (2 * Math.PI * i) / PARTICLE_COUNT + Math.random() * 0.1;
            const radius =
                minDim *
                (DISK_INNER_RADIUS_RATIO +
                    Math.random() * (DISK_OUTER_RADIUS_RATIO - DISK_INNER_RADIUS_RATIO));
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const speed = SWIRL_SPEED * (0.7 + Math.random() * 0.6);
            const size = PARTICLE_SIZE + Math.random() * 2;
            return { angle, radius, color, speed, size, offset: Math.random() * 1000 };
        });

        function drawWavyDisk(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, minDim: number, elapsed: number) {
            const points = 180;
            const baseOuter = minDim * DISK_OUTER_RADIUS_RATIO * 0.805;
            const baseInner = minDim * DISK_INNER_RADIUS_RATIO * 0.805;
            const waveAmplitude = minDim * 0.035 * 0.805;
            const waveFrequency = 8;
            const timeSpeed = 0.3;
            // Use precomputed random phase/amplitude
            ctx.save();
            ctx.globalAlpha = 0.55 + 0.5 * scrollProgress;
            ctx.beginPath();
            // Outer edge (wavy)
            for (let i = 0; i <= points; i++) {
                const theta = (i / points) * Math.PI * 2 + Math.PI / 2;
                const phase = randomPhase.current[i];
                const amp = randomAmp.current[i];
                const wave =
                    Math.sin(waveFrequency * theta + elapsed * timeSpeed + phase) * waveAmplitude * amp
                    + Math.sin(waveFrequency * 0.5 * theta + phase) * waveAmplitude * 0.15 * amp;
                const r = baseOuter + wave;
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            // Inner edge (reverse, less wavy)
            for (let i = points; i >= 0; i--) {
                const theta = (i / points) * Math.PI * 2 + Math.PI / 2;
                const phase = randomPhase.current[i];
                const amp = randomAmp.current[i];
                const wave = Math.sin(waveFrequency * theta - elapsed * timeSpeed + phase) * (waveAmplitude * 0.3) * amp;
                const r = baseInner + wave;
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            // Fill with a gold/orange gradient
            const grad = ctx.createRadialGradient(centerX, centerY, baseInner, centerX, centerY, baseOuter + waveAmplitude);
            grad.addColorStop(0, 'rgba(251,191,36,0.10)'); // amber
            grad.addColorStop(0.3, 'rgba(245,158,11,0.18)'); // amber-500
            grad.addColorStop(0.6, 'rgba(217,119,6,0.22)'); // amber-600
            grad.addColorStop(0.85, 'rgba(234,88,12,0.22)'); // orange-600
            grad.addColorStop(1, 'rgba(220,38,38,0.18)'); // red-600
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 60 * 0.805; // Increased by 15% from 0.7
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            const scale = 0.805; // Increased by 15% from 0.7

            // Draw wavy accretion disk
            drawWavyDisk(ctx, centerX, centerY, minDim, elapsed);
            // Draw swirling particles
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                const angle = p.angle + elapsed * p.speed + p.offset;
                // Elliptical orbit for lensing effect
                const rx = p.radius * (1.08 + 0.08 * Math.sin(elapsed * 0.2 + i)) * scale;
                const ry = p.radius * (0.92 + 0.08 * Math.cos(elapsed * 0.2 + i)) * scale;
                const x = centerX + rx * Math.cos(angle);
                const y = centerY + ry * Math.sin(angle);
                ctx.save();
                ctx.globalAlpha = 0.9 + 0.1 * scrollProgress; // Opacity changes with scroll
                ctx.beginPath();
                ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 16 * scale;
                ctx.fill();
                ctx.restore();
            }
            // Draw central black hole (with strong shadow)
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, minDim * DISK_INNER_RADIUS_RATIO * 0.805, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 60 * scale;
            ctx.globalAlpha = 0.98;
            ctx.fill();
            ctx.restore();

            // Draw bright outer edge ring (accretion disk intensity)
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, minDim * DISK_INNER_RADIUS_RATIO * 0.805, 0, Math.PI * 2);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 8 * scale;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 20 * scale;
            ctx.globalAlpha = 0.8;
            ctx.stroke();
            ctx.restore();

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [scrollProgress]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ opacity: 1 }}
        />
    );
} 