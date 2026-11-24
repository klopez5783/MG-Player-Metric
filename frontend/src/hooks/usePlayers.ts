import { useContext } from 'react'
import { PlayerContext } from '../features/players/PlayerContext'

export function usePlayers() {
  return useContext(PlayerContext)
}
