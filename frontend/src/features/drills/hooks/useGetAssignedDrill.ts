import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { usePlayers } from "../../../hooks/usePlayers";
import {
  getAssignedDrills,
  type AssignedDrillResponse,
} from "../../../api/backend";

// Tagged with the player id, so switching players never shows the last
// player's drills.
let cache: { playerId: string; drills: AssignedDrillResponse[] } | null = null;

// The selected player's assigned drills. Shows the cached copy straight away
// and quietly refetches in the background.
export function useAssignedDrills() {
  const { session } = useAuth();
  const { selectedPlayer, playersLoading } = usePlayers();
  const playerId = selectedPlayer?.id;

  // Each result remembers which player it was fetched for, so a stale one
  // from the previous player is ignored instead of being reset in the effect.
  const [result, setResult] = useState<{
    playerId: string;
    drills: AssignedDrillResponse[] | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!session || !playerId) return;
    let cancelled = false;

    getAssignedDrills(session.access_token, playerId)
      .then((data) => {
        cache = { playerId, drills: data };
        if (!cancelled) setResult({ playerId, drills: data, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setResult({
            playerId,
            drills: null,
            error: err instanceof Error ? err.message : "Could not load drills.",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [session, playerId]);

  const current = result && result.playerId === playerId ? result : null;
  const cached = cache && cache.playerId === playerId ? cache.drills : null;
  const drills = current?.drills ?? cached ?? [];
  const loading = playersLoading || (!!playerId && !current && !cached);
  // A failed background refresh keeps showing the cached drills.
  const error = current?.error && !cached ? current.error : null;

  return { drills, loading, error };
}

// Called after a successful submit, so the next page to read the cache
// shows "Submitted" (and the video) straight away instead of the stale "To do".
export function markAssignmentSubmitted(assignmentId: number, videoPath: string) {
  if (!cache) return;
  cache = {
    ...cache,
    drills: cache.drills.map((d) =>
      d.id === assignmentId ? { ...d, status: "submitted" as const, videoPath } : d,
    ),
  };
}
