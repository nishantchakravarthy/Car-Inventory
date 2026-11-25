// Inventory for Halden Motor House (a fictional pre-owned dealership in Bengaluru).
// Cars, engines and power figures are real; prices, kilometres and owners are sample listing data.
// Photos are hotlinked from Wikimedia Commons and credited to their photographers (see `photo`).

const commons = (file, width = 1280) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${width}`;
const filePage = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

const raw = [
  {
    id: 'ferrari-458', make: 'Ferrari', model: '458 Spider', variant: 'F1 DCT, folding hard top', year: 2013, km: 18400, fuel: 'Petrol', trans: 'Automatic',
    engine: '4.5 L V8', power: 570, body: 'Convertible', owners: 2, reg: 'KA-03', price: 24500000, segment: 'premium', featured: true,
    tag: 'Feature car', note: 'Full Ferrari service history, new clutch at 16,000 km, original paint.',
    photo: { file: 'Ferrari 458 Spider - Flickr - Alexandre Prévot (11) (cropped).jpg', author: 'Alexandre Prévot' },
  },
  {
    id: 'g63', make: 'Mercedes-AMG', model: 'G 63', variant: '4MATIC', year: 2022, km: 14100, fuel: 'Petrol', trans: 'Automatic',
    engine: '4.0 L V8 biturbo', power: 585, body: 'SUV', owners: 1, reg: 'KA-01', price: 26500000, segment: 'premium',
    tag: 'Just in', note: 'Under manufacturer warranty until 2026. Night package, 22-inch AMG wheels.',
    photo: { file: 'MERCEDES-AMG G63 (W463) China (3).jpg', author: 'Dinkun Chen' },
  },
  {
    id: '911', make: 'Porsche', model: '911 Carrera S', variant: 'PDK (992)', year: 2022, km: 9800, fuel: 'Petrol', trans: 'Automatic',
    engine: '3.0 L flat-six twin-turbo', power: 450, body: 'Coupé', owners: 1, reg: 'KA-51', price: 17800000, segment: 'premium',
    note: 'Sport Chrono, sports exhaust, front-axle lift. Porsche Approved warranty transferable.',
    photo: { file: 'Porsche 992 Carrera S coupe IMG 5838.jpg', author: 'Alexander Migl' },
  },
  {
    id: 'm4', make: 'BMW', model: 'M4 Competition', variant: 'xDrive (G82)', year: 2023, km: 6200, fuel: 'Petrol', trans: 'Automatic',
    engine: '3.0 L I6 twin-turbo', power: 510, body: 'Coupé', owners: 1, reg: 'KA-05', price: 14200000, segment: 'premium',
    tag: 'Low km', note: 'M carbon bucket seats, BMW service package valid till 2027.',
    photo: { file: 'BMW M4 Competition Coupé G82 (51341348473) (cropped).jpg', author: 'Alexandre Prevot' },
  },
  {
    id: 'defender', make: 'Land Rover', model: 'Defender 110', variant: 'D300 X-Dynamic HSE', year: 2023, km: 21300, fuel: 'Diesel', trans: 'Automatic',
    engine: '3.0 L I6 diesel MHEV', power: 300, body: 'SUV', owners: 1, reg: 'KA-04', price: 11200000, segment: 'premium',
    note: 'Air suspension, Explorer pack, 7 seats. All services at JLR Bengaluru.',
    photo: { file: 'Land Rover Defender (L663) at IAA 2019 IMG 0688.jpg', author: 'Alexander Migl' },
  },
  {
    id: 'fortuner', make: 'Toyota', model: 'Fortuner Legender', variant: '2.8 4x2 AT', year: 2023, km: 26500, fuel: 'Diesel', trans: 'Automatic',
    engine: '2.8 L I4 diesel', power: 204, body: 'SUV', owners: 1, reg: 'KA-53', price: 4750000, segment: 'everyday',
    tag: 'Price drop', note: 'Single owner, Toyota extended warranty, new tyres.',
    photo: { file: 'Toyota Fortuner GUN165 Legender 2.8 Q 4x2 Platinum White Pearl Mica.jpg', author: 'Ethan Llamas' },
  },
  {
    id: 'xuv700', make: 'Mahindra', model: 'XUV700', variant: 'AX7 L Diesel AT', year: 2023, km: 33800, fuel: 'Diesel', trans: 'Automatic',
    engine: '2.2 L mHawk diesel', power: 185, body: 'SUV', owners: 1, reg: 'KA-02', price: 2490000, segment: 'everyday',
    note: 'ADAS, Sony 3D audio, 7 seats. Comprehensive insurance till Aug 2027.',
    photo: { file: 'A black Mahindra XUV700 SUV in Ashiana Brahmananda, Jamshedpur, India (Ank Kumar, Infosys Limited) 02.jpg', author: 'Ank Kumar' },
  },
  {
    id: 'creta', make: 'Hyundai', model: 'Creta', variant: 'SX(O) 1.5 IVT', year: 2024, km: 11200, fuel: 'Petrol', trans: 'Automatic',
    engine: '1.5 L MPi petrol', power: 115, body: 'SUV', owners: 1, reg: 'KA-03', price: 1860000, segment: 'everyday',
    tag: 'Like new', note: 'Panoramic sunroof, Level 2 ADAS, remaining factory warranty.',
    photo: { file: '2024 Hyundai Creta 1.5 MPi SX(O) (India) front view.png', author: 'CARS WORLD Kannada' },
  },
  {
    id: 'thar', make: 'Mahindra', model: 'Thar', variant: 'LX 4x4 Diesel AT', year: 2023, km: 18900, fuel: 'Diesel', trans: 'Automatic',
    engine: '2.2 L mHawk diesel', power: 132, body: 'SUV', owners: 1, reg: 'KA-41', price: 1580000, segment: 'everyday',
    note: 'Hard top, factory 4x4 with low range. Never taken off-road per owner.',
    photo: { file: 'Mahindra Thar Photoshoot at Perupalem Beach (West Godavari District, AP, India) Djdavid.jpg', author: 'DjDavid1998' },
  },
  {
    id: 'city', make: 'Honda', model: 'City', variant: 'ZX 1.5 CVT', year: 2022, km: 28500, fuel: 'Petrol', trans: 'Automatic',
    engine: '1.5 L i-VTEC petrol', power: 121, body: 'Sedan', owners: 1, reg: 'KA-01', price: 1290000, segment: 'everyday',
    note: 'Lane Watch camera, sunroof, all services at Honda.',
    photo: { file: '0 Honda City (7th generation) sedan.jpg', author: 'Benespit' },
  },
  {
    id: 'seltos', make: 'Kia', model: 'Seltos', variant: 'HTX 1.5 IVT', year: 2021, km: 42000, fuel: 'Petrol', trans: 'Automatic',
    engine: '1.5 L petrol', power: 115, body: 'SUV', owners: 2, reg: 'KA-05', price: 1240000, segment: 'everyday',
    note: 'Second owner, accident-free, new battery fitted in 2026.',
    photo: { file: 'Kia Seltos car Htx model (cropped).jpg', author: 'Thesureshg' },
  },
  {
    id: 'nexon', make: 'Tata', model: 'Nexon', variant: 'XZA+ 1.2 Turbo AMT', year: 2022, km: 31000, fuel: 'Petrol', trans: 'Automatic',
    engine: '1.2 L Revotron turbo petrol', power: 120, body: 'SUV', owners: 1, reg: 'KA-51', price: 940000, segment: 'everyday',
    note: '5-star Global NCAP rated body shell, sunroof, connected car tech.',
    photo: { file: '2023 Tata Nexon XZA+ front view.jpg', author: 'Dairokkan9' },
  },
  {
    id: 'swift', make: 'Maruti Suzuki', model: 'Swift', variant: 'ZXi+ AMT', year: 2024, km: 8700, fuel: 'Petrol', trans: 'Automatic',
    engine: '1.2 L Z-series petrol', power: 82, body: 'Hatchback', owners: 1, reg: 'KA-03', price: 820000, segment: 'everyday',
    tag: 'First car pick', note: 'New-generation Swift, 6 airbags, under Maruti warranty.',
    photo: { file: 'Suzuki Swift (2024) hybrid IMG 8820.jpg', author: 'Alexander Migl' },
  },
];

export const INVENTORY = raw.map((c) => ({
  ...c,
  name: `${c.make} ${c.model}`,
  img: commons(c.photo.file, 960),
  imgLarge: commons(c.photo.file, 1920),
  credit: { author: c.photo.author, url: filePage(c.photo.file) },
}));

export const FEATURE = INVENTORY.find((c) => c.featured);
export const MAKES = [...new Set(INVENTORY.map((c) => c.make))].sort();
export const BODIES = [...new Set(INVENTORY.map((c) => c.body))];
export const FUELS = [...new Set(INVENTORY.map((c) => c.fuel))];

export const PAINTS = [
  { name: 'Rosso Corsa', hex: '#b5120f' },
  { name: 'Giallo Modena', hex: '#f2b800' },
  { name: 'Nero Daytona', hex: '#0c0c0e' },
  { name: 'Bianco Avus', hex: '#efefec' },
  { name: 'Blu Pozzi', hex: '#1d3461' },
  { name: 'Grigio Silverstone', hex: '#5d6166' },
];

export const price = (n) => (n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : `₹${(n / 100000).toFixed(2)} L`);
export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const km = (n) => `${new Intl.NumberFormat('en-IN').format(n)} km`;
export const ordinal = (n) => ['1st', '2nd', '3rd'][n - 1] || `${n}th`;

export function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (principal <= 0) return 0;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}
