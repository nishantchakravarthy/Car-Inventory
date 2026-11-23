// Adapted from React Bits "ClickSpark" — sparks burst where you click.
import { useEffect, useRef } from 'react';

export default function ClickSpark({ color = '#ffb08a', count = 9, radius = 22, children }) {
  const cv = useRef(null);
  useEffect(() => {
    const c = cv.current, g = c.getContext('2d');
    let sparks = [], raf;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d; g.setTransform(d, 0, 0, d, 0, 0); };
    size();
    addEventListener('resize', size);
    const click = (e) => {
      const now = performance.now();
      for (let i = 0; i < count; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (i / count) * Math.PI * 2, t: now });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const draw = (now) => {
      g.clearRect(0, 0, c.width, c.height);
      sparks = sparks.filter((s) => {
        const p = (now - s.t) / 450;
        if (p >= 1) return false;
        const e = 1 - Math.pow(1 - p, 3), d = e * radius, len = 9 * (1 - e);
        g.strokeStyle = color; g.lineWidth = 2; g.lineCap = 'round';
        g.beginPath();
        g.moveTo(s.x + d * Math.cos(s.a), s.y + d * Math.sin(s.a));
        g.lineTo(s.x + (d + len) * Math.cos(s.a), s.y + (d + len) * Math.sin(s.a));
        g.stroke();
        return true;
      });
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    addEventListener('pointerdown', click);
    return () => { removeEventListener('resize', size); removeEventListener('pointerdown', click); cancelAnimationFrame(raf); };
  }, [color, count, radius]);
  return <>{children}<canvas ref={cv} className="click-spark" aria-hidden="true" /></>;
}
