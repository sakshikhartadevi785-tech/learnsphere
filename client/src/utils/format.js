export const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
export const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(2026, 0, 1, hour, minute));
}

export function getErrorMessage(error) {
  if (Array.isArray(error?.details) && error.details.length) {
    return error.details.map((item) => item.msg || item.message).filter(Boolean).join(' ');
  }
  return error?.message || 'Something went wrong. Please try again.';
}
