import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  getAssignedDrills,
  type AssignedDrillResponse,
} from "../../../api/backend";

let cache: { userId: string; drills: AssignedDrillResponse[] } | null = null;

export function useAssignedDrills() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const cached = cache && cache.userId === userId ? cache : null;

  const [drills, setDrills] = useState<AssignedDrillResponse[]>(
    cached?.drills ?? [],
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    getAssignedDrills(session.access_token)
      .then((data) => {
        cache = { userId: session.user.id, drills: data };
        if (!cancelled) setDrills(data);
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached library.
        const hasCached = cache?.userId === session.user.id;
        if (!cancelled && !hasCached) {
          setError(
            err instanceof Error ? err.message : "Could not load drills.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

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
