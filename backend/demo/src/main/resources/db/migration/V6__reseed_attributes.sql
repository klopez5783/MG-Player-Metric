-- V5 seeded the attribute catalog, but the rows are no longer present in the
-- database (removed outside of Flyway, which only tracks schema history and
-- has no way to notice or repair data that was deleted after the fact).
-- Re-seed here, guarded so this is a no-op if the catalog already has rows.

INSERT INTO attributes (name, description, display_order)
SELECT * FROM (VALUES
    ('Football IQ', 'Awareness, positioning and tactical decisions', 1),
    ('Psychological / Learning', 'Mindset, behavior and learning capacity', 2),
    ('Pace', NULL, 3),
    ('Shooting', NULL, 4),
    ('Passing', NULL, 5),
    ('Dribbling', NULL, 6),
    ('Defending', NULL, 7),
    ('Physical', NULL, 8)
) AS seed(name, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM attributes);

INSERT INTO sub_attributes (attribute_id, name, display_order)
SELECT * FROM (VALUES
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Awareness', 1),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Decision Making', 2),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Positioning', 3),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Spatial Awareness', 4),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Anticipation', 5),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Movement Off Ball', 6),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Combination Play', 7),
    ((SELECT id FROM attributes WHERE name = 'Football IQ'), 'Transition Awareness', 8),

    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Coachability', 1),
    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Response to Mistakes', 2),
    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Concentration', 3),
    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Work Rate', 4),
    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Resilience', 5),
    ((SELECT id FROM attributes WHERE name = 'Psychological / Learning'), 'Communication', 6),

    ((SELECT id FROM attributes WHERE name = 'Pace'), 'Acceleration', 1),
    ((SELECT id FROM attributes WHERE name = 'Pace'), 'Sprint Speed', 2),

    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Att. Position', 1),
    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Finishing', 2),
    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Shot Power', 3),
    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Long Shots', 4),
    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Volleys', 5),
    ((SELECT id FROM attributes WHERE name = 'Shooting'), 'Penalties', 6),

    ((SELECT id FROM attributes WHERE name = 'Passing'), 'Vision', 1),
    ((SELECT id FROM attributes WHERE name = 'Passing'), 'Crossing', 2),
    ((SELECT id FROM attributes WHERE name = 'Passing'), 'FK Acc.', 3),
    ((SELECT id FROM attributes WHERE name = 'Passing'), 'Short Pass', 4),
    ((SELECT id FROM attributes WHERE name = 'Passing'), 'Long Pass', 5),
    ((SELECT id FROM attributes WHERE name = 'Passing'), 'Curve', 6),

    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Agility', 1),
    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Balance', 2),
    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Reactions', 3),
    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Ball Control', 4),
    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Dribbling', 5),
    ((SELECT id FROM attributes WHERE name = 'Dribbling'), 'Composure', 6),

    ((SELECT id FROM attributes WHERE name = 'Defending'), 'Interceptions', 1),
    ((SELECT id FROM attributes WHERE name = 'Defending'), 'Heading Acc.', 2),
    ((SELECT id FROM attributes WHERE name = 'Defending'), 'Def. Aware', 3),
    ((SELECT id FROM attributes WHERE name = 'Defending'), 'Stand Tackle', 4),
    ((SELECT id FROM attributes WHERE name = 'Defending'), 'Slide Tackle', 5),

    ((SELECT id FROM attributes WHERE name = 'Physical'), 'Jumping', 1),
    ((SELECT id FROM attributes WHERE name = 'Physical'), 'Stamina', 2),
    ((SELECT id FROM attributes WHERE name = 'Physical'), 'Strength', 3),
    ((SELECT id FROM attributes WHERE name = 'Physical'), 'Aggression', 4)
) AS seed(attribute_id, name, display_order)
WHERE NOT EXISTS (SELECT 1 FROM sub_attributes);
