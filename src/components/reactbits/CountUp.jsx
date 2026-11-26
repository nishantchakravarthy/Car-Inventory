// Adapted from React Bits "CountUp" — counts when scrolled into view.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CountUp({ to, from = 0, duration = 2, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fmt = (v) => `${prefix}${new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v)}${suffix}`;
    const o = { v: from };
    el.textContent = fmt(from);
    const tw = gsap.to(o, {
      v: to, duration, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); },
      scrollTrigger: { trigger: el, start: 'top bottom', once: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); };
  }, [to, from, duration, decimals, prefix, suffix]);
  return <span ref={ref} className={className} />;
}
