export function istrue(str: string | null): boolean {
  return str === 'true' || str === '1';
}

export async function fetchBody(sourceURL: string, options?: RequestInit) {
  const body = await (async () => {
    const res = await fetch(sourceURL, options);
    return res.text();
  })();
  return body;
}