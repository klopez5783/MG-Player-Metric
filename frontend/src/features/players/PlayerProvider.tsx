import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../api/supabseClient'
import { getAccountPlayers, type PlayerSummary } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { PlayerContext } from './PlayerContext'

const SELECTED_KEY = 'selectedPlayerId'

// Loads the players this login manages (one for a player, one per child for
// a parent) and tracks which one the player screens are showing. Coaches get
// an empty list and never fetch.
export default function PlayerProvider({ children }: { children: ReactNode }) {
  const { session, me, meLoading } = useAuth()
  const isPlayerAccount = me?.role === 'player'

  // Tagged with the user id, so a different login never sees the last
  // account's players (and nothing has to be reset on logout).
  const [result, setResult] = useState<{ userId: string; players: PlayerSummary[]; error: string | null } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(readSelectedId)

  useEffect(() => {
    if (!session || !isPlayerAccount) return
    const userId = session.user.id
    let cancelled = false

    getAccountPlayers(session.access_token)
      .then((players) => {
        if (!cancelled) setResult({ userId, players, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setResult({ userId, players: [], error: err instanceof Error ? err.message : 'Could not load your players.' })
      })

    return () => {
      cancelled = true
    }
  }, [session, isPlayerAccount])

  // Manual re-fetch. Reads the session from Supabase so it always uses the current token.
  const refreshPlayers = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    const userId = data.session.user.id
    try {
      setResult({ userId, players: await getAccountPlayers(data.session.access_token), error: null })
    } catch (err) {
      setResult({ userId, players: [], error: err instanceof Error ? err.message : 'Could not load your players.' })
    }
  }, [])

  const selectPlayer = useCallback((playerId: string) => {
    setSelectedId(playerId)
    try {
      localStorage.setItem(SELECTED_KEY, playerId)
    } catch {
      // Storage blocked (e.g. private mode): the choice just isn't remembered.
    }
  }, [])

  const current = result && result.userId === session?.user.id ? result : null
  const players = isPlayerAccount ? (current?.players ?? []) : []
  // The remembered player if it's on this account, otherwise the first one.
  const selectedPlayer = players.find((p) => p.id === selectedId) ?? players[0] ?? null
  const playersLoading = !!session && (meLoading || (isPlayerAccount && !current))
  const playersError = isPlayerAccount ? (current?.error ?? null) : null

  return (
    <PlayerContext.Provider
      value={{ players, selectedPlayer, playersLoading, playersError, selectPlayer, refreshPlayers }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

function readSelectedId(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY)
  } catch {
    return null
  }
}
