const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type Role = 'coach' | 'player'

export interface SyncUserResponse {
  id: string
  email: string
  role: Role
}

export async function syncUser(accessToken: string, role: Role): Promise<SyncUserResponse> {
  const res = await fetch(`${API_URL}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ role }),
  })

  if (!res.ok) {
    throw new Error(`Profile sync failed (${res.status})`)
  }
  return res.json()
}
