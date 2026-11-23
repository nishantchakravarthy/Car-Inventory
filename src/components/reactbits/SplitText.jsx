// Adapted from React Bits "SplitText" (reactbits.dev) — char-by-char GSAP reveal.
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SplitText({ text, as: Tag = 'span', className = '', delay = 0, stagger = 0.025, scroll = false, ...rest }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const chars = ref.current.querySelectorAll('.st-char');
    const ctx = gsap.context(() => {
      gsap.from(chars, {
        yPercent: 110, rotate: 6, opacity: 0, duration: 0.9, ease: 'expo.out', stagger, delay,
        scrollTrigger: scroll ? { trigger: ref.current, start: 'top 85%', once: true } : undefined,
      });
    }, ref);
    return () => ctx.revert();
  }, [text, delay, stagger, scroll]);
  const words = text.split(' ');
  return (
    <Tag ref={ref} className={`split-text ${className}`} aria-label={text} {...rest}>
      {words.map((w, wi) => (
        <span className="st-word" aria-hidden="true" key={wi}>
          {[...w].map((ch, ci) => <span className="st-char" key={ci}>{ch}</span>)}
          {wi < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
