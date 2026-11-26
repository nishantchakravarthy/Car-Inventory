import Drawer from '../components/Drawer.jsx';
import BookingForm, { Ticket } from '../components/Booking.jsx';
import { useBookings } from '../lib/bookings.js';

const TITLES = { list: 'Your bookings', visit: 'Plan a showroom visit', inspect: 'Book a trade-in inspection' };

// "Bookings" drawer: every booking made on this browser, plus quick visit / inspection booking.
export default function BookingsDrawer({ mode = 'list', onClose, onBrowse }) {
  const all = useBookings();
  return (
    <Drawer label={TITLES[mode]} onClose={onClose} className="bookings-sheet">
      {(close) => (
        <div className="bk">
          <header className="bk-head">
            <p className="eyebrow">Halden Motor House</p>
            <h2>{TITLES[mode]}</h2>
          </header>
          {mode === 'list' ? (
            <div className="bk-list">
              {all.length ? all.map((b) => <Ticket key={b.ref} b={b} />) : (
                <div className="bk-empty">
                  <p className="hand">nothing booked yet</p>
                  <p>Open any car to book a test drive, a home test drive, a reservation or a loan callback.</p>
                  <button className="btn dark" onClick={() => { close(); setTimeout(onBrowse, 280); }}>Browse the cars</button>
                </div>
              )}
              <p className="demo-note">Student demo site: bookings are kept in this browser only and nothing is sent to anyone.</p>
            </div>
          ) : (
            <BookingForm kind={mode} />
          )}
        </div>
      )}
    </Drawer>
  );
}
