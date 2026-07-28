export function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  let random = '';
  if (typeof window !== 'undefined' && window.crypto) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    random = arr[0].toString(36).toUpperCase();
  } else {
    random = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  return `${prefix}-${timestamp}-${random}`;
}

export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  const parts = dateStr.split('-').map(s => parseInt(s, 10));
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}
