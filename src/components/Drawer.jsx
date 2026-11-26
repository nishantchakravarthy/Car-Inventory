import { useEffect, useRef, useState } from 'react';
import { lockScroll } from '../lib/smooth.js';

// Side drawer. Animated with CSS so the content can never be left hidden by a stalled tween.
export default function Drawer({ label, onClose, className = '', children }) {
  const [closing, setClosing] = useState(false);
  const root = useRef(null);
  const done = useRef(onClose);
  done.current = onClose;
  const close = () => { setClosing(true); setTimeout(() => done.current(), 260); };
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    lockScroll(true);
    root.current.querySelector('.sheet-close')?.focus({ preventScroll: true });
    const esc = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); lockScroll(false); };
  }, []);

  return (
    <div className={`sheet-wrap ${closing ? 'closing' : ''}`} ref={root} role="dialog" aria-modal="true" aria-label={label}>
      <div className="sheet-scrim" onClick={close} />
      <div className={`sheet ${className}`}>
        <button className="sheet-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  );
}
