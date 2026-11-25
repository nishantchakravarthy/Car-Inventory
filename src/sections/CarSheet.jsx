import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { inr, price, km, ordinal, emi } from '../data/inventory.js';
import { cutFor } from '../data/cuts.js';
import { lockScroll } from '../lib/smooth.js';

const CHECKS = ['Engine and gearbox', 'Brakes and suspension', 'Electricals and AC', 'Body panels and paint depth', 'Tyres (all above 60%)', 'Flood and accident check'];

export default function CarSheet({ car, saved, onSave, onClose, startOnDrive = false }) {
  const root = useRef(null);
  const [down, setDown] = useState(20);
  const [months, setMonths] = useState(60);
  const [drive, setDrive] = useState(startOnDrive);
  const [sent, setSent] = useState(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.sheet-scrim', { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo('.sheet', { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'power3.out' });
      gsap.from('.sheet-photo img', { x: 220, rotation: 6, duration: 1, ease: 'expo.out', delay: 0.15 });
      gsap.from('.sheet-body > *', { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.04, delay: 0.25, ease: 'power2.out' });
    }, root);
    root.current.querySelector('.sheet-close').focus();
    const esc = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', esc);
    lockScroll(true);
    return () => { ctx.revert(); window.removeEventListener('keydown', esc); lockScroll(false); };
  }, []);

  const close = () => {
    gsap.to(root.current.querySelector('.sheet'), { xPercent: 100, duration: 0.3, ease: 'power2.in' });
    gsap.to(root.current.querySelector('.sheet-scrim'), { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  const principal = car.price * (1 - down / 100);
  const monthly = emi(principal, 9.5, months);
  const specs = [['Year', car.year], ['Odometer', km(car.km)], ['Fuel', car.fuel], ['Transmission', car.trans], ['Engine', car.engine], ['Power', `${car.power} PS`], ['Body', car.body], ['Owners', `${ordinal(car.owners)} owner`], ['Registration', car.reg]];

  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSent({ name: d.get('name'), date: d.get('date'), slot: d.get('slot') });
  };

  return (
    <div className="sheet-wrap" ref={root} role="dialog" aria-modal="true" aria-label={`${car.year} ${car.name}`}>
      <div className="sheet-scrim" onClick={close} />
      <div className="sheet">
        <button className="sheet-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <figure className={`sheet-photo ${cutFor(car) ? 'is-cut' : ''}`}>
          {cutFor(car) && <span className="ground" aria-hidden="true" />}
          <img src={cutFor(car) || car.imgLarge} alt={`${car.year} ${car.name} ${car.variant}`} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
          <figcaption>Photo: <a href={car.credit.url} target="_blank" rel="noopener noreferrer">{car.credit.author}</a>, Wikimedia Commons. Representative of the model; the listed car is inspected in person.</figcaption>
        </figure>

        <div className="sheet-body">
          <p className="eyebrow">{car.make} · Stock #{car.id.toUpperCase()}</p>
          <h2>{car.year} {car.name}</h2>
          <p className="variant">{car.variant}</p>
          <div className="sheet-price">
            <strong>{inr(car.price)}</strong>
            <span>or ₹{Math.round(monthly).toLocaleString('en-IN')}/month</span>
          </div>
          <p className="note">{car.note}</p>

          <div className="sheet-actions">
            <button className="btn dark" onClick={() => setDrive(true)}>Book a test drive</button>
            <button className={`btn line ${saved ? 'on' : ''}`} onClick={() => onSave(car.id)} aria-pressed={saved}>{saved ? 'Saved' : 'Save'}</button>
          </div>

          {drive && (sent ? (
            <div className="notice">
              <strong>Thanks, {sent.name}.</strong> Your test drive of the {car.name} on {sent.date} ({sent.slot.toLowerCase()}) is noted on this page.
              <small>This is a student demo site, so the request isn’t sent to anyone.</small>
            </div>
          ) : (
            <form className="drive-form" onSubmit={submit}>
              <h3>Book a test drive</h3>
              <label><span>Name</span><input id="td-name" name="name" required autoComplete="name" /></label>
              <label><span>Mobile number</span><input id="td-phone" name="phone" type="tel" inputMode="tel" required pattern="[0-9 +]{10,15}" autoComplete="tel" /></label>
              <label><span>Date</span><input id="td-date" name="date" type="date" required /></label>
              <label><span>Time</span><select id="td-slot" name="slot"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
              <button className="btn dark" type="submit">Request slot</button>
            </form>
          ))}

          <h3>Specifications</h3>
          <dl className="spec-table">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

          <h3>Inspection report</h3>
          <ul className="checks">{CHECKS.map((c) => <li key={c}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{c}</li>)}</ul>

          <h3>Finance estimate</h3>
          <div className="mini-emi">
            <label><span>Down payment <b>{down}% · {price(car.price * down / 100)}</b></span>
              <input id="sh-down" type="range" min={10} max={80} step={5} value={down} onChange={(e) => setDown(+e.target.value)} style={{ '--p': `${((down - 10) / 70) * 100}%` }} />
            </label>
            <div className="seg" role="group" aria-label="Loan tenure">
              {[36, 48, 60, 72].map((m) => <button key={m} className={months === m ? 'on' : ''} onClick={() => setMonths(m)} aria-pressed={months === m}>{m} months</button>)}
            </div>
            <p className="emi-line"><b>₹{Math.round(monthly).toLocaleString('en-IN')}</b> a month at 9.5% for {months} months · loan {inr(principal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
