CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    role VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE coaches (
    id UUID PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE players (
    id UUID PRIMARY KEY REFERENCES users(id),
    coach_id UUID NOT NULL REFERENCES coaches(id),
    date_of_birth DATE,
    position VARCHAR,
    team VARCHAR,
    current_overall_rating DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
