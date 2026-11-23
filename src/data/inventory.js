// Sample inventory for a fictional dealership (Halden Motor House, Bengaluru).
// Swap this array for data from your own backend/API.

export const PAINTS = {
  'Papaya Flame': '#e8571f',
  'Rosso Ember': '#b3241d',
  'Glacier White': '#e9ecef',
  'Obsidian': '#121417',
  'Graphite': '#4a4f57',
  'Lunar Silver': '#a9afb7',
  'Deep Teal': '#0f5c63',
  'Midnight Blue': '#14254a',
  'Racing Green': '#14402e',
  'Sandstorm': '#b99a6b',
  'Voltage Lime': '#b7d43a',
  'Azure': '#2f6fd6',
};

const defaultPalette = ['Papaya Flame', 'Rosso Ember', 'Glacier White', 'Obsidian', 'Lunar Silver', 'Deep Teal', 'Midnight Blue'];

const raw = [
  { id: 'HM-2417', model: 'Vireo GT', trim: 'Performance AWD', body: 'coupe', year: 2026, km: 0, condition: 'New', fuel: 'Electric', trans: 'Automatic', hp: 612, zero100: 3.4, range: '540 km range', seats: 4, price: 8950000, paint: 'Papaya Flame', badge: 'Flagship', featured: true, tagline: 'A grand tourer that hits 100 before you finish the sentence.' },
  { id: 'HM-2402', model: 'Ridge', trim: 'Explorer 7-seat', body: 'suv', year: 2026, km: 0, condition: 'New', fuel: 'Hybrid', trans: 'Automatic', hp: 395, zero100: 5.9, range: '18.2 km/l', seats: 7, price: 6425000, paint: 'Deep Teal', badge: 'Best seller', featured: true, darkRims: true, tagline: 'Three rows, all-terrain air suspension, zero compromise.' },
  { id: 'HM-2389', model: 'Kestrel', trim: 'Targa S', body: 'roadster', year: 2025, km: 3200, condition: 'Certified', fuel: 'Petrol', trans: 'DCT', hp: 480, zero100: 3.9, range: '11.4 km/l', seats: 2, price: 7180000, paint: 'Rosso Ember', badge: 'Just in', featured: true, tagline: 'Roof off, revs up — a mid-engine roadster tuned for back roads.' },
  { id: 'HM-2376', model: 'Strata', trim: 'Executive', body: 'sedan', year: 2026, km: 0, condition: 'New', fuel: 'Electric', trans: 'Automatic', hp: 402, zero100: 4.8, range: '610 km range', seats: 5, price: 5790000, paint: 'Midnight Blue', badge: 'New arrival', tagline: 'Whisper-quiet executive saloon with 610 km of range.' },
  { id: 'HM-2361', model: 'Atlas', trim: 'Trail Crew Cab', body: 'pickup', year: 2025, km: 8400, condition: 'Certified', fuel: 'Diesel', trans: 'Automatic', hp: 290, zero100: 8.2, range: '12.6 km/l', seats: 5, price: 4150000, paint: 'Sandstorm', darkRims: true, tagline: 'Tows 3.5 tonnes, carries five, cleans up for dinner.' },
  { id: 'HM-2355', model: 'Nova', trim: 'Long Range', body: 'hatch', year: 2026, km: 0, condition: 'New', fuel: 'Electric', trans: 'Automatic', hp: 215, zero100: 6.9, range: '455 km range', seats: 5, price: 2240000, paint: 'Voltage Lime', badge: 'City pick', tagline: 'The city EV that parks anywhere and charges in 22 minutes.' },
  { id: 'HM-2348', model: 'Vireo', trim: 'Sport RWD', body: 'coupe', year: 2024, km: 14800, condition: 'Certified', fuel: 'Petrol', trans: 'DCT', hp: 445, zero100: 4.3, range: '10.8 km/l', seats: 4, price: 5160000, paint: 'Graphite', darkRims: true, tagline: 'Rear-drive purity with a carbon roof and launch control.' },
  { id: 'HM-2333', model: 'Ridge', trim: 'Urban 5-seat', body: 'suv', year: 2025, km: 6100, condition: 'Certified', fuel: 'Petrol', trans: 'Automatic', hp: 310, zero100: 6.8, range: '13.9 km/l', seats: 5, price: 4380000, paint: 'Glacier White', tagline: 'All the Ridge presence, sized for city garages.' },
  { id: 'HM-2320', model: 'Strata', trim: 'Hybrid Signature', body: 'sedan', year: 2024, km: 21500, condition: 'Certified', fuel: 'Hybrid', trans: 'Automatic', hp: 268, zero100: 7.4, range: '21.5 km/l', seats: 5, price: 3290000, paint: 'Lunar Silver', tagline: 'Low-mileage hybrid saloon with full service history.' },
  { id: 'HM-2311', model: 'Kestrel', trim: 'Track Edition', body: 'roadster', year: 2026, km: 0, condition: 'New', fuel: 'Petrol', trans: 'DCT', hp: 560, zero100: 3.5, range: '9.6 km/l', seats: 2, price: 9640000, paint: 'Obsidian', badge: 'Limited', darkRims: true, tagline: 'One of 40 built for India. Carbon aero, track telemetry.' },
  { id: 'HM-2304', model: 'Nova', trim: 'Standard', body: 'hatch', year: 2025, km: 4300, condition: 'Certified', fuel: 'Electric', trans: 'Automatic', hp: 170, zero100: 8.1, range: '340 km range', seats: 5, price: 1590000, paint: 'Azure', tagline: 'Nearly-new city EV with battery health at 99%.' },
  { id: 'HM-2298', model: 'Atlas', trim: 'Work Single Cab', body: 'pickup', year: 2026, km: 0, condition: 'New', fuel: 'Diesel', trans: 'Manual', hp: 210, zero100: 10.4, range: '14.1 km/l', seats: 3, price: 2875000, paint: 'Racing Green', tagline: 'Payload-first workhorse with a 1.2 tonne bed.' },
];

export const BODY_LABELS = { coupe: 'Coupé', sedan: 'Sedan', suv: 'SUV', roadster: 'Roadster', pickup: 'Pickup', hatch: 'Hatchback' };

export const INVENTORY = raw.map((c) => ({
  ...c,
  paintName: c.paint,
  paint: PAINTS[c.paint],
  palette: Array.from(new Set([c.paint, ...defaultPalette])).slice(0, 7).map((n) => ({ name: n, hex: PAINTS[n] })),
}));

export const FEATURED = INVENTORY.filter((c) => c.featured);

export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const lakh = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(1)} L`);
export const kmFmt = (n) => (n === 0 ? 'Delivery km' : `${new Intl.NumberFormat('en-IN').format(n)} km`);

export function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (principal <= 0) return 0;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}
