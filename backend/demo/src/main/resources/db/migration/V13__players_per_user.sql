-- One login (users row) can now manage several players, e.g. a parent with
-- more than one child. players.id stops being the user's id and gets its own;
-- players.user_id points at the account that manages the player.

-- 1. The managing account. Existing players manage themselves, so user_id
--    starts out equal to their id.
ALTER TABLE players ADD COLUMN user_id UUID REFERENCES users(id);
UPDATE players SET user_id = id;
ALTER TABLE players ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX players_user_id_idx ON players(user_id);

-- 2. The player's own name. Until now it came from users.name, which is the
--    parent's name once a parent manages the player. Nullable like users.name.
ALTER TABLE players ADD COLUMN name VARCHAR;
UPDATE players p SET name = u.name FROM users u WHERE u.id = p.id;

-- 3. Unlink players.id from users.id. It stays the primary key, so existing
--    evaluations, drill assignments and video paths still point at the same
--    player. New players get a fresh id.
ALTER TABLE players DROP CONSTRAINT players_id_fkey;
ALTER TABLE players ALTER COLUMN id SET DEFAULT gen_random_uuid();
