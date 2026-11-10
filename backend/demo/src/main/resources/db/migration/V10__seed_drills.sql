-- Seeds the built-in drill library (coach_id NULL = visible to every coach)
-- and links each drill to the sub-attributes it trains. Sub-attribute ids
-- were checked against the live database (sub_attributes 1-43, V5/V6 order).

INSERT INTO drills (name, description, instructions, duration_minutes, difficulty, equipment, demo_video_url, requires_video) VALUES
    ('4v2 Rondo',
     'Keep-away in a small grid that trains scanning, quick passing and reading the defender.',
     E'1. Set up a 10x10m grid with four players on the outside and two defenders inside.\n2. The outside players keep the ball using two touches maximum.\n3. Before the ball arrives, scan over your shoulder to check where the defenders are.\n4. Pass away from the defender''s body shape and move to create a passing angle after every pass.\n5. If a defender wins the ball or it leaves the grid, the player who lost it swaps in.\n6. Play 5 rounds of 2 minutes with 30 seconds rest.',
     15, 'beginner', 'Ball, 4 cones, 6 players', 'https://www.youtube.com/watch?v=moLy3vQ1q_E', false),

    ('Acceleration Sprints (10-20-30m)',
     'Repeated sprints over three distances to build a faster first step and top speed.',
     E'1. Place cones at 0m, 10m, 20m and 30m in a straight line.\n2. Start from a standing position with a low body angle and drive your arms.\n3. Sprint to the 10m cone and walk back for full recovery, then repeat to 20m, then 30m.\n4. Focus on powerful first three steps and staying tall once you reach top speed.\n5. Complete 2 rounds of all three distances (6 sprints total).\n6. Film one sprint from the side so your coach can check your posture.',
     20, 'intermediate', '4 cones, open flat space', 'https://www.youtube.com/watch?v=9FLbl9uVGXw', true),

    ('Reaction Start Gates',
     'React to a random cue and sprint to the right gate, training reactions and quick starts.',
     E'1. Set up three colored gates 10m in front of the start line.\n2. A partner stands behind you and calls or shows a color at random.\n3. Sprint through the matching gate as fast as you can, then jog back.\n4. Do not guess early. Wait for the cue, then explode.\n5. Complete 3 sets of 6 reps with 45 seconds rest between sets.',
     15, 'beginner', '6 cones in 3 colors, partner', 'https://www.youtube.com/watch?v=c2tj08jYCPA', false),

    ('Interception Gates',
     'A defender reads the passing lanes between attackers to win the ball.',
     E'1. Mark a 15x15m box with three small gates inside it.\n2. Three attackers pass the ball through the gates while one defender tries to cut off the lanes.\n3. The defender earns a point for each interception or deflection.\n4. Stay between the ball and the next likely receiver, and read the passer''s body and eyes.\n5. Rotate the defender every 90 seconds and play 6 rounds.',
     20, 'intermediate', 'Ball, 8 cones, 4 players', 'https://www.youtube.com/watch?v=0OEsOFkQloA', false),

    ('1v1 Jockeying Channel',
     'Practice patient 1v1 defending by delaying the attacker and forcing them wide.',
     E'1. Mark a 10x20m channel with a small goal or end line at each end.\n2. The attacker starts with the ball and tries to dribble through to the end line.\n3. The defender stays low, side-on and on the balls of the feet, backing up while keeping distance.\n4. Force the attacker toward the sideline and only tackle when the touch gets heavy.\n5. Complete 8 reps each as attacker and defender.\n6. Film a few reps so your coach can check your stance and patience.',
     15, 'intermediate', 'Ball, 4 cones, partner', 'https://www.youtube.com/watch?v=hgrStIbFls0', true),

    ('Third-Man Combination Runs',
     'A wall pass followed by a run from a third player into the space the pass opened.',
     E'1. Set up three players in a triangle with about 15m between them.\n2. Player A passes to player B, who plays a one-touch pass to a run by player C into open space.\n3. After passing, always move. Player A runs into the space player C left.\n4. Rotate roles after every sequence so every player works on each position.\n5. Complete 10 minutes of the pattern, then add one defender for the last 5 minutes.',
     20, 'intermediate', 'Ball, 6 cones, 3 players', 'https://www.youtube.com/watch?v=YXuvpSjVnTo', false),

    ('Scan & Call Grid',
     'Dribble inside a grid while checking your shoulders and calling out what you see.',
     E'1. Mark a 15x15m grid and dribble inside it at a comfortable pace.\n2. A partner stands outside and holds up a number or color without you seeing it first.\n3. Before every few touches, check over your shoulder and call out the number or color.\n4. Keep your head up and avoid looking only at the ball.\n5. Play 6 rounds of 90 seconds. Increase the pace once you stay accurate.',
     15, 'beginner', 'Ball, 4 cones, partner, colored bibs or number cards', 'https://www.youtube.com/watch?v=hPtbGTNoCyI', false),

    ('Crossing & Finishing Circuit',
     'Deliver a cross from the wing, then make a timed run to finish the next one.',
     E'1. Set up a goal with a crossing zone on each wing and a server at each side.\n2. Cross the ball from the wing into the box for a teammate, then jog to the edge of the box.\n3. Time your run to attack the near post or the far post as the next cross arrives.\n4. Finish with a header or a first-time shot.\n5. Switch wings and complete 12 crosses and 12 finishes.\n6. Film a few runs so your coach can check your timing.',
     25, 'intermediate', 'Ball, goal, 4 cones, 2 servers', 'https://www.youtube.com/watch?v=exC5UM0AKpw', true),

    ('Long-Range Power Shooting',
     'Strike from 20-25m with a firm plant foot and full follow-through to build power.',
     E'1. Place a ball on the edge of the 25m line facing the goal.\n2. Plant your non-kicking foot beside the ball and point it at the target.\n3. Strike through the center of the ball with your laces, locking your ankle.\n4. Follow through with your kicking leg and land on it.\n5. Take 10 shots from the center, 10 from the left and 10 from the right.\n6. Film side-on from your kicking foot so your coach can check technique.',
     20, 'intermediate', 'Ball (multiple if possible), goal, cones', 'https://www.youtube.com/watch?v=U3RVQt9MW5k', true),

    ('Change-the-Rules Small-Sided Game',
     'A 4v4 where the coach changes the constraints mid-game to train focus and adaptability.',
     E'1. Play 4v4 in a 30x20m area with two small goals.\n2. Every 3 minutes the coach changes a rule, such as a two-touch limit, scoring only from the far half, or a point for 5 passes.\n3. Adapt quickly, communicate with teammates and stay focused after mistakes or conceded goals.\n4. After each round, tell your coach one thing you adjusted.\n5. Play 6 rounds of 3 minutes with 1 minute rest.',
     25, 'advanced', 'Ball, 4 cones, 2 small goals, 8 players, bibs', 'https://www.youtube.com/watch?v=CzlZgdRrYhg', false);

