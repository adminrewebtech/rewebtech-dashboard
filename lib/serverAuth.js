import { serverApi } from './serverApi.js';

/** Session valid hai ya nahi — API hi authority hai, yeh app nahi. */
export async function getServerUser() {
  const data = await serverApi('/auth/me');
  return data?.user ?? null;
}
