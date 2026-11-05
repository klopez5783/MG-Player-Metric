-- The player-card attributes were seeded without descriptions. Matched by
-- name so this works regardless of which ids the rows ended up with.

UPDATE attributes SET description = 'Speed off the mark and over distance'
    WHERE name = 'Pace';

UPDATE attributes SET description = 'Finishing, shot power and accuracy in front of goal'
    WHERE name = 'Shooting';

UPDATE attributes SET description = 'Vision, range and accuracy when moving the ball'
    WHERE name = 'Passing';

UPDATE attributes SET description = 'Close control, balance and agility with the ball'
    WHERE name = 'Dribbling';

UPDATE attributes SET description = 'Reading the game, tackling and winning the ball back'
    WHERE name = 'Defending';

UPDATE attributes SET description = 'Strength, stamina and aerial ability'
    WHERE name = 'Physical';
