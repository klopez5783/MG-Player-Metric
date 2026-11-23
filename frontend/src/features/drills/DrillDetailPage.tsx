import { useState } from "react";
import { Link, useParams } from "react-router";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import {
  useAssignedDrills,
  markAssignmentSubmitted,
} from "./hooks/useGetAssignedDrill";
import { useSignedVideoUrl } from "./hooks/useSignedVideoUrl";
import { submitDrill } from "../../api/backend";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../api/supabseClient";

export default function DrillDetailPage() {
  const { drillId } = useParams<{ drillId: string }>();
  const { drills, loading, error } = useAssignedDrills();
  // The route param is a string; assignment ids are numbers.
  const drill = drills.find((d) => d.id === Number(drillId));
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // After an upload on this page, drill.videoPath is still the old value, so
  // track the new path and an upload count to re-sign the video link.
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const video = useSignedVideoUrl(uploadedPath ?? drill?.videoPath, uploadCount);
  const isReviewed = drill?.status === "reviewed";
  const isSubmitted = submitted || drill?.status === "submitted";

  async function handleUpload() {
    if (!session || !drill || !videoFile) return;
    setUploading(true);
    setUploadError(null);

    // <player's user id>/<assignment id>.mp4 is the folder the Storage policy allows
    const path = `${session.user.id}/${drill.id}.mp4`;

    try {
      // 1. Send the file straight to Storage. upsert lets a re-upload replace it.
      const { error } = await supabase.storage
        .from("Drill_Videos")
        .upload(path, videoFile, { upsert: true, contentType: videoFile.type });
      if (error) throw error;

      // 2. Tell the backend where it went
      await submitDrill(session.access_token, drill.id, {
        videoPath: path,
        playerNote: null,
      });
      markAssignmentSubmitted(drill.id, path);
      setSubmitted(true);
      setUploadedPath(path);
      setUploadCount((n) => n + 1);
      setVideoFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/player/drills"
          className="text-sm font-medium text-ink-soft underline hover:text-ink"
        >
          ← Back to drills
        </Link>

        {loading ? (
          <p className="mt-6 text-sm text-ink-mute">Loading drill…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : !drill ? (
          <p className="mt-6 text-sm text-ink-soft">
            This drill couldn't be found.
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold text-ink">
              {drill.drillName}
            </h1>
            <p className="mt-1 text-sm text-ink-mute">
              {drill.dueDate
                ? `Due ${formatDate(drill.dueDate)}`
                : "No due date"}
              {drill.durationMinutes ? ` · ${drill.durationMinutes} min` : ""}
            </p>

            {drill.coachNote && (
              <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
                <h2 className="text-sm font-semibold text-ink">
                  Note from your coach
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                  {drill.coachNote}
                </p>
              </section>
            )}

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Instructions</h2>
              {drill.equipment && (
                <p className="mt-2 text-xs text-ink-mute">
                  Equipment: {drill.equipment}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                {drill.instructions ?? "—"}
              </p>
              {drill.demoVideoUrl && (
                <a
                  href={drill.demoVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Watch demo video ↗
                </a>
              )}
            </section>

            {/* The player's submitted video, with the coach's comment under it once reviewed. */}
            {(uploadedPath ?? drill.videoPath) && (
              <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
                <h2 className="text-sm font-semibold text-ink">Your video</h2>
                {video.url ? (
                  <video
                    src={video.url}
                    controls
                    playsInline
                    className="mt-4 aspect-video w-full rounded-lg bg-black"
                  />
                ) : (
                  <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-line bg-canvas">
                    <p className={`text-sm ${video.error ? "text-red-400" : "text-ink-mute"}`}>
                      {video.error ?? "Loading video…"}
                    </p>
                  </div>
                )}

                {isReviewed && (
                  <div className="mt-4 border-t border-line pt-4">
                    <h3 className="text-sm font-semibold text-ink">
                      Feedback from your coach
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
                      {drill.coachReviewComment ?? "Your coach reviewed this video."}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Upload controls. Hidden once reviewed: the backend won't accept a new video then. */}
            {!isReviewed && (
            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              {isSubmitted ? (
                <p className="text-sm text-green-400">
                  You have submitted your video. Your coach will review it soon.
                </p>
              ) : (
                <p className="text-sm text-ink-soft">
                  Submit a video of yourself doing this drill. Your coach will
                  review it and give you feedback.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-hover">
                  {isSubmitted ? "Replace video" : "Choose video"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  type="button"
                  disabled={!videoFile || uploading}
                  className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleUpload}
                >
                  {uploading ? "Uploading…" : "Upload video"}
                </button>
              </div>
              {uploadError && (
                <p className="mt-2 text-xs text-red-400">{uploadError}</p>
              )}
              {submitted && (
                <p className="mt-2 text-xs text-green-400">Video submitted!</p>
              )}
              {videoFile && (
                <p className="mt-2 text-xs text-ink-mute">{videoFile.name}</p>
              )}
            </section>
            )}
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

// "2026-11-20" -> "Nov 20, 2026". A date-only string is read as UTC by
// new Date(), which shows the previous day in US timezones, so build it from
// the parts in local time instead.
function formatDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
