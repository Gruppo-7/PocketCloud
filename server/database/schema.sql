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
    DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FOLDERS
-- =========================

CREATE TABLE IF NOT EXISTS folders (

    id SERIAL PRIMARY KEY,

    owner_id INTEGER
        NOT NULL,

    name VARCHAR(255)
        NOT NULL,

    parent_folder_id INTEGER,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_folder_owner
        FOREIGN KEY (
            owner_id
        )
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_parent_folder
        FOREIGN KEY (
            parent_folder_id
        )
        REFERENCES folders(id)
        ON DELETE CASCADE
);

-- =========================
-- FILES
-- =========================

CREATE TABLE IF NOT EXISTS files (

    id SERIAL PRIMARY KEY,

    owner_id INTEGER
        NOT NULL,

    folder_id INTEGER,

    name VARCHAR(255)
        NOT NULL,

    storage_key TEXT
        NOT NULL
        UNIQUE,

    size BIGINT
        NOT NULL,

    mime_type VARCHAR(100),

    sha256_fingerprint TEXT,

    encryption_iv TEXT,

    encryption_version INTEGER
    DEFAULT 1,

    encrypted_file_key TEXT,

    algorithm VARCHAR(50),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file_owner
        FOREIGN KEY (
            owner_id
        )
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_file_folder
        FOREIGN KEY (
            folder_id
        )
        REFERENCES folders(id)
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
        FOREIGN KEY (
            file_id
        )
        REFERENCES files(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shared_user
        FOREIGN KEY (
            shared_with_user_id
        )
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_file_share
        UNIQUE (
            file_id,
            shared_with_user_id
        )
);