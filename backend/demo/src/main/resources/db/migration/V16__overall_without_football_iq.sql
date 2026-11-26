-- Football IQ is now rated on its own, like Psychological / Learning, so the
-- overall rating averages only the player-card skills (Pace, Shooting,
-- Passing, Dribbling, Defending, Physical). Recalculate every past evaluation
-- with the evaluation form's new formula (StartEvaluationPage.tsx):
--   overall rating = average of the category ratings except Football IQ and
--                    Psychological / Learning, 1 decimal
--
-- The Football IQ rating itself is already saved as that category's row in
-- attribute_ratings, so it needs no new column.

UPDATE evaluations e
SET overall_rating = (
    SELECT ROUND(AVG(ar.rating), 1)
    FROM attribute_ratings ar
    JOIN attributes a ON a.id = ar.attribute_id
    WHERE ar.evaluation_id = e.id
      AND a.name NOT IN ('Football IQ', 'Psychological / Learning')
      AND ar.rating IS NOT NULL
);
