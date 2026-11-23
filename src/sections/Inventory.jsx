import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INVENTORY, MAKES, BODIES, FUELS, price, km, ordinal, emi } from '../data/inventory.js';

gsap.registerPlugin(Flip, ScrollTrigger);

export const START = { q: '', makes: [], body: 'all', fuel: 'all', max: Infinity, sort: 'recommended', saved: false };
const SORTS = { recommended: 'Recommended', low: 'Price: low to high', high: 'Price: high to low', newest: 'Newest first', km: 'Lowest km' };
const PRICE_STEPS = [500000, 1000000, 1500000, 2500000, 5000000, 10000000, 15000000, 20000000, Infinity];

function Card({ car, saved, onSave, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="card">
      <button className="card-photo" onClick={() => onOpen(car)} aria-label={`Open ${car.year} ${car.name} ${car.variant}`}>
        {failed
          ? <span className="photo-missing">{car.make}</span>
          : <img src={car.img} alt={`${car.year} ${car.name}`} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
        {car.tag && <span className={`tag ${car.tag === 'Price drop' ? 'red' : ''}`}>{car.tag}</span>}
      </button>
      <button className={`save ${saved ? 'on' : ''}`} onClick={() => onSave(car.id)} aria-pressed={saved} aria-label={saved ? `Remove ${car.name} from saved` : `Save ${car.name}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-9.3-9.2C1.4 7.6 3.9 4 7.4 4c2 0 3.4 1.1 4.6 2.6C13.2 5.1 14.6 4 16.6 4c3.5 0 6 3.6 4.7 7.3-1.8 4.8-9.3 9.2-9.3 9.2z" /></svg>
      </button>
      <div className="card-body" onClick={() => onOpen(car)}>
        <h3><span className="yr">{car.year}</span> {car.name}</h3>
        <p className="variant">{car.variant}</p>
        <p className="meta">{km(car.km)} · {car.fuel} · {car.trans} · {ordinal(car.owners)} owner</p>
        <div className="card-foot">
          <strong className="price">{price(car.price)}</strong>
          <span className="emi">EMI from ₹{Math.round(emi(car.price * 0.8, 9.5, 60)).toLocaleString('en-IN')}/mo</span>
        </div>
      </div>
    </article>
  );
}

export default function Inventory({ filters: f, setFilters, saved, onSave, onOpen }) {
  const grid = useRef(null);
  const flip = useRef(null);
  const [showFilters, setShowFilters] = useState(false);

  const update = (patch) => {
    if (grid.current) flip.current = Flip.getState(grid.current.querySelectorAll('.cell'));
    setFilters((s) => ({ ...s, ...patch }));
  };

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let out = INVENTORY.filter((c) =>
      (!f.makes.length || f.makes.includes(c.make)) && (f.body === 'all' || c.body === f.body) && (f.fuel === 'all' || c.fuel === f.fuel) &&
      c.price <= f.max && (!f.saved || saved.includes(c.id)) &&
      (!q || `${c.year} ${c.name} ${c.variant} ${c.body} ${c.fuel}`.toLowerCase().includes(q)));
    const by = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, newest: (a, b) => b.year - a.year, km: (a, b) => a.km - b.km };
    if (by[f.sort]) out = [...out].sort(by[f.sort]);
    return out;
  }, [f, saved]);

  useLayoutEffect(() => {
    if (!flip.current) return;
    Flip.from(flip.current, {
      targets: grid.current.querySelectorAll('.cell'), duration: 0.55, ease: 'power2.inOut', stagger: 0.01, absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.03 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
    });
    flip.current = null;
    ScrollTrigger.refresh();
  }, [list]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.cell', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { opacity: 0, y: 24, duration: 0.6, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }) });
    }, grid);
    return () => ctx.revert();
  }, []);

  const toggleMake = (m) => update({ makes: f.makes.includes(m) ? f.makes.filter((x) => x !== m) : [...f.makes, m] });
  const dirty = JSON.stringify({ ...f, max: String(f.max) }) !== JSON.stringify({ ...START, max: String(START.max) });
  const stepIndex = PRICE_STEPS.indexOf(f.max) === -1 ? PRICE_STEPS.length - 1 : PRICE_STEPS.indexOf(f.max);
  const countFor = (key, val) => INVENTORY.filter((c) => c[key] === val).length;

  return (
    <section id="inventory" className="inventory">
      <header className="section-head">
        <div>
          <h2>Cars in stock</h2>
          <p>Every listing shows the real odometer reading and owner count. Prices include RC transfer and the inspection report.</p>
        </div>
        <label className="search">
          <span className="sr">Search inventory</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input id="inv-search" type="search" placeholder="Search make, model or variant" value={f.q} onChange={(e) => update({ q: e.target.value })} />
        </label>
      </header>

      <div className="inv-layout">
        <aside className={`filters ${showFilters ? 'open' : ''}`} aria-label="Filters">
          <div className="filters-head">
            <strong>Filters</strong>
            {dirty && <button className="link" onClick={() => update(START)}>Clear all</button>}
          </div>
          <fieldset>
            <legend>Make</legend>
            {MAKES.map((m) => (
              <label key={m} className="check">
                <input type="checkbox" checked={f.makes.includes(m)} onChange={() => toggleMake(m)} />
                <span>{m}</span><small>{countFor('make', m)}</small>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Body type</legend>
            <div className="pills">
              {['all', ...BODIES].map((b) => <button key={b} className={`pill ${f.body === b ? 'on' : ''}`} onClick={() => update({ body: b })} aria-pressed={f.body === b}>{b === 'all' ? 'Any' : b}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Fuel</legend>
            <div className="pills">
              {['all', ...FUELS].map((x) => <button key={x} className={`pill ${f.fuel === x ? 'on' : ''}`} onClick={() => update({ fuel: x })} aria-pressed={f.fuel === x}>{x === 'all' ? 'Any' : x}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Budget <b>{f.max === Infinity ? 'Any' : `up to ${price(f.max)}`}</b></legend>
            <input id="inv-budget" type="range" min={0} max={PRICE_STEPS.length - 1} step={1} value={stepIndex}
              onChange={(e) => update({ max: PRICE_STEPS[+e.target.value] })} style={{ '--p': `${(stepIndex / (PRICE_STEPS.length - 1)) * 100}%` }} aria-label="Maximum budget" />
          </fieldset>
        </aside>

        <div className="results">
          <div className="results-bar">
            <span><b>{list.length}</b> {list.length === 1 ? 'car' : 'cars'}</span>
            <button className="btn line sm filters-toggle" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>{showFilters ? 'Hide filters' : 'Filters'}</button>
            <button className={`pill ${f.saved ? 'on' : ''}`} onClick={() => update({ saved: !f.saved })} aria-pressed={f.saved}>Saved ({saved.length})</button>
            <label className="sort"><span>Sort</span>
              <select id="inv-sort" value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <ul className="grid" ref={grid}>
            {list.map((c) => (
              <li className="cell" key={c.id} data-flip-id={c.id}>
                <Card car={c} saved={saved.includes(c.id)} onSave={onSave} onOpen={onOpen} />
              </li>
            ))}
          </ul>
          {!list.length && (
            <div className="empty">
              <p>Nothing matches those filters right now. New stock arrives most weeks.</p>
              <button className="btn line" onClick={() => update(START)}>Show all {INVENTORY.length} cars</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
