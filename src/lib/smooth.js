// Shared handle to the page's ScrollSmoother so any component can scroll or pause it.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let smoother = null;
export const setSmoother = (s) => { smoother = s; };
export const getSmoother = () => smoother;

export function scrollToId(id, offset = 72) {
  const el = document.getElementById(id);
  if (!el) return;
  if (smoother) smoother.scrollTo(el, true, `top ${offset}px`);
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

export function lockScroll(locked) {
  if (smoother) smoother.paused(locked);
  document.documentElement.classList.toggle('locked', locked);
  if (!locked) ScrollTrigger.refresh();
}
