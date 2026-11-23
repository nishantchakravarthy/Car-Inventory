import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SplitText from '../components/reactbits/SplitText.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import { FerrariViewer } from '../three/FerrariViewer.js';
import { FEATURE, INVENTORY, MAKES, BODIES, PAINTS, price, km } from '../data/inventory.js';

const BUDGETS = [[1000000, 'Under ₹10 L'], [2500000, 'Under ₹25 L'], [5000000, 'Under ₹50 L'], [15000000, 'Under ₹1.5 Cr'], [Infinity, 'Any budget']];

export default function Hero({ onSearch, onOpen, reduceMotion }) {
  const canvas = useRef(null);
  const viewer = useRef(null);
  const root = useRef(null);
  const [paint, setPaint] = useState(PAINTS[0]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState({ make: 'all', body: 'all', budget: Infinity });

  useEffect(() => {
    viewer.current = new FerrariViewer(canvas.current, { paint: PAINTS[0].hex, reduceMotion, onReady: () => setLoaded(true) });
    return () => viewer.current?.dispose();
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > :not(h1)', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
      gsap.from('.feature', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.15 });
    }, root);
    return () => ctx.revert();
  }, [reduceMotion]);

  const count = INVENTORY.filter((c) => (q.make === 'all' || c.make === q.make) && (q.body === 'all' || c.body === q.body) && c.price <= q.budget).length;
  const pick = (p) => { setPaint(p); viewer.current?.setPaint(p.hex); };

  return (
    <section id="top" className="hero" ref={root}>
      <div className="hero-copy">
        <p className="eyebrow">Pre-owned cars · Old Airport Road, Bengaluru</p>
        <h1><SplitText text="Pre-owned cars," /> <SplitText text="inspected properly." delay={0.25} className="muted" /></h1>
        <p className="lede">
          {INVENTORY.length} cars in stock today, from a first-car Swift to a Ferrari 458. Every one comes with a
          150-point inspection report, its service records and a 7-day return.
        </p>
        <form className="quick-search" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <label><span>Make</span>
            <select id="qs-make" value={q.make} onChange={(e) => setQ({ ...q, make: e.target.value })}>
              <option value="all">All makes</option>{MAKES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label><span>Body type</span>
            <select id="qs-body" value={q.body} onChange={(e) => setQ({ ...q, body: e.target.value })}>
              <option value="all">Any body</option>{BODIES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label><span>Budget</span>
            <select id="qs-budget" value={q.budget} onChange={(e) => setQ({ ...q, budget: +e.target.value })}>
              {BUDGETS.map(([v, l]) => <option key={l} value={v}>{l}</option>)}
            </select>
          </label>
          <button className="btn dark" type="submit" disabled={!count}>{count ? `Show ${count} car${count > 1 ? 's' : ''}` : 'No matches'}</button>
        </form>
        <dl className="facts">
          <div><dt>Cars in stock</dt><dd><CountUp to={INVENTORY.length} duration={1.2} /></dd></div>
          <div><dt>Inspection points</dt><dd><CountUp to={150} duration={1.6} /></dd></div>
          <div><dt>Days to return it</dt><dd><CountUp to={7} duration={1} /></dd></div>
        </dl>
      </div>

      <figure className="feature">
        <div className="feature-top">
          <span className="tag red">Feature car</span>
          <span className="hint">{loaded ? 'Drag to turn it around' : 'Loading the 3D model…'}</span>
        </div>
        <div className={`stage ${loaded ? 'ready' : ''}`}>
          <canvas ref={canvas} aria-label={`Interactive 3D model of the ${FEATURE.year} ${FEATURE.name}`} />
        </div>
        <figcaption className="feature-bottom">
          <div className="feature-title">
            <strong>{FEATURE.year} {FEATURE.name}</strong>
            <span>{km(FEATURE.km)} · {FEATURE.engine} · {FEATURE.power} PS</span>
          </div>
          <div className="feature-paint" role="radiogroup" aria-label="Preview paint colour">
            {PAINTS.map((p) => (
              <button key={p.name} type="button" role="radio" aria-checked={paint.name === p.name} aria-label={p.name} title={p.name}
                className={`chip ${paint.name === p.name ? 'on' : ''}`} style={{ '--c': p.hex }} onClick={() => pick(p)} />
            ))}
            <span className="paint-name">{paint.name}</span>
          </div>
          <div className="feature-cta">
            <span className="feature-price">{price(FEATURE.price)}</span>
            <button className="btn line" type="button" onClick={() => onOpen(FEATURE)}>View listing</button>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
