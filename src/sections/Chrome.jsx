// Site chrome: navigation bar and footer.
import { useEffect, useState } from 'react';
import Magnet from '../components/reactbits/Magnet.jsx';

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 20 L14 4 L20 12 L26 4 L38 20" /><path d="M10 20h20" /></svg>
      <span>HALDEN</span>
    </span>
  );
}

export function Nav({ go, onDrive }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [['showroom', 'Showroom'], ['inventory', 'Inventory'], ['finance', 'Finance'], ['visit', 'Visit']];
  return (
    <nav className={`nav ${solid ? 'solid' : ''}`}>
      <a href="#top" onClick={(e) => { e.preventDefault(); go('top'); }} aria-label="Halden Motor House home"><Logo /></a>
      <div className="nav-links">
        {links.map(([id, l]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{l}</a>)}
      </div>
      <Magnet strength={0.25}><button className="btn primary sm" onClick={onDrive}>Test drive</button></Magnet>
    </nav>
  );
}

export function Footer({ go }) {
  return (
    <footer id="visit" className="footer">
      <div className="visit">
        <div>
          <p className="kicker">Visit the showroom</p>
          <h2>Come <em>drive</em> it.</h2>
          <p>Halden Motor House, Old Airport Road, Bengaluru (demo address). Open every day, 10 am – 8 pm. Evening test drives until 9 pm on weekends.</p>
        </div>
        <ul className="hours">
          <li><span>Mon – Fri</span><b>10:00 – 20:00</b></li>
          <li><span>Sat – Sun</span><b>10:00 – 21:00</b></li>
          <li><span>Service desk</span><b>08:30 – 18:00</b></li>
        </ul>
      </div>
      <div className="foot-bar">
        <Logo />
        <span>3D vehicles generated in the browser with three.js · motion by GSAP · UI components adapted from React Bits.</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); go('top'); }}>Back to top ↑</a>
      </div>
    </footer>
  );
}
