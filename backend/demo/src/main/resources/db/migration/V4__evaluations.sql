-- Player evaluation system: attributes/sub-attributes catalog, plus the
-- evaluations and ratings tables that hold what a coach actually enters.

CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    display_order INT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE sub_attributes (
    id SERIAL PRIMARY KEY,
    attribute_id INT NOT NULL REFERENCES attributes(id),
    name VARCHAR NOT NULL,
    description TEXT,
    display_order INT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    -- player_id/coach_id are UUID, not int as drafted: players.id and
    -- coaches.id are UUID (they're Supabase auth user ids), and a foreign
    -- key column has to match the type of the column it references.
    player_id UUID NOT NULL REFERENCES players(id),
    coach_id UUID NOT NULL REFERENCES coaches(id),
    evaluation_type VARCHAR,
    evaluation_date TIMESTAMP,
    overall_rating DECIMAL(4,2),
    strengths TEXT,
    weaknesses TEXT,
    general_comment TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE attribute_ratings (
    id SERIAL PRIMARY KEY,
    evaluation_id INT NOT NULL REFERENCES evaluations(id),
    attribute_id INT NOT NULL REFERENCES attributes(id),
    rating DECIMAL(3,1),
    comment TEXT,
    UNIQUE (evaluation_id, attribute_id)
);

CREATE TABLE sub_attribute_ratings (
    id SERIAL PRIMARY KEY,
    attribute_rating_id INT NOT NULL REFERENCES attribute_ratings(id),
    sub_attribute_id INT NOT NULL REFERENCES sub_attributes(id),
    rating DECIMAL(3,1),
    comment TEXT,
    UNIQUE (attribute_rating_id, sub_attribute_id)
);
