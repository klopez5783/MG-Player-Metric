-- A player's video submission for an assignment. The file itself lives in
-- the Drill_Videos Storage bucket; video_path is its location there
-- ("<user id>/<assignment id>.mp4"). Both stay NULL until the player submits.
ALTER TABLE drill_assignments
    ADD COLUMN video_path VARCHAR,
    ADD COLUMN player_note TEXT;
