import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cutFor } from '../data/cuts.js';
import CountUp from '../components/reactbits/CountUp.jsx';
import Doodle from '../components/Doodle.jsx';
import { FerrariViewer } from '../three/FerrariViewer.js';
import { FEATURE, INVENTORY, MAKES, BODIES, PAINTS, price, km } from '../data/inventory.js';

const BUDGETS = [[1000000, 'Under ₹10 L'], [2500000, 'Under ₹25 L'], [5000000, 'Under ₹50 L'], [15000000, 'Under ₹1.5 Cr'], [Infinity, 'Any budget']];
const PEEKS = ['thar', 'swift', 'g63'].map((id) => INVENTORY.find((c) => c.id === id));

export default function Hero({ onSearch, onOpen, reduceMotion }) {
  const canvas = useRef(null);
  const viewer = useRef(null);
  const root = useRef(null);
  const [paint, setPaint] = useState(PAINTS[0]);
  const [loaded, setLoaded] = useState(false);
  const [pct, setPct] = useState(0);
  const [q, setQ] = useState({ make: 'all', body: 'all', budget: Infinity });

  useEffect(() => {
    viewer.current = new FerrariViewer(canvas.current, { paint: PAINTS[0].hex, reduceMotion, onReady: () => setLoaded(true), onProgress: setPct });
    // The car turns and sinks as the hero scrolls away.
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom top', onUpdate: (s) => viewer.current?.setScroll(s.progress) });
    return () => { st.kill(); viewer.current?.dispose(); };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero h1 .line', { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 });
      gsap.from('.hero-copy > :not(h1)', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.3 });
      gsap.from('.stage-block', { scale: 0.94, rotate: -2, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', delay: 0.1 });
      gsap.from('.peek', { y: 60, scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.12, delay: 1.4 });
      gsap.to('.peek', { y: '-=8', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4, delay: 2.4 });
    }, root);
    return () => ctx.revert();
  }, [reduceMotion]);

  const count = INVENTORY.filter((c) => (q.make === 'all' || c.make === q.make) && (q.body === 'all' || c.body === q.body) && c.price <= q.budget).length;
  const pick = (p) => { setPaint(p); viewer.current?.setPaint(p.hex); };

  return (
    <section id="top" className="hero" ref={root}>
      <div className="hero-copy">
        <p className="eyebrow"><span className="dot" />Pre-owned cars · Old Airport Road, Bengaluru</p>
        <h1>
          <span className="line-wrap"><span className="line">Find a car</span></span>{' '}
          <span className="line-wrap"><span className="line">you’ll love.</span></span>{' '}
          <span className="line-wrap"><span className="line">We’ve already</span></span>{' '}
          <span className="line-wrap"><span className="line"><span className="circled">checked<Doodle type="circle" color="#ff5a36" width={5} delay={0.9} scroll={false} /></span> it.</span></span>
        </h1>
        <p className="lede">
          {INVENTORY.length} cars in stock, from a first-car Swift to a Ferrari 458. Every one has a 150-point inspection,
          its service records, and a 7-day “changed my mind” return.
        </p>
        <form className="quick-search" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <label><span>Make</span>
            <select id="qs-make" value={q.make} onChange={(e) => setQ({ ...q, make: e.target.value })}>
              <option value="all">All makes</option>{MAKES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label><span>Body</span>
            <select id="qs-body" value={q.body} onChange={(e) => setQ({ ...q, body: e.target.value })}>
              <option value="all">Any body</option>{BODIES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label><span>Budget</span>
            <select id="qs-budget" value={q.budget} onChange={(e) => setQ({ ...q, budget: +e.target.value })}>
              {BUDGETS.map(([v, l]) => <option key={l} value={v}>{l}</option>)}
            </select>
          </label>
          <button className="btn pop" type="submit" disabled={!count}>{count ? `Show ${count} car${count > 1 ? 's' : ''}` : 'No matches'}</button>
        </form>
        <dl className="facts">
          <div className="fact f1"><dd><CountUp to={INVENTORY.length} duration={1.2} /></dd><dt>cars in stock</dt></div>
          <div className="fact f2"><dd><CountUp to={150} duration={1.6} /></dd><dt>point inspection</dt></div>
          <div className="fact f3"><dd><CountUp to={7} duration={1} /></dd><dt>day returns</dt></div>
        </dl>
      </div>

      <div className="collage">
        <figure className="stage-block">
          <span className="scribble">{loaded ? 'drag me around!' : `warming up the engine… ${pct}%`}</span>
          <Doodle type="arrow" className="scribble-arrow" color="#141414" width={3} delay={1.2} scroll={false} />
          <div className={`stage ${loaded ? 'ready' : ''}`}>
            <canvas ref={canvas} aria-label={`Interactive 3D model of the ${FEATURE.year} ${FEATURE.name}`} />
          </div>
          <figcaption className="stage-foot">
            <div>
              <strong>{FEATURE.year} {FEATURE.name}</strong>
              <span>{km(FEATURE.km)} · {FEATURE.power} PS · {FEATURE.engine}</span>
            </div>
            <div className="paints" role="radiogroup" aria-label="Try a paint colour">
              {PAINTS.map((p) => (
                <button key={p.name} type="button" role="radio" aria-checked={paint.name === p.name} aria-label={p.name} title={p.name}
                  className={`chip ${paint.name === p.name ? 'on' : ''}`} style={{ '--c': p.hex }} onClick={() => pick(p)} />
              ))}
              <span className="paint-name">{paint.name}</span>
            </div>
          </figcaption>
          <button className="sticker-price" onClick={() => onOpen(FEATURE)} aria-label={`Open the ${FEATURE.name} listing, ${price(FEATURE.price)}`}>
            <small>only</small>{price(FEATURE.price)}<small>see listing →</small>
          </button>
        </figure>
        {PEEKS.map((c, i) => (
          <button key={c.id} className={`peek peek-${i} ${cutFor(c) ? 'is-cut' : ''}`} onClick={() => onOpen(c)} aria-label={`Open the ${c.year} ${c.name} listing`}>
            <img src={cutFor(c) || c.img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
            <span>{c.model} · {price(c.price)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
