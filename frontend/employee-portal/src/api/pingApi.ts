const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function pingApi(): Promise<string> {
  const res = await fetch(API_BASE_URL);

  if (!res.ok) {
    throw new Error(`後端回應錯誤，status = ${res.status}`);
  }

  return res.text();
}