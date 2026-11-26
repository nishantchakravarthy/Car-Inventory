// Extra listing details per car. Equipment is what that model and variant offers;
// service dates, insurance and warranty are sample listing data like the prices.

const D = {
  'ferrari-458': { seats: 2, drive: 'Rear-wheel drive', insurance: 'Comprehensive till Mar 2027', warranty: 'Ferrari Power warranty available',
    features: ['Folding aluminium hard top', 'Carbon-ceramic brakes', 'Manettino drive-mode switch', 'E-Diff electronic differential', 'Front-axle lift', 'Carbon racing seats'] },
  g63: { seats: 5, drive: 'Four-wheel drive, 3 locking diffs', insurance: 'Comprehensive till Jan 2027', warranty: 'Mercedes-Benz warranty till Dec 2026',
    features: ['Three locking differentials', 'Burmester surround sound', 'Twin 12.3-inch screens', 'AMG Ride Control suspension', 'Multibeam LED headlamps', '22-inch AMG wheels'] },
  911: { seats: 4, drive: 'Rear-wheel drive', insurance: 'Comprehensive till Oct 2027', warranty: 'Porsche Approved till Sep 2027',
    features: ['Sport Chrono package', 'Sports exhaust', 'Front-axle lift', 'PASM adaptive dampers', 'Bose surround sound', 'Wet mode'] },
  m4: { seats: 4, drive: 'M xDrive all-wheel drive', insurance: 'Comprehensive till May 2027', warranty: 'BMW warranty till Apr 2026, service pack till 2027',
    features: ['M carbon bucket seats', 'M xDrive with 2WD mode', 'Adaptive M suspension', 'Harman Kardon audio', 'Laser headlights', 'Head-up display'] },
  defender: { seats: 7, drive: 'Permanent all-wheel drive', insurance: 'Comprehensive till Feb 2027', warranty: 'JLR warranty till Feb 2026, extendable',
    features: ['Electronic air suspension', 'Terrain Response 2', 'ClearSight ground view', 'Meridian sound system', 'Explorer pack', '900 mm wading depth'] },
  fortuner: { seats: 7, drive: 'Rear-wheel drive', insurance: 'Comprehensive till Jul 2027', warranty: 'Toyota extended warranty till 2028',
    features: ['Dual-zone climate control', 'JBL 11-speaker audio', 'Powered tailgate', 'Ventilated front seats', 'Wireless charger', '7 airbags'] },
  xuv700: { seats: 7, drive: 'Front-wheel drive', insurance: 'Comprehensive till Aug 2027', warranty: 'Mahindra warranty till Jun 2026',
    features: ['ADAS with adaptive cruise', 'Sony 3D sound, 12 speakers', 'Twin 10.25-inch screens', 'Panoramic sunroof', '360° camera', '7 airbags'] },
  creta: { seats: 5, drive: 'Front-wheel drive', insurance: 'Comprehensive till Mar 2027', warranty: 'Hyundai warranty till 2027',
    features: ['Level 2 ADAS', 'Panoramic sunroof', 'Ventilated front seats', 'Bose 8-speaker audio', '360° camera', 'Dual-zone climate control'] },
  thar: { seats: 4, drive: '4x4 with low range', insurance: 'Comprehensive till Nov 2026', warranty: 'Mahindra warranty till Sep 2026',
    features: ['4x4 low-range transfer case', 'Factory hard top', 'Touchscreen with Android Auto', 'Cruise control', 'Tyre pressure monitoring', 'Washable floor'] },
  city: { seats: 5, drive: 'Front-wheel drive', insurance: 'Comprehensive till Dec 2026', warranty: 'Honda extended warranty till 2027',
    features: ['Honda LaneWatch camera', 'Electric sunroof', '8-inch touchscreen', 'Cruise control', '6 airbags', 'LED headlamps'] },
  seltos: { seats: 5, drive: 'Front-wheel drive', insurance: 'Comprehensive till Apr 2027', warranty: 'Out of factory warranty, Halden 1-year cover',
    features: ['10.25-inch touchscreen', 'Electric sunroof', 'LED headlamps', 'Push-button start', 'Cruise control', 'Rear AC vents'] },
  nexon: { seats: 5, drive: 'Front-wheel drive', insurance: 'Comprehensive till Sep 2027', warranty: 'Tata warranty till Aug 2027',
    features: ['Electric sunroof', 'Connected car app', 'Harman audio', 'Auto headlamps', 'Rear AC vents', '5-star Global NCAP shell'] },
  swift: { seats: 5, drive: 'Front-wheel drive', insurance: 'Comprehensive till Jun 2027', warranty: 'Maruti warranty till 2027',
    features: ['6 airbags as standard', '9-inch touchscreen', 'Wireless phone charger', 'Cruise control', 'LED headlamps', 'Rear camera'] },
};

// Service visits roughly every 10,000 km, spread between the model year and now.
function services(car) {
  const n = Math.max(1, Math.floor(car.km / 10000));
  const span = Math.max(1, 2026 - car.year);
  return Array.from({ length: n }, (_, i) => {
    const at = Math.round(((i + 1) * car.km) / (n + 0.4) / 100) * 100;
    const yr = Math.min(2026, car.year + Math.round(((i + 1) / n) * span));
    return { at, year: yr, where: `${car.make} authorised workshop, Bengaluru`, work: i === n - 1 ? 'Periodic service, oil and filters, brake fluid' : 'Periodic service, oil and filters' };
  }).reverse();
}

export const INSPECTION = [
  ['Engine and gearbox', 'Cold start, no smoke, smooth shifts'],
  ['Brakes and suspension', 'Pads and discs within spec, no knocks'],
  ['Electricals and AC', 'All switches, screens and cooling checked'],
  ['Body panels and paint', 'Paint-depth gauge on every panel'],
  ['Tyres and wheels', 'All four tyres above 60% tread'],
  ['Flood and accident check', 'Chassis, airbags and wiring loom clear'],
];

export const INCLUDED = [
  ['7-day return', 'Up to 300 km, full refund'],
  ['1-year warranty', 'Engine and gearbox, from Halden'],
  ['RC transfer done', 'We handle the RTO paperwork'],
  ['Free first service', 'At any authorised workshop'],
];

export const detailsFor = (car) => ({ ...D[car.id], services: services(car) });
