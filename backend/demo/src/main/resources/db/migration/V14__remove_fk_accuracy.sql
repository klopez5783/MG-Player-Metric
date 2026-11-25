-- Remove "FK Acc." (free kick accuracy) from Passing. The evaluation form
-- builds itself from the catalog, so new evaluations average the remaining
-- five Passing sub-attributes with no code change.
--
-- Past evaluations that rated FK Acc. are recalculated without it, using
-- the same formula as the evaluation form (StartEvaluationPage.tsx):
--   category rating = average of its sub-attribute ratings, 1 decimal
--   overall rating  = average of the category ratings except
--                     Psychological / Learning, 1 decimal

-- 1. Remember which Passing ratings included FK Acc., so only those
--    evaluations are recalculated. Dropped when the migration commits.
CREATE TEMP TABLE affected_attribute_ratings ON COMMIT DROP AS
SELECT DISTINCT r.attribute_rating_id AS id
FROM sub_attribute_ratings r
JOIN sub_attributes s ON s.id = r.sub_attribute_id
JOIN attributes a ON a.id = s.attribute_id
WHERE a.name = 'Passing' AND s.name = 'FK Acc.';

-- 2. Rows that reference it go first, or the foreign keys block the delete.
DELETE FROM sub_attribute_ratings
WHERE sub_attribute_id IN (
    SELECT s.id FROM sub_attributes s
    JOIN attributes a ON a.id = s.attribute_id
    WHERE a.name = 'Passing' AND s.name = 'FK Acc.'
);

DELETE FROM drill_sub_attributes
WHERE sub_attribute_id IN (
    SELECT s.id FROM sub_attributes s
    JOIN attributes a ON a.id = s.attribute_id
    WHERE a.name = 'Passing' AND s.name = 'FK Acc.'
);

DELETE FROM sub_attributes
WHERE name = 'FK Acc.'
  AND attribute_id = (SELECT id FROM attributes WHERE name = 'Passing');

-- 3. Close the gap it left: Short Pass, Long Pass and Curve move up from 4-6 to 3-5.
UPDATE sub_attributes
SET display_order = display_order - 1
WHERE attribute_id = (SELECT id FROM attributes WHERE name = 'Passing')
  AND display_order > 3;

-- 4. Recalculate Passing from the sub-attribute ratings that are left.
--    NULL if FK Acc. was the only one rated.
UPDATE attribute_ratings ar
SET rating = (
    SELECT ROUND(AVG(r.rating), 1)
    FROM sub_attribute_ratings r
    WHERE r.attribute_rating_id = ar.id
)
WHERE ar.id IN (SELECT id FROM affected_attribute_ratings);

-- 5. Recalculate the overall rating of those evaluations.
UPDATE evaluations e
SET overall_rating = (
    SELECT ROUND(AVG(ar.rating), 1)
    FROM attribute_ratings ar
    JOIN attributes a ON a.id = ar.attribute_id
    WHERE ar.evaluation_id = e.id
      AND a.name <> 'Psychological / Learning'
      AND ar.rating IS NOT NULL
)
WHERE e.id IN (
    SELECT ar.evaluation_id
    FROM attribute_ratings ar
    WHERE ar.id IN (SELECT id FROM affected_attribute_ratings)
);
