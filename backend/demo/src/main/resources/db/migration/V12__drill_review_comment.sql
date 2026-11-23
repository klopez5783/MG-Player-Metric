-- The coach's comment after reviewing a submitted video. Separate from
-- coach_note, which is the instruction written when the drill was assigned.
-- NULL until the coach reviews it.
ALTER TABLE drill_assignments
    ADD COLUMN coach_review_comment TEXT;
