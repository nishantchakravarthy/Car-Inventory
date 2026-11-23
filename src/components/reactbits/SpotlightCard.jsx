// Adapted from React Bits "SpotlightCard" + "TiltedCard" — cursor spotlight with a subtle 3D tilt.
import { forwardRef, useRef } from 'react';
import gsap from 'gsap';

const SpotlightCard = forwardRef(function SpotlightCard({ children, className = '', spotlight = 'rgba(255,122,61,0.22)', tilt = 6, ...rest }, outerRef) {
  const ref = useRef(null);
  const q = useRef(null);
  const setRefs = (el) => { ref.current = el; if (typeof outerRef === 'function') outerRef(el); else if (outerRef) outerRef.current = el; };
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (!q.current) q.current = { rx: gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3' }), ry: gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3' }) };
    q.current.rx(((y / r.height) - 0.5) * -tilt);
    q.current.ry(((x / r.width) - 0.5) * tilt);
  };
  const onLeave = () => { q.current?.rx(0); q.current?.ry(0); };
  return (
    <div ref={setRefs} className={`spotlight-card ${className}`} style={{ '--spot': spotlight }} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </div>
  );
});
export default SpotlightCard;
