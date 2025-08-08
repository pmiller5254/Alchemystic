'use client';

import React, { useRef, useEffect, useMemo } from 'react';


interface DrippingFluidEffectProps {
    scrollProgress?: number;
    theme?: 'purple' | 'blue' | 'forest' | 'gold';
    className?: string;
    style?: React.CSSProperties;
}

// Vertex shader
const vertexShader = `
    precision mediump float;
    varying vec2 vUv;
    attribute vec2 a_position;

    void main() {
        vUv = a_position;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment shader (adapted from CodePen)
const fragmentShader = `
    precision mediump float;

    varying vec2 vUv;
    uniform vec2 u_resolution;
    uniform float u_scroll_progr;
    uniform float u_col_width;
    uniform float u_seed;
    uniform float u_scale;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_opacity;
    uniform vec3 u_color;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    float get_l(vec2 v) {
        return 1. - clamp(0., 1., length(v));
    }

    float rand(float n) {
        return fract(sin(n) * 43758.5453123);
    }

    void main() {
        float scale = .001 * u_scale;
        float speed = .001 * u_speed;

        vec2 uv = vUv;
        uv.x *= (scale * u_resolution.x);

        vec2 noise_uv = uv;
        noise_uv *= 5.;
        noise_uv.y *= (.25 * scale * u_resolution.y);
        noise_uv += vec2(0., u_time * 1.5 * speed);
        float shape = 0.;
        shape += snoise(noise_uv);
        shape = clamp(.5 + .5 * shape, 0., 1.);
        shape *= pow(.5 * uv.y + .7 + pow(u_scroll_progr, 2.) + (.4 * u_scroll_progr * (1. - pow(vUv.x - .2, 2.))), 10.);
        shape = clamp(shape, 0., 1.);

        float dots = 0.;
        float bars = 0.;
        float light = 0.;

        const int num_col = 9;
        for (int i = 0; i < num_col; i++) {

            vec2 col_uv = vUv;

            float start_time_offset = rand(100. * (float(i) + u_seed));
            float c_t = fract(u_time * speed + start_time_offset);
            float drop_time = .2 + .6 * rand(10. * (float(i) + u_seed));

            float before_drop_normal = c_t / drop_time;
            float before_drop_t = pow(before_drop_normal, .4) * drop_time;
            float after_drop_normal = max(0., c_t - drop_time) / (1. - drop_time);
            float after_drop_t_dot = 3. * pow(after_drop_normal, 2.) * (1. - drop_time);
            float after_drop_t_bar = pow(after_drop_normal, 2.) * (drop_time);

            float eased_drop_t = step(c_t, drop_time) * before_drop_t;
            eased_drop_t += step(drop_time, c_t) * (drop_time + after_drop_t_dot);

            col_uv.y += (1. + 3. * rand(15. * float(i))) * u_scroll_progr;

            col_uv.x *= (u_resolution.x / u_resolution.y);
            col_uv *= (7. * scale * u_resolution.y);

            col_uv.x += (u_col_width * (.5 * float(num_col) - float(i)));

            vec2 dot_uv = col_uv;
            dot_uv.y += 4. * (eased_drop_t - .5);

            float dot = get_l(dot_uv);
            dot = pow(dot, 4.);

            float drop_grow = step(c_t, drop_time) * pow(before_drop_normal, .4);
            drop_grow += step(drop_time, c_t) * mix(1., .8, clamp(7. * after_drop_normal, 0., 1.));
            dot *= drop_grow;

            dot *= step(.5, drop_time);
            dots += dot;

            vec2 bar_uv = col_uv;
            bar_uv.y += step(c_t, drop_time) * 4. * (before_drop_t - .5);
            bar_uv.y += step(drop_time, c_t) * 4. * (drop_time - after_drop_t_bar - .5);

            float bar = smoothstep(-.5, 0., bar_uv.x) * (1. - smoothstep(0., .5, bar_uv.x));
            bar = pow(bar, 4.);
            light += bar * smoothstep(.0, .1, -bar_uv.x);
            float bar_mask = smoothstep(-.2, .2, bar_uv.y);
            bar *= bar_mask;

            bars += bar;
        }

        shape += bars;
        shape = clamp(shape, 0., 1.);
        shape += dots;

        float gooey = smoothstep(.48, .5, shape);
        gooey -= .1 * smoothstep(.5, .6, shape);
        // Tar-like color: mostly black, with theme accent highlights
        vec3 base = vec3(0.05, 0.05, 0.05); // nearly black
        vec3 accent = u_color;
        // Accent appears as highlight where gooey is high and at the edge
        float edge = smoothstep(0.45, 0.5, shape) - smoothstep(0.6, 1.0, shape);
        vec3 color = mix(base, accent, edge * 0.7 + gooey * 0.2);
        color = mix(color, vec3(1.), max(0., 1. - 2. * vUv.y) * light * smoothstep(.1, .7, snoise(.5 * uv)) * (smoothstep(.49, .6, shape) - smoothstep(.6, 1., shape)));
        gl_FragColor = vec4(color, gooey);
    }
