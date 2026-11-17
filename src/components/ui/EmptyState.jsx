import Button from './Button';

export default function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="empty-state" role="status">
      <h2>{title}</h2>
      {description ? <p className="muted">{description}</p> : null}
      {actionLabel && actionTo ? <Button to={actionTo}>{actionLabel}</Button> : null}
    </div>
  );
}
