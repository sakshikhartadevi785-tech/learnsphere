export function Alert({ type = 'info', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onClose ? <button type="button" className="icon-button" onClick={onClose} aria-label="Dismiss message">×</button> : null}
    </div>
  );
}
