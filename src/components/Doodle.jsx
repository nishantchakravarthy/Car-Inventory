// Hand-drawn SVG doodles (circle, underline, arrow, squiggle, star) that draw themselves in with GSAP.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PATHS = {
  circle: { vb: '0 0 220 90', d: 'M118 6C62 2 10 18 7 44c-3 27 52 41 108 40 56-1 99-17 98-41C212 20 160 6 96 9' },
  underline: { vb: '0 0 200 20', d: 'M4 14c38-7 79-10 119-8 26 1 49 3 73-1' },
  arrow: { vb: '0 0 120 80', d: 'M6 8c26 6 52 22 68 44 6 8 10 16 13 24M70 66l18 10 6-20' },
  squiggle: { vb: '0 0 160 24', d: 'M3 14c12-12 22-12 30 0s20 12 30 0 22-12 30 0 20 12 30 0 18-10 32-2' },
  star: { vb: '0 0 60 60', d: 'M30 4l6 18 19 1-15 11 6 19-16-11-16 11 6-19L5 23l19-1z' },
};

export default function Doodle({ type = 'underline', className = '', color = 'currentColor', width = 4, delay = 0, scroll = true }) {
  const ref = useRef(null);
  useEffect(() => {
    const paths = ref.current.querySelectorAll('path');
    const ctx = gsap.context(() => {
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', delay,
          scrollTrigger: scroll ? { trigger: ref.current, start: 'top 90%', once: true } : undefined,
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, scroll]);
  const { vb, d } = PATHS[type];
  return (
    <svg ref={ref} className={`doodle doodle-${type} ${className}`} viewBox={vb} aria-hidden="true" fill="none">
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
