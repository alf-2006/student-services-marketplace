export function formatPrice(value) {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value) {
  const date = value?.toDate?.() || (value instanceof Date ? value : new Date(value));
  if (Number.isNaN(date.getTime())) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(date);
}
