import { API_BASE_URL } from "./config";

export async function pingApi(): Promise<string> {
  const res = await fetch(API_BASE_URL);

  if (!res.ok) {
    throw new Error(`後端回應錯誤，status = ${res.status}`);
  }

  return res.text();
}