import SplitText from '../components/reactbits/SplitText.jsx';
import ShinyText from '../components/reactbits/ShinyText.jsx';
import StarBorder from '../components/reactbits/StarBorder.jsx';
import Magnet from '../components/reactbits/Magnet.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import { FEATURED, INVENTORY, BODY_LABELS, lakh } from '../data/inventory.js';

export default function Hero({ featured, onFeature, driving, onExplore, onOpen }) {
  const car = FEATURED[featured];
  return (
    <section id="top" className="hero snap">
      <div className="hero-copy">
        <p className="kicker"><ShinyText text="Halden Motor House · Bengaluru showroom" /></p>
        <h1 className="hero-title">
          <SplitText text="Find the one that" delay={0.2} />
          <span className="accent-wrap"> <SplitText text="moves" className="accent" delay={0.55} stagger={0.06} /> </span>
          <SplitText text="you." delay={0.75} />
        </h1>
        <p className="hero-sub">
          New and certified Halden cars, photographed in 3D and ready for a test drive this week.
          Spin them, repaint them, run the EMI — then come and drive the one you picked.
        </p>
        <div className="hero-cta">
          <Magnet><StarBorder onClick={onExplore}>Browse inventory</StarBorder></Magnet>
          <button className="btn ghost" onClick={() => onOpen(car)}>View {car.model} in 3D</button>
        </div>
        <dl className="hero-stats">
          <div><dt>In stock now</dt><dd><CountUp to={INVENTORY.length} duration={1.6} /></dd></div>
          <div><dt>Inspection points</dt><dd><CountUp to={150} duration={2} suffix="+" /></dd></div>
          <div><dt>Return window</dt><dd><CountUp to={7} duration={1.4} suffix=" days" /></dd></div>
        </dl>
      </div>

      <div className="hero-dock" aria-label="Featured cars">
        <div className="dock-info" key={car.id}>
          <span className="dock-type">{BODY_LABELS[car.body]} · {car.fuel}</span>
          <strong className="dock-name">{car.model} <em>{car.trim}</em></strong>
          <span className="dock-meta"><b>{lakh(car.price)}</b><span>{car.hp} hp</span><span>0–100 in {car.zero100}s</span></span>
        </div>
        <div className="dock-pills" role="tablist">
          {FEATURED.map((c, i) => (
            <button key={c.id} role="tab" aria-selected={i === featured} disabled={driving}
              className={`pill ${i === featured ? 'on' : ''}`} onClick={() => i !== featured && onFeature(i)}>
              <i style={{ background: c.paint }} />{c.model}
            </button>
          ))}
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true"><span />Scroll to walk around</div>
    </section>
  );
}
