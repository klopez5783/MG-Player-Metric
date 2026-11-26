-- Recalculate past evaluations now that V14 removed FK Acc. from Passing,
-- using the same formula as the evaluation form (StartEvaluationPage.tsx):
--   category rating = average of its sub-attribute ratings, 1 decimal
--   overall rating  = average of the category ratings except
--                     Psychological / Learning, 1 decimal
--
-- V14 already deleted the FK Acc. ratings, so the affected evaluations are
-- found by comparison instead: a Passing rating that no longer equals the
-- average of its remaining sub-attribute ratings must have included FK Acc.

-- 1. The Passing ratings that change, with their new value (NULL if FK Acc.
--    was the only one rated). Dropped when the migration commits.
CREATE TEMP TABLE recalculated_passing ON COMMIT DROP AS
SELECT ar.id, ar.evaluation_id, new_rating.rating
FROM attribute_ratings ar
JOIN attributes a ON a.id = ar.attribute_id AND a.name = 'Passing'
CROSS JOIN LATERAL (
    SELECT ROUND(AVG(r.rating), 1) AS rating
    FROM sub_attribute_ratings r
    WHERE r.attribute_rating_id = ar.id
) new_rating
WHERE ar.rating IS DISTINCT FROM new_rating.rating;

-- 2. Save the new Passing ratings.
UPDATE attribute_ratings ar
SET rating = rp.rating
FROM recalculated_passing rp
WHERE ar.id = rp.id;

-- 3. Recalculate the overall rating of those evaluations.
UPDATE evaluations e
SET overall_rating = (
    SELECT ROUND(AVG(ar.rating), 1)
    FROM attribute_ratings ar
    JOIN attributes a ON a.id = ar.attribute_id
    WHERE ar.evaluation_id = e.id
      AND a.name <> 'Psychological / Learning'
      AND ar.rating IS NOT NULL
)
WHERE e.id IN (SELECT evaluation_id FROM recalculated_passing);