`;

export default function DrippingFluidEffect({
    scrollProgress = 0,
    theme = 'purple',
    className = '',
    style
}: DrippingFluidEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const uniformsRef = useRef<Record<string, WebGLUniformLocation | null> | null>(null);
    const animationRef = useRef<number | null>(null);

    // Theme colors for the dripping effect
    const themeColors = useMemo(() => ({
        purple: [0.65, 0.55, 0.98], // #a78bfa
        blue: [0.23, 0.51, 0.96],   // #3b82f6
        forest: [0.13, 0.77, 0.37], // #22c55e
        gold: [0.96, 0.62, 0.04]    // #f59e0b
    }), []);

    // Parameters for the dripping effect - matching CodePen defaults
    const params = useMemo(() => ({
        colWidth: 1.5,
        speed: 0.05,
        scale: 0.15,
        seed: 0.176
    }), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        glRef.current = gl;

        // Create shaders
        const createShader = (source: string, type: number) => {
            const shader = gl.createShader(type);
            if (!shader) return null;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShaderObj = createShader(vertexShader, gl.VERTEX_SHADER);
        const fragmentShaderObj = createShader(fragmentShader, gl.FRAGMENT_SHADER);

        if (!vertexShaderObj || !fragmentShaderObj) return;

        // Create program
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShaderObj);
        gl.attachShader(program, fragmentShaderObj);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Get uniforms
        const uniforms: Record<string, WebGLUniformLocation | null> = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniform = gl.getActiveUniform(program, i);
            if (uniform) {
                uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
            }
        }
        uniformsRef.current = uniforms;

        // Create geometry
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Set initial uniforms
        const resizeCanvas = () => {
            const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
            canvas.width = window.innerWidth * devicePixelRatio;
            canvas.height = window.innerHeight * devicePixelRatio;
            gl.viewport(0, 0, canvas.width, canvas.height);

            if (uniforms.u_resolution) {
                gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Set other uniforms
        if (uniforms.u_col_width) gl.uniform1f(uniforms.u_col_width, params.colWidth);
        if (uniforms.u_speed) gl.uniform1f(uniforms.u_speed, params.speed);
        if (uniforms.u_scale) gl.uniform1f(uniforms.u_scale, params.scale);
        if (uniforms.u_seed) gl.uniform1f(uniforms.u_seed, params.seed);
        if (uniforms.u_opacity) gl.uniform1f(uniforms.u_opacity, 1.0);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Animation loop
        const render = () => {
            const currentTime = performance.now();

            if (uniforms.u_time) gl.uniform1f(uniforms.u_time, currentTime);
            if (uniforms.u_scroll_progr) gl.uniform1f(uniforms.u_scroll_progr, scrollProgress);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vertexShaderObj);
            gl.deleteShader(fragmentShaderObj);
        };
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    // Update theme color
    useEffect(() => {
        if (uniformsRef.current?.u_color) {
            const color = themeColors[theme];
            glRef.current?.uniform3f(uniformsRef.current.u_color, color[0], color[1], color[2]);
        }
    }, [theme, themeColors]);

    return (
        <canvas
            ref={canvasRef}
            className={`dripping-fluid-effect ${className}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 20,
                ...style
            }}
        />
    );
} 