-- Remove "FK Acc." (free kick accuracy) from Passing. The evaluation form
-- builds itself from the catalog, so Passing becomes the average of the
-- remaining five sub-attributes with no code change.
--
-- Past evaluations lose their FK Acc. rating rows, but keep the Passing and
-- overall ratings they were saved with (those are stored, not recalculated).

-- Rows that reference it go first, or the foreign keys block the delete.
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

-- Close the gap it left: Short Pass, Long Pass and Curve move up from 4-6 to 3-5.
UPDATE sub_attributes
SET display_order = display_order - 1
WHERE attribute_id = (SELECT id FROM attributes WHERE name = 'Passing')
  AND display_order > 3;
