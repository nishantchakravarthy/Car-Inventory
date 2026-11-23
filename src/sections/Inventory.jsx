import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx';
import SplitText from '../components/reactbits/SplitText.jsx';
import { INVENTORY, BODY_LABELS, lakh, kmFmt, emi } from '../data/inventory.js';

gsap.registerPlugin(Flip, ScrollTrigger);

const BODIES = ['all', 'coupe', 'sedan', 'suv', 'roadster', 'pickup', 'hatch'];
const FUELS = ['all', 'Electric', 'Hybrid', 'Petrol', 'Diesel'];
const SORTS = { featured: 'Featured', priceAsc: 'Price: low to high', priceDesc: 'Price: high to low', newest: 'Newest first', km: 'Lowest km' };
const PRICE_MAX = 10000000;
const START = { q: '', body: 'all', fuel: 'all', cond: 'all', max: PRICE_MAX, sort: 'featured', saved: false };

function CarCard({ car, img, saved, onSave, onOpen }) {
  const monthly = emi(car.price * 0.8, 8.9, 60);
  return (
    <SpotlightCard className="car-card" spotlight={`${car.paint}55`}>
      <button className="card-hit" onClick={() => onOpen(car)} aria-label={`View ${car.model} ${car.trim} in 3D`} />
      <div className="card-media">
        <span className="card-floor" style={{ '--paint': car.paint }} />
        {img ? <img src={img} alt={`${car.year} Halden ${car.model} ${car.trim} in ${car.paintName}`} /> : <span className="skeleton" />}
        {car.badge && <span className="badge">{car.badge}</span>}
        <button className={`heart ${saved ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onSave(car.id); }} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save car'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-9.3-9.2C1.4 7.6 3.9 4 7.4 4c2 0 3.4 1.1 4.6 2.6C13.2 5.1 14.6 4 16.6 4c3.5 0 6 3.6 4.7 7.3-1.8 4.8-9.3 9.2-9.3 9.2z" /></svg>
        </button>
      </div>
      <div className="card-body">
        <div className="card-title">
          <h3>{car.model}<span>{car.trim}</span></h3>
          <span className={`cond ${car.condition === 'New' ? 'new' : ''}`}>{car.condition === 'New' ? 'New' : 'Certified'}</span>
        </div>
        <ul className="chips">
          <li>{car.year}</li><li>{kmFmt(car.km)}</li><li>{car.fuel}</li><li>{car.trans}</li>
        </ul>
        <div className="card-foot">
          <div><strong className="price">{lakh(car.price)}</strong><small>EMI from ₹{Math.round(monthly).toLocaleString('en-IN')}/mo</small></div>
          <span className="view">View in 3D<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
        </div>
        <span className="stock">Stock {car.id} · {car.paintName}</span>
      </div>
    </SpotlightCard>
  );
}

export default function Inventory({ renders, saved, onSave, onOpen }) {
  const [f, setF] = useState(START);
  const [more, setMore] = useState(false);
  const grid = useRef(null);
  const flip = useRef(null);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let out = INVENTORY.filter((c) =>
      (f.body === 'all' || c.body === f.body) && (f.fuel === 'all' || c.fuel === f.fuel) &&
      (f.cond === 'all' || (f.cond === 'new' ? c.condition === 'New' : c.condition !== 'New')) &&
      c.price <= f.max && (!f.saved || saved.includes(c.id)) &&
      (!q || `${c.model} ${c.trim} ${c.fuel} ${BODY_LABELS[c.body]} ${c.paintName} ${c.year}`.toLowerCase().includes(q)));
    const by = { priceAsc: (a, b) => a.price - b.price, priceDesc: (a, b) => b.price - a.price, newest: (a, b) => b.year - a.year || a.km - b.km, km: (a, b) => a.km - b.km };
    if (by[f.sort]) out = [...out].sort(by[f.sort]);
    return out;
  }, [f, saved]);

  const counts = useMemo(() => Object.fromEntries(BODIES.map((b) => [b, INVENTORY.filter((c) => b === 'all' || c.body === b).length])), []);

  const update = (patch) => {
    if (grid.current) flip.current = Flip.getState(grid.current.querySelectorAll('.cell'));
    setF((s) => ({ ...s, ...patch }));
  };

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, {
      targets: grid.current.querySelectorAll('.cell'), duration: 0.7, ease: 'power3.inOut', stagger: 0.015, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.88, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'back.out(1.4)' }),
    });
    flip.current = null;
    ScrollTrigger.refresh();
  }, [list]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.cell', { opacity: 0, y: 60 });
      ScrollTrigger.batch('.cell', { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }) });
      gsap.from('.filters > *', { y: 24, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.filters', start: 'top 88%', once: true } });
    }, grid.current.parentElement);
    return () => ctx.revert();
  }, []);

  const dirty = JSON.stringify(f) !== JSON.stringify(START);

  return (
    <section id="inventory" className="inventory">
      <header className="inv-head">
        <div>
          <p className="kicker">Inventory</p>
          <h2><SplitText text="Every car on the floor," scroll /> <em><SplitText text="in 3D" scroll delay={0.3} /></em></h2>
        </div>
        <p className="inv-note">Studio renders are generated live in your browser. Tap any car to spin it, repaint it and book a drive. <span>Sample inventory for a demo dealership.</span></p>
      </header>

      <div className="filters">
        <div className="chip-row" role="group" aria-label="Body style">
          {BODIES.map((b) => (
            <button key={b} className={`fchip ${f.body === b ? 'on' : ''}`} onClick={() => update({ body: b })} aria-pressed={f.body === b}>
              {b === 'all' ? 'All' : BODY_LABELS[b]}<span>{counts[b]}</span>
            </button>
          ))}
        </div>
        <div className={`filter-grid ${more ? 'open' : ''}`}>
          <label className="field search">
            <span>Search</span>
            <input id="inv-search" type="search" placeholder="Model, colour, fuel…" value={f.q} onChange={(e) => update({ q: e.target.value })} />
          </label>
          <label className="field">
            <span>Fuel</span>
            <select id="inv-fuel" value={f.fuel} onChange={(e) => update({ fuel: e.target.value })}>
              {FUELS.map((x) => <option key={x} value={x}>{x === 'all' ? 'Any fuel' : x}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Condition</span>
            <select id="inv-cond" value={f.cond} onChange={(e) => update({ cond: e.target.value })}>
              <option value="all">New & certified</option><option value="new">New only</option><option value="cpo">Certified pre-owned</option>
            </select>
          </label>
          <label className="field range">
            <span>Budget up to <b>{lakh(f.max)}</b></span>
            <input id="inv-max" type="range" min={1500000} max={PRICE_MAX} step={250000} value={f.max} onChange={(e) => update({ max: +e.target.value })} style={{ '--p': `${((f.max - 1500000) / (PRICE_MAX - 1500000)) * 100}%` }} />
          </label>
          <label className="field">
            <span>Sort</span>
            <select id="inv-sort" value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        <div className="result-bar">
          <span><b>{list.length}</b> of {INVENTORY.length} cars</span>
          <button className="fchip more-toggle" onClick={() => setMore((m) => !m)} aria-expanded={more}>{more ? 'Fewer filters' : 'More filters'}</button>
          <button className={`fchip ${f.saved ? 'on' : ''}`} onClick={() => update({ saved: !f.saved })} aria-pressed={f.saved}>Saved<span>{saved.length}</span></button>
          {dirty && <button className="link" onClick={() => update(START)}>Reset filters</button>}
        </div>
      </div>

      <ul className="grid" ref={grid}>
        {list.map((c) => (
          <li className="cell" key={c.id} data-flip-id={c.id}>
            <CarCard car={c} img={renders[c.id]} saved={saved.includes(c.id)} onSave={onSave} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <div className="empty">
          <p>No cars match those filters right now.</p>
          <button className="btn ghost" onClick={() => update(START)}>Show all {INVENTORY.length} cars</button>
        </div>
      )}
    </section>
  );
}
