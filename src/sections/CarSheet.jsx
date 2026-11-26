import { useRef, useState } from 'react';
import Drawer from '../components/Drawer.jsx';
import BookingForm, { Ticket } from '../components/Booking.jsx';
import { INVENTORY, inr, price, km, ordinal, emi } from '../data/inventory.js';
import { detailsFor, INSPECTION, INCLUDED } from '../data/details.js';
import { cutFor } from '../data/cuts.js';
import { useBookings } from '../lib/bookings.js';

const TABS = [['overview', 'Overview'], ['specs', 'Specs'], ['history', 'Inspection & history'], ['finance', 'Finance'], ['book', 'Book']];
const Tick = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

export default function CarSheet({ car, saved, onSave, onClose, onOpen, startTab = 'overview', startType }) {
  const det = detailsFor(car);
  const [tab, setTab] = useState(startTab);
  const [bookType, setBookType] = useState(startType);
  const [down, setDown] = useState(20);
  const [months, setMonths] = useState(60);
  const [fresh, setFresh] = useState(null);
  const tabsRef = useRef(null);
  const bookings = useBookings().filter((b) => b.carId === car.id);
  const cut = cutFor(car);

  const principal = car.price * (1 - down / 100);
  const monthly = emi(principal, 9.5, months);
  const go = (t, type) => {
    setTab(t);
    if (type) setBookType(type);
    const sc = tabsRef.current?.closest('.sheet');
    if (sc && tabsRef.current) sc.scrollTo({ top: tabsRef.current.offsetTop - 2, behavior: 'smooth' });
  };
  const similar = INVENTORY.filter((c) => c.id !== car.id && (c.segment === car.segment)).sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price)).slice(0, 3);
  const specs = [
    ['Year', car.year], ['Odometer', km(car.km)], ['Fuel', car.fuel], ['Transmission', car.trans], ['Engine', car.engine], ['Power', `${car.power} PS`],
    ['Body', car.body], ['Seats', det.seats], ['Drive', det.drive], ['Owners', `${ordinal(car.owners)} owner`], ['Registration', `${car.reg} (Karnataka)`], ['Stock no.', car.id.toUpperCase()],
  ];

  return (
    <Drawer label={`${car.year} ${car.name}`} onClose={onClose} className="car-sheet">
      <figure className={`sheet-photo ${cut ? 'is-cut' : ''}`}>
        {cut && <span className="ground" aria-hidden="true" />}
        <img src={cut || car.imgLarge} alt={`${car.year} ${car.name} ${car.variant}`} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        {car.tag && <span className="tag red sheet-tag">{car.tag}</span>}
        <figcaption>Photo: <a href={car.credit.url} target="_blank" rel="noopener noreferrer">{car.credit.author}</a>, Wikimedia Commons. Same model; the listed car is inspected in person.</figcaption>
      </figure>

      <header className="sheet-head">
        <p className="eyebrow">{car.make} · Stock #{car.id.toUpperCase()}</p>
        <h2>{car.year} {car.name}</h2>
        <p className="variant">{car.variant}</p>
        <div className="sheet-price">
          <strong>{inr(car.price)}</strong>
          <span>or ₹{Math.round(emi(car.price * 0.8, 9.5, 60)).toLocaleString('en-IN')}/month</span>
        </div>
        <ul className="chips">
          <li>{km(car.km)}</li><li>{car.fuel}</li><li>{car.trans}</li><li>{ordinal(car.owners)} owner</li><li>{det.seats} seats</li>
        </ul>
        {bookings.length > 0 && <p className="booked-flag"><Tick /> You have {bookings.length === 1 ? 'a booking' : `${bookings.length} bookings`} for this car. <button className="link" onClick={() => go('book')}>See it</button></p>}
      </header>

      <nav className="sheet-tabs" ref={tabsRef} role="tablist" aria-label="Listing sections">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`${tab === id ? 'on' : ''} ${id === 'book' ? 'tab-book' : ''}`} onClick={() => go(id)}>{label}</button>
        ))}
      </nav>

      <div className="sheet-body" key={tab} role="tabpanel">
        {tab === 'overview' && (
          <>
            <p className="note">{car.note}</p>
            <section>
              <h3>Highlights</h3>
              <ul className="feat">{det.features.map((f) => <li key={f}><Tick />{f}</li>)}</ul>
            </section>
            <section>
              <h3>Paperwork</h3>
              <dl className="paper">
                <div><dt>Insurance</dt><dd>{det.insurance}</dd></div>
                <div><dt>Warranty</dt><dd>{det.warranty}</dd></div>
                <div><dt>Service record</dt><dd>{det.services.length} visits, all at authorised workshops</dd></div>
              </dl>
            </section>
            <section>
              <h3>Included with every Halden car</h3>
              <ul className="incl">{INCLUDED.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}</ul>
            </section>
            <section>
              <h3>Similar cars</h3>
              <ul className="similar">
                {similar.map((c) => (
                  <li key={c.id}><button onClick={() => onOpen(c)}>
                    <img src={cutFor(c) || c.img} alt="" loading="lazy" />
                    <span><b>{c.year} {c.name}</b><small>{price(c.price)} · {km(c.km)}</small></span>
                  </button></li>
                ))}
              </ul>
            </section>
          </>
        )}

        {tab === 'specs' && (
          <section>
            <h3>Specifications</h3>
            <dl className="spec-table">{specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <h3>Equipment</h3>
            <ul className="feat">{det.features.map((f) => <li key={f}><Tick />{f}</li>)}</ul>
          </section>
        )}

        {tab === 'history' && (
          <>
            <section>
              <h3>Halden inspection <span className="pass">Passed</span></h3>
              <ul className="checks">{INSPECTION.map(([t, d]) => <li key={t}><Tick /><span><b>{t}</b><small>{d}</small></span></li>)}</ul>
            </section>
            <section>
              <h3>Service history</h3>
              <ol className="timeline">
                {det.services.map((s) => <li key={s.at}><b>{s.year} · {km(s.at)}</b><span>{s.work}</span><small>{s.where}</small></li>)}
              </ol>
              <p className="demo-note">Service dates and the inspection are sample data for this student project.</p>
            </section>
          </>
        )}

        {tab === 'finance' && (
          <section>
            <h3>Finance estimate</h3>
            <div className="mini-emi">
              <label><span>Down payment <b>{down}% · {price(car.price * down / 100)}</b></span>
                <input id="sh-down" type="range" min={10} max={80} step={5} value={down} onChange={(e) => setDown(+e.target.value)} style={{ '--p': `${((down - 10) / 70) * 100}%` }} />
              </label>
              <div className="seg" role="group" aria-label="Loan tenure">
                {[36, 48, 60, 72].map((m) => <button key={m} className={months === m ? 'on' : ''} onClick={() => setMonths(m)} aria-pressed={months === m}>{m} months</button>)}
              </div>
              <p className="emi-line"><b>₹{Math.round(monthly).toLocaleString('en-IN')}</b> a month at 9.5% for {months} months · loan {inr(principal)}</p>
              <p className="demo-note">9.5% is a typical pre-owned car loan rate, not an offer. Your rate depends on your credit profile.</p>
              <button className="btn pop" onClick={() => go('book', 'finance')}>Get a loan callback</button>
            </div>
          </section>
        )}

        {tab === 'book' && (
          <section>
            {bookings.some((b) => b.ref !== fresh) && (
              <div className="my-for-car">
                <h3>Your bookings for this car</h3>
                {bookings.filter((b) => b.ref !== fresh).map((b) => <Ticket key={b.ref} b={b} compact />)}
              </div>
            )}
            <h3>Book</h3>
            <BookingForm key={bookType || 'x'} car={car} initialType={bookType} onBooked={(b) => setFresh(b.ref)} />
          </section>
        )}
      </div>

      {tab !== 'book' && (
        <div className="sheet-bar">
          <button className={`btn line sm ${saved ? 'on' : ''}`} onClick={() => onSave(car.id)} aria-pressed={saved}>{saved ? 'Saved' : 'Save'}</button>
          <button className="btn line sm" onClick={() => go('book', 'reserve')}>Reserve</button>
          <button className="btn dark sm" onClick={() => go('book', 'drive')}>Book <span className="hide-sm">a&nbsp;</span>test drive</button>
        </div>
      )}
    </Drawer>
  );
}
