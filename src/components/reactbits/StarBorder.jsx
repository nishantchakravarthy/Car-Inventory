// Adapted from React Bits "StarBorder" — travelling light along a pill border.
export default function StarBorder({ as: Tag = 'button', className = '', color = '#ff7a3d', speed = '5s', children, ...rest }) {
  return (
    <Tag className={`star-border ${className}`} {...rest}>
      <span className="sb-glow sb-bottom" style={{ background: `radial-gradient(circle, ${color}, transparent 12%)`, animationDuration: speed }} />
      <span className="sb-glow sb-top" style={{ background: `radial-gradient(circle, ${color}, transparent 12%)`, animationDuration: speed }} />
      <span className="sb-inner">{children}</span>
    </Tag>
  );
}
