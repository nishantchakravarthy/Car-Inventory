// Adapted from React Bits "ShinyText" — a light sweep across text.
export default function ShinyText({ text, speed = 4, className = '' }) {
  return <span className={`shiny-text ${className}`} style={{ animationDuration: `${speed}s` }}>{text}</span>;
}
