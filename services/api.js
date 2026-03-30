import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://gundam.tomcannon.com/api';

async function authHeaders() {
  const creds = await AsyncStorage.getItem('auth_credentials');
  if (!creds) return {};
  return { Authorization: `Basic ${creds}` };
}

export async function saveCredentials(username, password) {
  const encoded = btoa(`${username}:${password}`);
  await AsyncStorage.setItem('auth_credentials', encoded);
}

export async function clearCredentials() {
  await AsyncStorage.removeItem('auth_credentials');
}

export async function fetchInventory() {
  const res = await fetch(`${BASE_URL}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function addKit(data) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to add kit');
  return res.json();
}

export async function updateKit(id, data) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to update kit');
  return res.json();
}

export async function deleteKit(id) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: { ...headers },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Failed to delete kit');
  return res.json();
}
