import { useState } from 'react';
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx';
import ScrollVelocity from '../components/reactbits/ScrollVelocity.jsx';
import SplitText from '../components/reactbits/SplitText.jsx';
import { INVENTORY, inr, lakh, emi } from '../data/inventory.js';

const SERVICES = [
  { t: 'Trade-in on the spot', d: 'Drive your current car in, get a written valuation in 30 minutes, and use it as your down payment.' },
  { t: 'Doorstep test drives', d: 'Anywhere in Bengaluru city limits. We bring the car, you bring your licence.' },
  { t: '150-point certification', d: 'Every pre-owned Halden is inspected, reconditioned and sold with a 1-year warranty minimum.' },
];

export default function Finance() {
  const [id, setId] = useState(INVENTORY[0].id);
  const [down, setDown] = useState(25);
  const [tenure, setTenure] = useState(60);
  const [rate, setRate] = useState(8.9);
  const car = INVENTORY.find((c) => c.id === id);
  const principal = car.price * (1 - down / 100);
  const monthly = emi(principal, rate, tenure);
  const total = monthly * tenure;
  const intShare = total > 0 ? Math.max(0, (total - principal) / total) : 0;

  return (
    <section id="finance" className="finance">
      <ScrollVelocity items={['Same-day delivery', 'Home EV charger fitted free', '3-year free service', '7-day money back', 'Trade-ins welcome', 'Zero-cost EMI on select models']} speed={50} />
      <div className="fin-wrap">
        <div className="fin-copy">
          <p className="kicker">Finance</p>
          <h2><SplitText text="Own it" scroll /> <em><SplitText text="your way" scroll delay={0.2} /></em></h2>
          <p>Pick a car and shape the loan. Rates shown are indicative; your final rate depends on the lender’s credit check.</p>
        </div>
        <div className="calc">
          <div className="calc-inputs">
            <label className="field"><span>Car</span>
              <select id="f-car" value={id} onChange={(e) => setId(e.target.value)}>
                {INVENTORY.map((c) => <option key={c.id} value={c.id}>{c.model} {c.trim} — {lakh(c.price)}</option>)}
              </select>
            </label>
            <label className="field range"><span>Down payment <b>{down}% · {lakh(car.price * down / 100)}</b></span>
              <input id="f-down" type="range" min={0} max={80} step={5} value={down} onChange={(e) => setDown(+e.target.value)} style={{ '--p': `${down / 0.8}%` }} />
            </label>
            <label className="field range"><span>Tenure <b>{tenure} months</b></span>
              <input id="f-ten" type="range" min={12} max={84} step={12} value={tenure} onChange={(e) => setTenure(+e.target.value)} style={{ '--p': `${((tenure - 12) / 72) * 100}%` }} />
            </label>
            <label className="field range"><span>Interest <b>{rate.toFixed(1)}% p.a.</b></span>
              <input id="f-rate" type="range" min={6.5} max={14} step={0.1} value={rate} onChange={(e) => setRate(+e.target.value)} style={{ '--p': `${((rate - 6.5) / 7.5) * 100}%` }} />
            </label>
          </div>
          <div className="calc-out" aria-live="polite">
            <span>Monthly EMI</span>
            <strong>₹{Math.round(monthly).toLocaleString('en-IN')}</strong>
            <div className="split-bar"><i style={{ width: `${(1 - intShare) * 100}%` }} /><b style={{ width: `${intShare * 100}%` }} /></div>
            <dl>
              <div><dt><i className="k-p" />Loan amount</dt><dd>{inr(principal)}</dd></div>
              <div><dt><i className="k-i" />Total interest</dt><dd>{inr(Math.max(0, total - principal))}</dd></div>
              <div><dt>Total payable</dt><dd>{inr(total + car.price * down / 100)}</dd></div>
            </dl>
          </div>
        </div>
        <div className="services">
          {SERVICES.map((s) => (
            <SpotlightCard key={s.t} className="service" tilt={4}>
              <h3>{s.t}</h3><p>{s.d}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
