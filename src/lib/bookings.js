// Bookings kept in this browser (localStorage). A student demo: nothing is sent to a server.
import { useSyncExternalStore } from 'react';

const KEY = 'halden-bookings';
const SHOWROOM = 'Halden Motor House, Old Airport Road, Bengaluru';

export const TYPES = {
  drive: { label: 'Test drive', short: 'At the showroom', mins: 45, place: SHOWROOM },
  home: { label: 'Home test drive', short: 'We bring it to you', mins: 60 },
  reserve: { label: 'Reservation', short: 'Hold it for 48 hours', mins: 30, place: SHOWROOM },
  finance: { label: 'Loan callback', short: 'A call from our finance desk', mins: 20, place: 'Phone call' },
  inspect: { label: 'Trade-in inspection', short: '45-minute inspection', mins: 45, place: SHOWROOM },
  visit: { label: 'Showroom visit', short: 'Look around, coffee on us', mins: 60, place: SHOWROOM },
};

const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
let list = load();
const subs = new Set();
const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ } subs.forEach((f) => f()); };

export function addBooking(b) {
  const ref = `HMH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const item = { ...b, ref, created: Date.now() };
  list = [item, ...list];
  emit();
  return item;
}
export function cancelBooking(ref) { list = list.filter((b) => b.ref !== ref); emit(); }
export const useBookings = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => list, () => list);

// Dates and slots
const pad = (n) => String(n).padStart(2, '0');
export function nextDays(n = 8) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
    return { iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, wd: i === 0 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }), d: d.getDate(), m: d.toLocaleDateString('en-IN', { month: 'short' }) };
  });
}
export const SLOTS = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
// Some slots are shown as already taken so the calendar looks like a real, busy showroom.
export const isTaken = (key, iso, slot) => hash(`${key}|${iso}|${slot}`) % 4 === 0;
export const slotLabel = (s) => { const h = +s.split(':')[0]; return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'pm' : 'am'}`; };
export const prettyDate = (iso) => new Date(`${iso}T00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

// Calendar file (.ics) for a booking.
export function downloadIcs(b) {
  const t = TYPES[b.type];
  const [y, m, d] = b.date.split('-').map(Number);
  const h = +b.slot.split(':')[0];
  const fmt = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
  const start = new Date(y, m - 1, d, h, 0);
  const end = new Date(start.getTime() + t.mins * 60000);
  const now = new Date();
  const esc = (s) => String(s).replace(/[,;\\]/g, (c) => `\\${c}`);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Halden Motor House//Bookings//EN', 'BEGIN:VEVENT',
    `UID:${b.ref}@halden.demo`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`${t.label}${b.carName ? ` – ${b.carName}` : ''}`)}`,
    `LOCATION:${esc(b.address || t.place)}`,
    `DESCRIPTION:${esc(`Halden Motor House booking ${b.ref}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `halden-${b.ref}.ics` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
