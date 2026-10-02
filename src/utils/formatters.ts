export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' | 'USDT' = 'INR',
  showSign: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const sign = isNegative ? '-' : showSign && amount > 0 ? '+' : '';

  if (currency === 'INR') {
    // Dynamic precision: for small values < 1, display 4 or 6 decimals so micro-assets don't round to 0
    const minDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount > 0 && absAmount < 1 ? 4 : absAmount % 1 === 0 ? 0 : 2;
    const maxDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount > 0 && absAmount < 1 ? 4 : 2;
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec,
    }).format(absAmount);
    return `${sign}₹${formatted}`;
  }

  if (currency === 'USD') {
    const minDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount < 1 ? 4 : absAmount % 1 === 0 ? 0 : 2;
    const maxDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount < 1 ? 4 : 2;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDec,
      maximumFractionDigits: maxDec,
    }).format(absAmount);
    return `${sign}$${formatted}`;
  }

  // USDT
  const minDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount < 1 ? 4 : 2;
  const maxDec = absAmount > 0 && absAmount < 0.01 ? 6 : absAmount < 1 ? 4 : 2;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  }).format(absAmount);
  return `${sign}${formatted} USDT`;
}

export function formatPercent(value: number, showSign: boolean = true): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const sign = isNegative ? '-' : showSign && value > 0 ? '+' : '';
  return `${sign}${absValue.toFixed(1)}%`;
}

export function formatRR(rr: number | undefined): string {
  if (!rr || rr <= 0) return '—';
  return `1 : ${rr.toFixed(1)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}