-- Which sub-attributes each drill trains. Drill ids come from the rows above
-- (looked up by name), sub-attribute ids are the real ones.
INSERT INTO drill_sub_attributes (drill_id, sub_attribute_id)
SELECT d.id, link.sub_attribute_id
FROM (VALUES
    ('4v2 Rondo', 7),                          -- Combination Play
    ('4v2 Rondo', 5),                          -- Anticipation
    ('4v2 Rondo', 23),                         -- Vision
    ('Acceleration Sprints (10-20-30m)', 15),  -- Acceleration
    ('Acceleration Sprints (10-20-30m)', 16),  -- Sprint Speed
    ('Reaction Start Gates', 15),              -- Acceleration
    ('Reaction Start Gates', 31),              -- Reactions
    ('Reaction Start Gates', 5),               -- Anticipation
    ('Interception Gates', 35),                -- Interceptions
    ('Interception Gates', 5),                 -- Anticipation
    ('Interception Gates', 37),                -- Def. Aware
    ('1v1 Jockeying Channel', 38),             -- Stand Tackle
    ('1v1 Jockeying Channel', 37),             -- Def. Aware
    ('1v1 Jockeying Channel', 30),             -- Balance
    ('Third-Man Combination Runs', 7),         -- Combination Play
    ('Third-Man Combination Runs', 6),         -- Movement Off Ball
    ('Third-Man Combination Runs', 4),         -- Spatial Awareness
    ('Scan & Call Grid', 1),                   -- Awareness
    ('Scan & Call Grid', 4),                   -- Spatial Awareness
    ('Scan & Call Grid', 23),                  -- Vision
    ('Scan & Call Grid', 11),                  -- Concentration
    ('Crossing & Finishing Circuit', 24),      -- Crossing
    ('Crossing & Finishing Circuit', 17),      -- Att. Position
    ('Crossing & Finishing Circuit', 36),      -- Heading Acc.
    ('Long-Range Power Shooting', 19),         -- Shot Power
    ('Long-Range Power Shooting', 20),         -- Long Shots
    ('Change-the-Rules Small-Sided Game', 9),  -- Coachability
    ('Change-the-Rules Small-Sided Game', 11), -- Concentration
    ('Change-the-Rules Small-Sided Game', 13)  -- Resilience
) AS link(drill_name, sub_attribute_id)
JOIN drills d ON d.name = link.drill_name AND d.coach_id IS NULL;
