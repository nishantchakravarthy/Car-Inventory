import { useMemo, useState } from 'react';
import { INVENTORY, price } from '../data/inventory.js';
import { TYPES, SLOTS, nextDays, isTaken, slotLabel, prettyDate, addBooking, cancelBooking, downloadIcs, useBookings } from '../lib/bookings.js';

const ICONS = {
  drive: 'M4 15l2-6h12l2 6v4h-3M4 15v4h3M4 15h16M7 19a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0',
  home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  reserve: 'M6 3h12v18l-6-4-6 4z',
  finance: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z',
  inspect: 'M11 4a7 7 0 105.2 11.7L20 19.5M8 11l2 2 4-4',
  visit: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zm0-8a3 3 0 100-6 3 3 0 000 6z',
};
export const Icon = ({ type }) => <svg className="b-ico" viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[type]} /></svg>;

// One booking, shown as a ticket stub.
export function Ticket({ b, compact = false }) {
  const t = TYPES[b.type];
  const [gone, setGone] = useState(false);
  if (gone) return <div className="ticket gone"><strong>Booking {b.ref} cancelled.</strong></div>;
  return (
    <article className={`ticket t-${b.type} ${compact ? 'compact' : ''}`}>
      <div className="ticket-main">
        <p className="ticket-type"><Icon type={b.type} />{t.label}</p>
        {b.carName && <h4>{b.carName}</h4>}
        <p className="ticket-when"><b>{prettyDate(b.date)}</b> · {slotLabel(b.slot)}</p>
        <p className="ticket-where">{b.address || t.place}</p>
        {b.note && <p className="ticket-note">{b.note}</p>}
      </div>
      <div className="ticket-stub">
        <span>Ref</span>
        <strong>{b.ref}</strong>
        <button className="link" onClick={() => downloadIcs(b)}>Add to calendar</button>
        <button className="link danger" onClick={() => { setGone(true); setTimeout(() => cancelBooking(b.ref), 900); }}>Cancel</button>
      </div>
    </article>
  );
}

const copy = {
  drive: 'About 45 minutes with a sales advisor. Bring your driving licence.',
  home: 'We bring the car to your door anywhere inside Bengaluru city limits. Bring your driving licence.',
  reserve: 'We take the car off sale for 48 hours. Pay the refundable ₹10,000 token at the showroom when you come in.',
  finance: 'Our finance desk calls you with loan offers from partner banks. No impact on your credit score until you apply.',
  inspect: 'A 45-minute inspection at the showroom and a written offer, valid for 7 days.',
  visit: 'Come and look around, sit in a few cars and have a coffee. No pressure.',
};

