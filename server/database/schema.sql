-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100)
        NOT NULL,

    last_name VARCHAR(100)
        NOT NULL,

    username VARCHAR(50)
    UNIQUE NOT NULL,

    email VARCHAR(255)
        UNIQUE NOT NULL,

    password_hash TEXT
        NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FILES
-- =========================

CREATE TABLE IF NOT EXISTS files (

    id SERIAL PRIMARY KEY,

    owner_id INTEGER
        NOT NULL,

    name VARCHAR(255)
        NOT NULL,

    path TEXT
        NOT NULL,

    size BIGINT
        DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    modified_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- SHARES
-- =========================

CREATE TABLE IF NOT EXISTS shares (

    id SERIAL PRIMARY KEY,

    file_id INTEGER
        NOT NULL,

    shared_with_user_id INTEGER
        NOT NULL,

    permission VARCHAR(20)
        NOT NULL
        CHECK (
            permission IN (
                'read',
                'write'
            )
        ),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file
        FOREIGN KEY (file_id)
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shared_user
        FOREIGN KEY (
            shared_with_user_id
        )
        REFERENCES users(id)
        ON DELETE CASCADE
);