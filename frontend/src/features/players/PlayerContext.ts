import { createContext } from 'react'
import type { PlayerSummary } from '../../api/backend'

export interface PlayerState {
  /** Every player this login manages. Empty for coaches. */
  players: PlayerSummary[]
  /** The player the screens are showing. Null until loaded, or with no players. */
  selectedPlayer: PlayerSummary | null
  playersLoading: boolean
  playersError: string | null
  /** Switch which player the screens show. Remembered across refreshes. */
  selectPlayer: (playerId: string) => void
  /** Re-fetch the list, e.g. after joining a coach, adding or renaming a player. */
  refreshPlayers: () => Promise<void>
}

export const PlayerContext = createContext<PlayerState>({
  players: [],
  selectedPlayer: null,
  playersLoading: false,
  playersError: null,
  selectPlayer: () => {},
  refreshPlayers: async () => {},
})
