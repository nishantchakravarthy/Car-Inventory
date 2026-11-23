import { useState } from 'react';
import Doodle from '../components/Doodle.jsx';
import ScrollVelocity from '../components/reactbits/ScrollVelocity.jsx';
import { INVENTORY, MAKES, inr, price, emi } from '../data/inventory.js';

export function Brands() {
  return <ScrollVelocity className="brands" items={MAKES} speed={28} />;
}

export function HowItWorks() {
  const steps = [
    ['Pick a car', 'Every listing has the real odometer reading, owner count and full inspection report. Save a few and compare them side by side at the showroom.'],
    ['Drive it', 'Test drives at our Old Airport Road showroom, or at your home anywhere in Bengaluru city limits. Bring your licence and we’ll handle the rest.'],
    ['Take it home', 'We do the RC transfer, insurance and loan paperwork. If it doesn’t feel right within 7 days or 300 km, bring it back for a full refund.'],
  ];
  return (
    <section className="how" aria-labelledby="how-title">
      <h2 id="how-title">How buying works <span className="hand">it’s honestly this easy</span></h2>
      <ol>
        {steps.map(([t, d], i) => (
          <li key={t}>
            <h3>{t}</h3><p>{d}</p>
            {i < steps.length - 1 && <Doodle type="arrow" className="how-arrow" color="#141414" width={3} delay={0.2 + i * 0.3} />}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Finance() {
  const [id, setId] = useState('creta');
  const [down, setDown] = useState(20);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(9.5);
  const car = INVENTORY.find((c) => c.id === id);
  const principal = car.price * (1 - down / 100);
  const monthly = emi(principal, rate, months);
  const interest = Math.max(0, monthly * months - principal);
  const share = principal / (principal + interest || 1);
  return (
    <section id="finance" className="finance">
      <div className="finance-copy">
        <h2>Work out the <span className="hl">EMI</span></h2>
        <p>Car loans from partner banks, arranged at the showroom. Rates depend on your credit profile; 9.5% is a typical figure for a pre-owned car loan, not an offer.</p>
      </div>
      <div className="calc">
        <div className="calc-in">
          <label><span>Car</span>
            <select id="fin-car" value={id} onChange={(e) => setId(e.target.value)}>
              {INVENTORY.map((c) => <option key={c.id} value={c.id}>{c.year} {c.name} — {price(c.price)}</option>)}
            </select>
          </label>
          <label><span>Down payment <b>{down}% · {price(car.price * down / 100)}</b></span>
            <input id="fin-down" type="range" min={10} max={80} step={5} value={down} onChange={(e) => setDown(+e.target.value)} style={{ '--p': `${((down - 10) / 70) * 100}%` }} />
          </label>
          <label><span>Tenure <b>{months} months</b></span>
            <input id="fin-months" type="range" min={12} max={84} step={12} value={months} onChange={(e) => setMonths(+e.target.value)} style={{ '--p': `${((months - 12) / 72) * 100}%` }} />
          </label>
          <label><span>Interest rate <b>{rate.toFixed(1)}%</b></span>
            <input id="fin-rate" type="range" min={7.5} max={15} step={0.25} value={rate} onChange={(e) => setRate(+e.target.value)} style={{ '--p': `${((rate - 7.5) / 7.5) * 100}%` }} />
          </label>
        </div>
        <div className="calc-out" aria-live="polite">
          <span>Monthly EMI</span>
          <strong>₹{Math.round(monthly).toLocaleString('en-IN')}</strong>
          <div className="bar" aria-hidden="true"><i style={{ width: `${share * 100}%` }} /></div>
          <dl>
            <div><dt><i className="k1" />Loan amount</dt><dd>{inr(principal)}</dd></div>
            <div><dt><i className="k2" />Total interest</dt><dd>{inr(interest)}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Sell() {
  const [sent, setSent] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setSent(`${d.get('year')} ${d.get('make')} ${d.get('model')}`);
  };
  return (
    <section id="sell" className="sell">
      <div>
        <h2>Selling or trading in? <Doodle type="star" className="sell-star" color="#ffd23f" width={3} /></h2>
        <p>Bring your car to the showroom for a 45-minute inspection and a written offer, valid for 7 days. Use it against any car here, or take the money by bank transfer the same day.</p>
      </div>
      {sent ? (
        <div className="notice"><strong>Got it — {sent}.</strong> On a real site we’d call you to book the inspection. <small>This is a student demo site, so nothing was sent.</small></div>
      ) : (
        <form className="sell-form" onSubmit={submit}>
          <label><span>Make</span><input id="sell-make" name="make" required placeholder="e.g. Hyundai" /></label>
          <label><span>Model</span><input id="sell-model" name="model" required placeholder="e.g. i20" /></label>
          <label><span>Year</span><input id="sell-year" name="year" type="number" min="2000" max="2026" required placeholder="2019" /></label>
          <label><span>Kilometres</span><input id="sell-km" name="km" type="number" min="0" required placeholder="45000" /></label>
          <label className="wide"><span>Mobile number</span><input id="sell-phone" name="phone" type="tel" inputMode="tel" required pattern="[0-9 +]{10,15}" /></label>
          <button className="btn dark wide" type="submit">Book an inspection</button>
        </form>
      )}
    </section>
  );
}

export function Footer() {
  return (
    <footer id="visit" className="footer">
      <div className="visit">
        <div>
          <h2>Come say hi <span className="hand">(the coffee’s free)</span></h2>
          <p>Halden Motor House, Old Airport Road, Bengaluru (demo address). Parking for 20 cars, and the coffee is free.</p>
        </div>
        <ul className="hours">
          <li><span>Monday – Friday</span><b>10:00 – 20:00</b></li>
          <li><span>Saturday – Sunday</span><b>10:00 – 21:00</b></li>
          <li><span>Service desk</span><b>08:30 – 18:00</b></li>
        </ul>
      </div>
      <details className="credits">
        <summary>Photo and model credits</summary>
        <p>Car photos are from Wikimedia Commons, used under their free licences (see each file page). They show the same model as the listing, not the listed car itself. The 3D Ferrari 458 Italia model is by vicent091036 and comes from the three.js examples.</p>
        <ul>
          {INVENTORY.map((c) => <li key={c.id}>{c.year} {c.name}: <a href={c.credit.url} target="_blank" rel="noopener noreferrer">{c.credit.author}</a></li>)}
          <li>3D model: <a href="https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6" target="_blank" rel="noopener noreferrer">vicent091036</a></li>
        </ul>
      </details>
      <div className="foot-bar">
        <span>© 2026 Halden Motor House — a student web project. Prices and stock are sample data.</span>
        <span>Built with React, three.js, GSAP and React Bits.</span>
      </div>
    </footer>
  );
}
