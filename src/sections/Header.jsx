import { useEffect, useState } from 'react';

export function Logo() {
  return (
    <span className="logo">
      <b>Halden</b>
      <span>Motor House</span>
    </span>
  );
}

export default function Header({ go, onTestDrive }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const links = [['inventory', 'Buy a car'], ['sell', 'Sell or trade in'], ['finance', 'Finance'], ['visit', 'Visit us']];
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="logo-link" onClick={(e) => { e.preventDefault(); go('top'); }} aria-label="Halden Motor House, back to top"><Logo /></a>
      <nav className="nav" aria-label="Main">
        {links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>)}
      </nav>
      <div className="header-right">
        <span className="open-now">Open today · 10 am – 8 pm</span>
        <button className="btn dark sm" onClick={onTestDrive}>Book a test drive</button>
      </div>
    </header>
  );
}
