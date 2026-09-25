const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type Role = 'coach' | 'player'

export interface SyncUserResponse {
  id: string
  email: string
  role: Role
}

export interface MeResponse {
  id: string
  email: string
  name: string | null
  role: Role
  coachId: string | null
  coachName: string | null
}

export interface InviteCodeResponse {
  inviteCode: string
}

export async function syncUser(accessToken: string, role: Role, name?: string): Promise<SyncUserResponse> {
  const res = await fetch(`${API_URL}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ role, name }),
  })

  if (!res.ok) {
    throw new Error(`Profile sync failed (${res.status})`)
  }
  return res.json()
}

export async function getMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch user profile (${res.status})`)
  }
  return res.json()
}

export async function getInviteCode(accessToken: string): Promise<InviteCodeResponse> {
  const res = await fetch(`${API_URL}/coaches/me/invite-code`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch invite code (${res.status})`)
  }
  return res.json()
}

export async function joinCoachByCode(accessToken: string, code: string): Promise<void> {
  const res = await fetch(`${API_URL}/players/me/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ code }),
  })

  if (!res.ok) {
    throw new Error(`Failed to join coach (${res.status})`)
  }
}

export async function leaveCoach(accessToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/players/me/coach`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Failed to leave coach (${res.status})`)
}


export async function updateProfile(accessToken: string, name: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name }),
  })

  if (!res.ok) {
    throw new Error(`Failed to update profile (${res.status})`)
  }
  return res.json()
}
