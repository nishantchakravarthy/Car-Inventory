// Adapted from React Bits "ScrollVelocity" — marquee that speeds up and skews with scroll velocity.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVelocity({ items, speed = 40, reverse = false, className = '' }) {
  const track = useRef(null);
  useEffect(() => {
    const el = track.current;
    let x = 0, boost = 0, raf;
    const dir = reverse ? 1 : -1;
    const st = ScrollTrigger.create({ onUpdate: (s) => { boost = gsap.utils.clamp(-8, 8, s.getVelocity() / 300); } });
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      boost *= 0.92;
      const half = el.scrollWidth / 2;
      x += dir * (speed + Math.abs(boost) * speed) * dt;
      if (x <= -half) x += half; if (x >= 0 && reverse) x -= half;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${boost * -1.2}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); st.kill(); };
  }, [speed, reverse]);
  const row = items.map((t, i) => <span className="sv-item" key={i}>{t}<i className="sv-dot" /></span>);
  return (
    <div className={`scroll-velocity ${className}`} aria-label={items.join(', ')}>
      <div className="sv-track" ref={track} aria-hidden="true">{row}{row}</div>
    </div>
  );
}
