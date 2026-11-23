import { useEffect, useState } from 'react';
import Header from './sections/Header.jsx';
import Hero from './sections/Hero.jsx';
import Inventory, { START } from './sections/Inventory.jsx';
import CarSheet from './sections/CarSheet.jsx';
import { Brands, HowItWorks, Finance, Sell, Footer } from './sections/Services.jsx';
import { FEATURE } from './data/inventory.js';

const loadSaved = () => { try { return JSON.parse(localStorage.getItem('halden-saved') || '[]'); } catch { return []; } };
const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [filters, setFilters] = useState(START);
  const [saved, setSaved] = useState(loadSaved);
  const [open, setOpen] = useState(null);

  useEffect(() => { try { localStorage.setItem('halden-saved', JSON.stringify(saved)); } catch { /* storage unavailable */ } }, [saved]);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const onSearch = ({ make, body, budget }) => {
    setFilters({ ...START, makes: make === 'all' ? [] : [make], body, max: budget });
    go('inventory');
  };
  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <Header go={go} onTestDrive={() => setOpen({ car: FEATURE, drive: true })} />
      <main>
        <Hero onSearch={onSearch} onOpen={(car) => setOpen({ car })} reduceMotion={reduceMotion} />
        <Brands />
        <Inventory filters={filters} setFilters={setFilters} saved={saved} onSave={toggleSave} onOpen={(car) => setOpen({ car })} />
        <HowItWorks />
        <Finance />
        <Sell />
      </main>
      <Footer />
      {open && (
        <CarSheet key={open.car.id} car={open.car} startOnDrive={open.drive} saved={saved.includes(open.car.id)}
          onSave={toggleSave} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
