import { Link } from 'react-router-dom';

export default function Button({ children, to, variant = 'primary', type = 'button', loading = false, disabled = false, className = '', ...props }) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  const content = loading ? 'جارٍ التنفيذ…' : children;

  if (to) {
    return (
      <Link
        className={classes}
        to={to}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={isDisabled ? (event) => event.preventDefault() : props.onClick}
        {...Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'onClick'))}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} disabled={isDisabled} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
