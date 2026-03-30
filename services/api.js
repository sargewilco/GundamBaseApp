const BASE_URL = 'https://gundam.tomcannon.com/api';

export async function fetchInventory() {
  const res = await fetch(`${BASE_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}
