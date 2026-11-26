import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import Header from './sections/Header.jsx';
import Hero from './sections/Hero.jsx';
import Inventory, { START } from './sections/Inventory.jsx';
import CarSheet from './sections/CarSheet.jsx';
import BookingsDrawer from './sections/BookingsDrawer.jsx';
import { Brands, HowItWorks, Finance, Sell, Footer } from './sections/Services.jsx';
import { FEATURE } from './data/inventory.js';
import { setSmoother, scrollToId } from './lib/smooth.js';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const loadSaved = () => { try { return JSON.parse(localStorage.getItem('halden-saved') || '[]'); } catch { return []; } };
const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [filters, setFilters] = useState(START);
  const [saved, setSaved] = useState(loadSaved);
  const [open, setOpen] = useState(null);
  const [panel, setPanel] = useState(null); // bookings drawer: 'list' | 'visit' | 'inspect'
  const wrapper = useRef(null);

  useEffect(() => { try { localStorage.setItem('halden-saved', JSON.stringify(saved)); } catch { /* storage unavailable */ } }, [saved]);

  // Smooth scrolling, then the section-to-section "slide" transitions.
  useLayoutEffect(() => {
    if (reduceMotion) return undefined;
    const smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, effects: true, smoothTouch: 0.1, normalizeScroll: false });
    setSmoother(smoother);
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.panel');
      panels.forEach((panel, i) => {
        const next = panels[i + 1];
        if (!next) return;
        const inner = panel.querySelector(':scope > .panel-inner');
        const dim = panel.querySelector(':scope > .panel-dim');
        // Hold this panel in place while the next one slides up over it like a stacked card.
        ScrollTrigger.create({
          trigger: panel,
          start: () => (panel.offsetHeight <= window.innerHeight ? 'top top' : 'bottom bottom'),
          end: () => `+=${window.innerHeight}`,
          pin: true, pinSpacing: false, invalidateOnRefresh: true,
        });
        gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } })
          .fromTo(inner, { scale: 1, rotation: 0, transformOrigin: () => `50% ${Math.max(0, panel.offsetHeight - window.innerHeight / 2)}px` },
            { scale: 0.88, rotation: i % 2 ? 2 : -2, borderRadius: 32, ease: 'none' }, 0)
          .fromTo(dim, { autoAlpha: 0 }, { autoAlpha: 0.55, ease: 'none' }, 0);
        // The incoming panel's top edge peels in with a slight tilt.
        gsap.fromTo(next.querySelector(':scope > .panel-inner'), { rotation: i % 2 ? -1.5 : 1.5, y: 60 },
          { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
      });

      // Section headings rise in.
      gsap.utils.toArray('.panel h2').forEach((h) => {
        gsap.from(h, { y: 50, rotation: -2, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: { trigger: h, start: 'top 85%', toggleActions: 'play none none reverse' } });
      });

      // Keep the filter column in view on desktop (sticky does not work inside the smoothed content).
      gsap.matchMedia().add('(min-width: 861px)', () => {
        const f = document.querySelector('.filters');
        if (!f || f.offsetHeight > window.innerHeight - 120) return;
        ScrollTrigger.create({ trigger: f, start: 'top 96px', endTrigger: '.results', end: () => `bottom ${96 + f.offsetHeight}px`, pin: true, pinSpacing: false, invalidateOnRefresh: true });
      });
    }, wrapper);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    // Forms that open inside a section change its height, so re-measure the pins when that happens.
    let t;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(refresh, 150); });
    document.querySelectorAll('.panel-inner').forEach((el) => ro.observe(el));
    return () => { ro.disconnect(); clearTimeout(t); window.removeEventListener('load', refresh); ctx.revert(); smoother.kill(); setSmoother(null); };
  }, []);

  const go = (id) => scrollToId(id);
  const onSearch = ({ make, body, budget }) => {
    setFilters({ ...START, makes: make === 'all' ? [] : [make], body, max: budget });
    requestAnimationFrame(() => go('inventory'));
  };
  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <Header go={go} onTestDrive={() => setOpen({ car: FEATURE, tab: 'book', type: 'drive' })} onBookings={() => setPanel('list')} />
      <div id="smooth-wrapper" ref={wrapper}>
        <div id="smooth-content">
          <main>
            <div className="panel panel-hero"><div className="panel-inner"><Hero onSearch={onSearch} onOpen={(car) => setOpen({ car })} reduceMotion={reduceMotion} /></div><div className="panel-dim" /></div>
            <div className="panel panel-inv"><div className="panel-inner"><Brands /><Inventory filters={filters} setFilters={setFilters} saved={saved} onSave={toggleSave} onOpen={(car) => setOpen({ car })} /></div><div className="panel-dim" /></div>
            <div className="panel panel-how"><div className="panel-inner"><HowItWorks /></div><div className="panel-dim" /></div>
            <div className="panel panel-money"><div className="panel-inner"><Finance /><Sell /></div><div className="panel-dim" /></div>
            <div className="panel panel-foot"><div className="panel-inner"><Footer onVisit={() => setPanel('visit')} /></div></div>
          </main>
        </div>
      </div>
      {open && (
        <CarSheet key={open.car.id} car={open.car} startTab={open.tab} startType={open.type} saved={saved.includes(open.car.id)}
          onSave={toggleSave} onClose={() => setOpen(null)} onOpen={(car) => setOpen({ car })} />
      )}
      {panel && <BookingsDrawer key={panel} mode={panel} onClose={() => setPanel(null)} onBrowse={() => go('inventory')} />}
    </>
  );
}
