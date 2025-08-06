// Utility for price history API
export async function logPriceHistory({ pantry_item_id, price, quantity }) {
  const res = await fetch('/api/price_history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pantry_item_id, price, quantity })
  });
  if (!res.ok) throw new Error('Failed to log price history');
  return res.json();
}

// Fetch weekly price history aggregation
export async function fetchWeeklyPriceHistory() {
  const res = await fetch('/api/price_history/weekly');
  if (!res.ok) throw new Error('Failed to fetch weekly price history');
  return res.json();
}
