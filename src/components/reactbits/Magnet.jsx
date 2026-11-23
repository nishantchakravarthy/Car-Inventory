// Adapted from React Bits "Magnet" — elements lean toward the cursor.
import { useRef } from 'react';
import gsap from 'gsap';

export default function Magnet({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const q = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!q.current) q.current = { x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,0.4)' }), y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,0.4)' }) };
    const r = el.getBoundingClientRect();
    q.current.x((e.clientX - (r.left + r.width / 2)) * strength);
    q.current.y((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { q.current?.x(0); q.current?.y(0); };
  return <span ref={ref} className={`magnet ${className}`} onPointerMove={move} onPointerLeave={leave}>{children}</span>;
}
