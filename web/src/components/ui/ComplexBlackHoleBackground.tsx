import { useEffect, useRef } from 'react';

interface ComplexBlackHoleBackgroundProps {
    scrollProgress?: number;
}

const PARTICLE_COUNT = 120;
const DISK_INNER_RADIUS_RATIO = 0.483;
const DISK_OUTER_RADIUS_RATIO = 0.633;
const PARTICLE_SIZE = 3;
const SWIRL_SPEED = 0.18;
const COLORS = [
    '#a21caf', // deep magenta
    '#a78bfa', // cosmic purple
    '#6D28D9', // indigo
    '#f472b6', // pink
    '#fff1f2', // white highlight
];

export default function ComplexBlackHoleBackground({ scrollProgress = 0 }: ComplexBlackHoleBackgroundProps) {
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
                const theta = (2 * Math.PI * i) / points + Math.PI / 2;
                const wave = Math.sin(theta * (waveFrequency * 0.5) - elapsed * (timeSpeed * 0.5) + randomPhase.current[i]) * (waveAmplitude * 0.3) * randomAmp.current[i];
                const r = baseInner + wave;
                const x = centerX + r * Math.cos(theta);
                const y = centerY + r * Math.sin(theta);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            // Fill with a cosmic purple/magenta gradient
            const grad = ctx.createRadialGradient(centerX, centerY, baseInner, centerX, centerY, baseOuter + waveAmplitude);
            grad.addColorStop(0, 'rgba(168,139,250,0.08)');
            grad.addColorStop(0.5, 'rgba(168,139,250,0.18)');
            grad.addColorStop(0.8, 'rgba(162,28,175,0.22)');
            grad.addColorStop(1, 'rgba(109,40,217,0.18)');
            ctx.shadowColor = '#a78bfa';
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
            ctx.shadowColor = '#a21caf';
            ctx.shadowBlur = 60 * scale;
            ctx.globalAlpha = 0.98;
            ctx.fill();
            ctx.restore();

            // Draw bright outer edge ring (accretion disk intensity)
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, minDim * DISK_INNER_RADIUS_RATIO * 0.805, 0, Math.PI * 2);
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 8 * scale;
            ctx.shadowColor = '#a78bfa';
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