import { FEATURED, inr } from '../data/inventory.js';

export default function Showroom({ featured, onOpen }) {
  const car = FEATURED[featured];
  const panels = [
    { k: 'Performance', big: `${car.zero100}s`, unit: '0–100 km/h', text: `${car.hp} hp through a ${car.trans === 'DCT' ? 'dual-clutch gearbox' : 'smooth automatic'}. Launch control and adaptive dampers come standard.` },
    { k: car.fuel === 'Electric' ? 'Range' : 'Efficiency', big: car.range.split(' ')[0], unit: car.range.split(' ').slice(1).join(' '), text: car.fuel === 'Electric' ? '10–80% in 22 minutes on a 250 kW charger. Home wallbox installation included.' : 'Real-world figures from our own test loop, not the brochure.' },
    { k: 'Cabin', big: `${car.seats}`, unit: 'seats', text: `${car.trim} spec: ventilated leather, 14-speaker audio and a 360° camera. Fits real luggage, not just the brochure kind.` },
    { k: 'Ownership', big: '3 yr', unit: 'warranty', text: `${inr(car.price)} on the road. Free servicing for 3 years, 7-day money-back, and trade-in valued on the spot.` },
  ];
  return (
    <section id="showroom" className="showroom">
      <div className="showroom-head">
        <p className="kicker">Walkaround</p>
        <h2>The {car.model}, <em>up close</em></h2>
      </div>
      <div className="callouts">
        {panels.map((p, i) => (
          <article className="callout" key={i} data-i={i}>
            <span className="callout-k">{String(p.k)}</span>
            <p className="callout-big">{p.big}<small>{p.unit}</small></p>
            <p className="callout-text">{p.text}</p>
          </article>
        ))}
      </div>
      <div className="rail" aria-hidden="true"><span className="rail-fill" /></div>
      <button className="btn ghost showroom-cta" onClick={() => onOpen(car)}>Configure this {car.model}</button>
    </section>
  );
}
