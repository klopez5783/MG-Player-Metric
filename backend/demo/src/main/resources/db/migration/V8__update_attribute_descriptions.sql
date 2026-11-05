-- Replaces the V7 descriptions with more detailed wording.

UPDATE attributes SET description = 'Acceleration, sprint speed and ability to change direction'
    WHERE name = 'Pace';

UPDATE attributes SET description = 'Shot power, accuracy, finishing and ability to score'
    WHERE name = 'Shooting';

UPDATE attributes SET description = 'Passing accuracy, vision, crossing and ball distribution'
    WHERE name = 'Passing';

UPDATE attributes SET description = 'Ball control, close control, agility and ability to beat opponents'
    WHERE name = 'Dribbling';

UPDATE attributes SET description = 'Tackling, marking, interceptions and defensive positioning'
    WHERE name = 'Defending';

UPDATE attributes SET description = 'Strength, endurance, balance and overall athletic ability'
    WHERE name = 'Physical';
