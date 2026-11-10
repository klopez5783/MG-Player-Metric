-- Drill system, same pattern as evaluations: a drills catalog (defined once)
-- and drill_assignments (one row each time a coach gives a drill to a player).

-- The catalog. coach_id NULL = built-in drill shared by every coach;
-- otherwise a custom drill only that coach sees. Drills are archived rather
-- than deleted, so past assignments keep pointing at a real row.
CREATE TABLE drills (
    id SERIAL PRIMARY KEY,
    coach_id UUID REFERENCES coaches(id),
    name VARCHAR NOT NULL,
    description TEXT,
    instructions TEXT,
    duration_minutes INT,
    difficulty VARCHAR CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    equipment VARCHAR,
    demo_video_url VARCHAR,
    requires_video BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- Which sub-attributes a drill trains. Many-to-many: one drill can train
-- several sub-attributes, and one sub-attribute is trained by several drills.
CREATE TABLE drill_sub_attributes (
    drill_id INT NOT NULL REFERENCES drills(id),
    sub_attribute_id INT NOT NULL REFERENCES sub_attributes(id),
    PRIMARY KEY (drill_id, sub_attribute_id)
);

-- One drill given to one player. Moves through statuses over time:
-- assigned -> submitted (player completed it) -> reviewed (coach responded).
CREATE TABLE drill_assignments (
    id SERIAL PRIMARY KEY,
    drill_id INT NOT NULL REFERENCES drills(id),
    player_id UUID NOT NULL REFERENCES players(id),
    coach_id UUID NOT NULL REFERENCES coaches(id),
    due_date DATE,
    status VARCHAR NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'submitted', 'reviewed')),
    coach_note TEXT,
    assigned_at TIMESTAMP DEFAULT now(),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP
);