// Booking form: what, when, who. kind "car" offers four booking types for one car.
export default function BookingForm({ kind = 'car', car, initialType, context, onBooked }) {
  const types = kind === 'car' ? ['drive', 'home', 'reserve', 'finance'] : [kind];
  const [type, setType] = useState(types.includes(initialType) ? initialType : types[0]);
  const days = useMemo(() => nextDays(8), []);
  const [day, setDay] = useState(days[0].iso);
  const [slot, setSlot] = useState(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const all = useBookings();
  const key = car?.id || type;
  const mine = (iso, s) => all.some((b) => (b.carId || b.type) === key && b.date === iso && b.slot === s);

  if (done) {
    return (
      <div className="booked" aria-live="polite">
        <p className="booked-head"><span className="hand">done!</span> You’re booked in.</p>
        <Ticket b={done} />
        <p className="demo-note">Student demo site: nothing is sent to anyone. Your bookings are saved in this browser under “Bookings” at the top.</p>
        <button className="btn line sm" onClick={() => { setDone(null); setSlot(null); }}>Make another booking</button>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    if (!slot) { setErr('Pick a time slot first.'); return; }
    const f = Object.fromEntries(new FormData(e.currentTarget));
    let carName = car ? `${car.year} ${car.name}` : context?.carName;
    let carId = car?.id || context?.carId;
    if (kind === 'sell') carName = `${f.year} ${f.make} ${f.model}`;
    if (kind === 'visit' && f.interest) { const c = INVENTORY.find((x) => x.id === f.interest); carName = c && `${c.year} ${c.name}`; carId = c?.id; }
    const note = kind === 'sell' ? `${Number(f.km).toLocaleString('en-IN')} km on the clock` : type === 'reserve' ? 'Refundable ₹10,000 token, held for 48 hours' : context?.note;
    const b = addBooking({ type, carId: carId || (kind === 'car' ? key : undefined), carName, date: day, slot, name: f.name, phone: f.phone, address: type === 'home' ? f.address : undefined, note });
    setErr(''); setDone(b); onBooked?.(b);
  };

  return (
    <form className="book" onSubmit={submit} noValidate={false}>
      {types.length > 1 && (
        <fieldset className="b-types">
          <legend>What would you like to book?</legend>
          {types.map((t) => (
            <label key={t} className={`b-type ${type === t ? 'on' : ''}`}>
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => { setType(t); setSlot(null); }} />
              <Icon type={t} />
              <b>{TYPES[t].label}</b>
              <small>{TYPES[t].short}</small>
            </label>
          ))}
        </fieldset>
      )}
      <p className="b-copy">{copy[type]}</p>

      {kind === 'sell' && (
        <div className="b-grid">
          <label><span>Make</span><input name="make" required placeholder="e.g. Hyundai" /></label>
          <label><span>Model</span><input name="model" required placeholder="e.g. i20" /></label>
          <label><span>Year</span><input name="year" type="number" min="2000" max="2026" required placeholder="2019" /></label>
          <label><span>Kilometres</span><input name="km" type="number" min="0" required placeholder="45000" /></label>
        </div>
      )}
      {kind === 'visit' && (
        <label><span>Interested in (optional)</span>
          <select name="interest" defaultValue="">
            <option value="">Just browsing</option>
            {INVENTORY.map((c) => <option key={c.id} value={c.id}>{c.year} {c.name} · {price(c.price)}</option>)}
          </select>
        </label>
      )}

      <fieldset className="b-days">
        <legend>{type === 'finance' ? 'When should we call?' : 'Pick a day'}</legend>
        <div className="day-row">
          {days.map((d) => (
            <button type="button" key={d.iso} className={`day ${day === d.iso ? 'on' : ''}`} onClick={() => { setDay(d.iso); setSlot(null); }} aria-pressed={day === d.iso}>
              <small>{d.wd}</small><b>{d.d}</b><small>{d.m}</small>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="b-slots">
        <legend>Pick a time <span className="legend-key"><i className="k-free" />free <i className="k-taken" />taken</span></legend>
        <div className="slot-row">
          {SLOTS.map((s) => {
            const yours = mine(day, s);
            const taken = !yours && isTaken(key + type, day, s);
            return (
              <button type="button" key={s} disabled={taken || yours} className={`slot ${slot === s ? 'on' : ''} ${yours ? 'yours' : ''}`} onClick={() => { setSlot(s); setErr(''); }} aria-pressed={slot === s}>
                {slotLabel(s)}{yours && <small>yours</small>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="b-grid">
        <label><span>Your name</span><input name="name" required autoComplete="name" /></label>
        <label><span>Mobile number</span><input name="phone" type="tel" inputMode="tel" required pattern="[0-9 +]{10,15}" autoComplete="tel" placeholder="98xxxxxxxx" /></label>
        {type === 'home' && <label className="wide"><span>Address in Bengaluru</span><input name="address" required autoComplete="street-address" placeholder="Flat, street, area" /></label>}
      </div>

      {err && <p className="b-err" role="alert">{err}</p>}
      <div className="b-submit">
        <p>{slot ? <><b>{TYPES[type].label}</b> · {prettyDate(day)}, {slotLabel(slot)}</> : 'Choose a day and time above.'}</p>
        <button className="btn dark" type="submit">{type === 'reserve' ? 'Reserve this car' : type === 'finance' ? 'Request the call' : 'Confirm booking'}</button>
      </div>
    </form>
  );
}
