// Adapted from React Bits "Aurora" — full-screen flowing aurora shader (raw WebGL, no deps).
import { useEffect, useRef } from 'react';

const frag = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uBg;
vec3 perm(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0);
  vec3 p = perm(perm(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 ramp = uv.x < 0.5 ? mix(uA, uB, uv.x * 2.0) : mix(uB, uC, (uv.x - 0.5) * 2.0);
  float n = snoise(vec2(uv.x * 1.7 + uTime * 0.06, uTime * 0.09)) * 0.5 + 0.5;
  float n2 = snoise(vec2(uv.x * 3.1 - uTime * 0.04, uTime * 0.05 + 4.0)) * 0.5 + 0.5;
  float h = uv.y - (0.58 + n * 0.28);
  float band = exp(-h * h * 9.0) * (0.55 + n2 * 0.6);
  float curtain = smoothstep(0.0, 1.0, band) * smoothstep(-0.25, 0.5, uv.y - 0.25);
  float floorGlow = exp(-pow((uv.y - 0.02) * 4.0, 2.0)) * 0.12;
  vec3 col = uBg + ramp * curtain * 0.55 + uA * floorGlow;
  float vig = smoothstep(1.3, 0.35, length((uv - vec2(0.5, 0.55)) * vec2(1.0, 1.25)));
  gl_FragColor = vec4(col * (0.55 + 0.45 * vig), 1.0);
}`;
const vert = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export default function Aurora({ colorStops = ['#ff5a1f', '#2f9fb4', '#ffb08a'], background = '#08090b', speed = 1, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const gl = c.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    gl.uniform3fv(u('uA'), hex(colorStops[0]));
    gl.uniform3fv(u('uB'), hex(colorStops[1]));
    gl.uniform3fv(u('uC'), hex(colorStops[2]));
    gl.uniform3fv(u('uBg'), hex(background));
    const scale = 0.5;
    const resize = () => { c.width = Math.round(innerWidth * scale); c.height = Math.round(innerHeight * scale); gl.viewport(0, 0, c.width, c.height); gl.uniform2f(u('uRes'), c.width, c.height); };
    resize();
    addEventListener('resize', resize);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, t0 = performance.now();
    const loop = (t) => {
      if (!document.hidden) { gl.uniform1f(u('uTime'), reduce ? 8 : ((t - t0) / 1000) * speed); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, [colorStops, background, speed]);
  return <canvas ref={ref} className={`aurora ${className}`} aria-hidden="true" />;
}
