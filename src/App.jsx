import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Aurora from './components/reactbits/Aurora.jsx';
import ClickSpark from './components/reactbits/ClickSpark.jsx';
import { Nav, Footer } from './sections/Chrome.jsx';
import Hero from './sections/Hero.jsx';
import Showroom from './sections/Showroom.jsx';
import Inventory from './sections/Inventory.jsx';
import Finance from './sections/Finance.jsx';
import CarModal from './sections/CarModal.jsx';
import { Stage } from './three/Stage.js';
import { renderInventory } from './three/renders.js';
import { FEATURED, INVENTORY } from './data/inventory.js';

gsap.registerPlugin(ScrollTrigger);

const AURORA = ['#ff5a1f', '#1f8ea3', '#ffb08a'];
// Camera stops for the scroll-scrubbed walkaround (theta = orbit angle, phi = elevation).
const WALK = [
  { theta: 0.62, phi: 0.1, dist: 10, lookY: 0.6 },
  { theta: 0.0, phi: 0.04, dist: 10.6, lookY: 0.62 },
  { theta: -2.3, phi: 0.16, dist: 9.8, lookY: 0.62 },
  { theta: -3.95, phi: 0.6, dist: 11.2, lookY: 0.4 },
];

const loadSaved = () => { try { return JSON.parse(localStorage.getItem('halden-saved') || '[]'); } catch { return []; } };

export default function App() {
  const stageCanvas = useRef(null);
  const stage = useRef(null);
  const [featured, setFeatured] = useState(0);
  const [driving, setDriving] = useState(false);
  const [open, setOpen] = useState(null);
  const [renders, setRenders] = useState({});
  const [saved, setSaved] = useState(loadSaved);
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 3D stage + intro drive-in
  useLayoutEffect(() => {
    const s = new Stage(stageCanvas.current, { reduceMotion: reduce });
    stage.current = s;
    s.setCar(FEATURED[0]);
    if (!reduce) {
      s.carX = -14;
      s.state.ribbonSpeed = 6;
      gsap.to(s, { carX: 0, duration: 2.4, ease: 'expo.out', delay: 0.35 });
      gsap.to(s.state, { ribbonSpeed: 1, duration: 2.6, ease: 'power2.out', delay: 0.35 });
      gsap.fromTo(s.state, { intro: 1 }, { intro: 0, duration: 3, ease: 'expo.out' });
    }
    return () => s.dispose();
  }, []);

  // Studio renders for the inventory grid (sequential, off the main stage)
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => renderInventory(INVENTORY, (id, url) => alive && setRenders((r) => ({ ...r, [id]: url }))), 600);
    return () => { alive = false; clearTimeout(t); };
  }, []);

  useEffect(() => { try { localStorage.setItem('halden-saved', JSON.stringify(saved)); } catch { /* storage unavailable */ } }, [saved]);

  // Scroll choreography
  useLayoutEffect(() => {
    const s = stage.current;
    const mm = gsap.matchMedia();
    mm.add({ mobile: '(max-width: 760px)', desktop: '(min-width: 761px)' }, (ctx) => {
      const { mobile } = ctx.conditions;
      const sx = mobile ? 0 : -0.1;
      Object.assign(s.state, { shiftX: mobile ? 0 : 0.18, shiftY: mobile ? 0.25 : 0.03, theta: 0.95, phi: 0.16, lookY: 0.62 });
      s.state.dist = mobile ? 10.5 : 12;

      gsap.timeline({ scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: 1 } })
        .to(s.state, { ...WALK[0], shiftX: sx, shiftY: mobile ? 0.12 : 0, ease: 'none' }, 0)
        .to('.hero-copy, .hero-dock, .scroll-hint', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
        .to(s.state, { spin: 0, ease: 'none' }, 0);

      const panels = gsap.utils.toArray('.callout');
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });
      const walk = gsap.timeline({
        scrollTrigger: {
          trigger: '#showroom', start: 'top top', end: '+=300%', pin: true, scrub: 1, id: 'walk',
          onEnter: () => gsap.to(s, { auto: Math.round(s.auto / (Math.PI * 2)) * Math.PI * 2, duration: 1, ease: 'power2.inOut' }),
        },
      });
      for (let i = 1; i < WALK.length; i++) {
        walk.to(s.state, { ...WALK[i], duration: 1, ease: 'power1.inOut' }, i - 1)
          .to(panels[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, i - 1 + 0.1)
          .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.35 }, i - 0.45);
      }
      walk.fromTo('.rail-fill', { scaleY: 0 }, { scaleY: 1, duration: 3, ease: 'none' }, 0);
      gsap.from('.showroom-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '#showroom', start: 'top 70%', toggleActions: 'play none none reverse' } });

      // Fade the stage away as the inventory slides over it, and stop rendering when hidden.
      gsap.to('.stage-canvas', {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#inventory', start: 'top bottom', end: 'top 25%', scrub: true, onUpdate: (st) => { s.running = st.progress < 0.999; }, onLeaveBack: () => { s.running = true; } },
      });

      // One scroll per section through the story; free scrolling once you reach the inventory.
      if (!reduce) {
        const inv = ScrollTrigger.create({ trigger: '#inventory', start: 'top top' });
        ScrollTrigger.create({
          start: 0, end: 'max',
          snap: {
            snapTo: (v, self) => {
              const max = ScrollTrigger.maxScroll(window);
              const w = ScrollTrigger.getById('walk');
              if (!w || v * max > inv.start + 4) return v;
              const step = (w.end - w.start) / 3;
              const pts = [0, w.start, w.start + step, w.start + step * 2, w.end, inv.start].map((p) => p / max);
              return ScrollTrigger.snapDirectional(pts)(v, self.direction);
            },
            duration: { min: 0.35, max: 0.9 }, delay: 0.06, ease: 'power3.inOut',
          },
        });
      }
    });
    return () => mm.revert();
  }, []);

  const onFeature = useCallback(async (i) => {
    setDriving(true);
    setFeatured(i);
    await stage.current.driveTo(FEATURED[i]);
    setDriving(false);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const st = id === 'showroom' ? ScrollTrigger.getById('walk') : null;
    window.scrollTo({ top: st ? st.start : el.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' });
  };

  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <ClickSpark>
      <Aurora colorStops={AURORA} />
      <canvas ref={stageCanvas} className="stage-canvas" aria-label="3D showroom" role="img" />
      <Nav go={go} onDrive={() => setOpen(FEATURED[featured])} />
      <main>
        <Hero featured={featured} onFeature={onFeature} driving={driving} onExplore={() => go('inventory')} onOpen={setOpen} />
        <Showroom featured={featured} onOpen={setOpen} />
        <Inventory renders={renders} saved={saved} onSave={toggleSave} onOpen={setOpen} />
        <Finance />
      </main>
      <Footer go={go} />
      {open && <CarModal key={open.id} car={open} saved={saved.includes(open.id)} onSave={toggleSave} onClose={() => setOpen(null)} />}
    </ClickSpark>
  );
}
