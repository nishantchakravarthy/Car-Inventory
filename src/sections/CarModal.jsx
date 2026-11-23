import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Viewer } from '../three/renders.js';
import { BODY_LABELS, inr, lakh, kmFmt, emi } from '../data/inventory.js';

const TENURES = [36, 48, 60, 72];

export default function CarModal({ car, saved, onSave, onClose }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const viewer = useRef(null);
  const [paint, setPaint] = useState(car.palette[0]);
  const [down, setDown] = useState(20);
  const [tenure, setTenure] = useState(60);
  const [rate, setRate] = useState(8.9);
  const [mode, setMode] = useState('specs');
  const [sent, setSent] = useState(null);

  useEffect(() => {
    viewer.current = new Viewer(canvas.current, car);
    return () => viewer.current?.dispose();
  }, [car]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.modal-scrim', { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo('.modal-sheet', { y: 80, opacity: 0, clipPath: 'inset(12% 6% 0% 6% round 28px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 0.8, ease: 'expo.out' });
      gsap.from('.modal-info > *', { y: 24, opacity: 0, duration: 0.6, stagger: 0.05, delay: 0.2, ease: 'power3.out' });
    }, root);
    root.current.querySelector('.modal-close').focus();
    const key = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', key);
    document.documentElement.classList.add('locked');
    return () => { ctx.revert(); window.removeEventListener('keydown', key); document.documentElement.classList.remove('locked'); };
  }, []);

  const close = () => {
    gsap.to(root.current.querySelector('.modal-sheet'), { y: 60, opacity: 0, duration: 0.35, ease: 'power2.in' });
    gsap.to(root.current.querySelector('.modal-scrim'), { opacity: 0, duration: 0.35, onComplete: onClose });
  };

  const pickPaint = (p) => { setPaint(p); viewer.current?.setPaint(p.hex); };
  const principal = car.price * (1 - down / 100);
  const monthly = emi(principal, rate, tenure);
  const interest = monthly * tenure - principal;

  const specs = [
    ['Power', `${car.hp} hp`], ['0–100 km/h', `${car.zero100} s`], [car.fuel === 'Electric' ? 'Range' : 'Mileage', car.range],
    ['Seats', car.seats], ['Year', car.year], ['Odometer', kmFmt(car.km)], ['Gearbox', car.trans], ['Fuel', car.fuel],
  ];

  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSent({ name: d.get('name'), date: d.get('date'), slot: d.get('slot') });
  };

  return (
    <div className="modal" ref={root} role="dialog" aria-modal="true" aria-label={`${car.model} ${car.trim}`}>
      <div className="modal-scrim" onClick={close} />
      <div className="modal-sheet">
        <button className="modal-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="modal-stage">
          <canvas ref={canvas} />
          <p className="drag-hint">Drag to rotate · pinch or scroll to zoom</p>
          <div className="swatches" role="radiogroup" aria-label="Paint">
            {car.palette.map((p) => (
              <button key={p.name} role="radio" aria-checked={paint.name === p.name} className={`swatch ${paint.name === p.name ? 'on' : ''}`} style={{ '--c': p.hex }} onClick={() => pickPaint(p)} aria-label={p.name} title={p.name} />
            ))}
            <span className="swatch-name">{paint.name}{paint.name !== car.palette[0].name && <small> · factory order, 6–8 weeks</small>}</span>
          </div>
        </div>

        <div className="modal-info">
          <p className="kicker">{BODY_LABELS[car.body]} · {car.condition === 'New' ? 'New' : 'Certified pre-owned'} · Stock {car.id}</p>
          <h2>{car.model} <em>{car.trim}</em></h2>
          <p className="modal-tag">{car.tagline}</p>
          <div className="modal-price">
            <strong>{inr(car.price)}</strong>
            <span>≈ ₹{Math.round(monthly).toLocaleString('en-IN')}/mo</span>
          </div>

          <div className="tabs" role="tablist">
            {[['specs', 'Specs'], ['finance', 'Finance'], ['drive', 'Test drive']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={mode === k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{l}</button>
            ))}
          </div>

          {mode === 'specs' && (
            <dl className="spec-grid">
              {specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}

          {mode === 'finance' && (
            <div className="mini-emi">
              <label className="field range">
                <span>Down payment <b>{down}% · {lakh(car.price * down / 100)}</b></span>
                <input id="m-down" type="range" min={0} max={80} step={5} value={down} onChange={(e) => setDown(+e.target.value)} style={{ '--p': `${down / 0.8}%` }} />
              </label>
              <div className="field"><span>Tenure</span>
                <div className="seg">{TENURES.map((t) => <button key={t} className={tenure === t ? 'on' : ''} onClick={() => setTenure(t)}>{t} mo</button>)}</div>
              </div>
              <label className="field range">
                <span>Interest <b>{rate.toFixed(1)}% p.a.</b></span>
                <input id="m-rate" type="range" min={6.5} max={14} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} style={{ '--p': `${((rate - 6.5) / 7.5) * 100}%` }} />
              </label>
              <p className="emi-out"><strong>₹{Math.round(monthly).toLocaleString('en-IN')}</strong> a month for {tenure} months<br /><small>Loan {inr(principal)} · total interest {inr(Math.max(0, interest))}</small></p>
            </div>
          )}

          {mode === 'drive' && (sent ? (
            <div className="sent">
              <p><strong>Thanks, {sent.name}.</strong> Your {car.model} test drive request for {sent.date} ({sent.slot}) is noted on this page.</p>
              <small>This is a demo site, so the request isn’t sent anywhere.</small>
            </div>
          ) : (
            <form className="drive-form" onSubmit={submit}>
              <label className="field"><span>Name</span><input id="d-name" name="name" required autoComplete="name" /></label>
              <label className="field"><span>Phone</span><input id="d-phone" name="phone" type="tel" inputMode="tel" required pattern="[0-9 +]{10,15}" autoComplete="tel" /></label>
              <label className="field"><span>Date</span><input id="d-date" name="date" type="date" required /></label>
              <label className="field"><span>Slot</span>
                <select id="d-slot" name="slot"><option>Morning</option><option>Afternoon</option><option>Evening</option></select>
              </label>
              <button className="btn primary" type="submit">Request test drive</button>
            </form>
          ))}

          <div className="modal-actions">
            <button className="btn primary" onClick={() => setMode('drive')}>Book a test drive</button>
            <button className={`btn ghost ${saved ? 'on' : ''}`} onClick={() => onSave(car.id)} aria-pressed={saved}>{saved ? 'Saved' : 'Save car'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
