const {
    pool
} = require(
    "../database/db"
);

const {
    isOwner
} = require(
    "../utils/permissions"
);

async function
    getSharedFiles(
        req,
        res
    ) {

    try {

        const {
            userId
        } = req.params;

        console.log(
            "Get shared files for user:",
            userId
        );

        const result =
            await pool.query(
                `
                SELECT

    s.id
        AS share_id,

    s.permission,

    s.encrypted_file_key,

    s.encrypted_file_key_iv,

    f.id,
    f.name,
    f.storage_key,
    f.size,
    f.mime_type,
    f.folder_id,
    f.created_at,
    f.updated_at,

    f.is_encrypted,
    f.algorithm,
    f.encryption_iv,
    f.encryption_version,
    f.sha256_fingerprint,

    u.username
        AS owner

FROM shares s

JOIN files f
    ON f.id =
    s.file_id

JOIN users u
    ON u.id =
    f.owner_id

WHERE

    s.shared_with_user_id
    = $1

    AND s.status
    = 'accepted'

ORDER BY
    f.updated_at DESC
                `,
                [userId]
            );

        return res
            .status(200)
            .json(
                result.rows
            );

    } catch (error) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

async function
    getPendingShares(
        req,
        res
    ) {

    try {

        const {
            userId
        } = req.params;

        const result =
            await pool.query(
                `
                SELECT

                    shares.id,
                    shares.permission,
                    shares.status,
                    shares.pending_file_key,
                    shares.created_at,

                    files.id
                        AS file_id,

                    files.name,
                    files.size,
                    files.mime_type,
                    files.is_encrypted,
                    files.algorithm,
                    files.encryption_iv,
                    files.encryption_version,
                    files.encrypted_file_key,
                    files.encrypted_file_key_iv,

                    users.username
                        AS shared_by

                FROM shares

                INNER JOIN files
                    ON files.id
                    =
                    shares.file_id

                INNER JOIN users
                    ON users.id
                    =
                    files.owner_id

                WHERE

                    shares.shared_with_user_id
                    = $1

                    AND shares.status
                    = 'pending'

                ORDER BY
                    shares.created_at DESC
                `,
                [
                    userId
                ]
            );

        return res.json(
            result.rows
        );

    } catch (
    error
    ) {

        console.error(
            "Pending shares error:",
            error
        );

        return res
            .status(500)
            .json({

                error:
                    "Server error"
            });
    }
}

async function
    acceptShare(
        req,
        res
    ) {

    try {

        const {
            shareId
        } = req.params;

        const {

            encrypted_file_key,

            encrypted_file_key_iv

        } = req.body;

        const result =
            await pool.query(
                `
                UPDATE shares
                SET

                    status
                    = 'accepted',

                    encrypted_file_key
                    = $1,

                    encrypted_file_key_iv
                    = $2,

                    pending_file_key
                    = NULL,

                    accepted_at
                    = NOW()

                WHERE id = $3

                RETURNING *
                `,
                [

                    encrypted_file_key,

                    encrypted_file_key_iv,

                    shareId
                ]
            );

        if (
            result.rows
                .length
            === 0
        ) {

            return res
                .status(404)
                .json({

                    error:
                        "Share non trovata"
                });
        }

        return res
            .json({

                message:
                    "Share accepted",

                share:
                    result.rows[0]
            });

    } catch (
    error
    ) {

        console.error(
            "Accept share error:",
            error
        );

        return res
            .status(500)
            .json({

                error:
                    "Server error"
            });
    }
}

async function
    shareFile(
        req,
        res
    ) {

    try {

        const {

            file_id,

            username,

            permission,

            userId,

            pending_file_key

        } = req.body;

        if (
            !file_id
            ||
            !username
            ||
            !permission
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing fields"
                });
        }

        const owner =
            await isOwner(
                userId,
                file_id
            );

        if (
            !owner
        ) {

            return res
                .status(403)
                .json({
                    error:
                        "Solo il proprietario può condividere"
                });
        }

        const fileResult =
            await pool.query(
                `
        SELECT

    owner_id,

    is_encrypted,

    encryption_version

FROM files
WHERE id = $1
        `,
                [file_id]
            );

        if (
            fileResult
                .rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "File not found"
                });
        }

        const userResult =
            await pool.query(
                `
        SELECT
            id
        FROM users
        WHERE LOWER(
            username
        )
        =
        LOWER($1)
        `,
                [username]
            );

        if (
            userResult
                .rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "Utente non trovato"
                });
        }

        const
            shared_with_user_id =
                userResult
                    .rows[0]
                    .id;

        if (
            fileResult
                .rows[0]
                .owner_id
            ===
            shared_with_user_id
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Non puoi condividere un file con te stesso"
                });
        }

        const existingShare =
            await pool.query(
                `
                SELECT *
                FROM shares
                WHERE
                    file_id = $1
                    AND
                    shared_with_user_id = $2
                `,
                [
                    file_id,
                    shared_with_user_id
                ]
            );

        if (
            existingShare
                .rows
                .length > 0
        ) {

            return res
                .status(409)
                .json({
                    error:
                        "File già condiviso con questo utente"
                });
        }

        const file =
            fileResult
                .rows[0];

        const shareStatus =

            file
                .is_encrypted

                &&

                file
                    .encryption_version
                >= 2

                ? "pending"

                : "accepted";

        const result =
            await pool.query(
                `
                INSERT INTO shares
(
    file_id,
    shared_with_user_id,
    permission,
    pending_file_key,
    status,
    accepted_at
)
VALUES
(
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
)
RETURNING *
                `,
                [
                    file_id,
                    shared_with_user_id,
                    permission,
                    pending_file_key,
                    shareStatus,

                    shareStatus

                        === "accepted"

                        ? new Date()

                        : null
                ]
            );

        return res
            .status(201)
            .json(
                result.rows[0]
            );

    } catch (
    error
    ) {

        console.error(
            error
        );

        if (
            error.code
            ===
            "23505"
        ) {

            return res
                .status(409)
                .json({
                    error:
                        "File già condiviso con questo utente"
                });
        }

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

async function
    getFileShares(
        req,
        res
    ) {

    try {

        const {
            fileId
        } = req.params;

        const result =
            await pool.query(
                `
                SELECT

                    s.id
                        AS share_id,

                    u.username,

                    s.permission

                FROM shares s

                JOIN users u
                    ON u.id =
                    s.shared_with_user_id

                WHERE
                    s.file_id
                    = $1

                ORDER BY
                    u.username ASC
                `,
                [fileId]
            );

        return res
            .status(200)
            .json(
                result.rows
            );

    } catch (
    error
    ) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

async function
    revokeShare(
        req,
        res
    ) {

    try {

        const {
            shareId
        } = req.params;

        const result =
            await pool.query(
                `
                DELETE
                FROM shares
                WHERE id = $1
                RETURNING *
                `,
                [shareId]
            );

        if (
            result.rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "Condivisione non trovata"
                });
        }

        return res
            .status(200)
            .json({
                message:
                    "Accesso revocato"
            });

    } catch (
    error
    ) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

async function
    updateSharePermission(
        req,
        res
    ) {

    try {

        const {
            shareId
        } = req.params;

        const {
            permission
        } = req.body;

        if (
            permission
            !== "read"
            &&
            permission
            !== "write"
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Permesso non valido"
                });
        }

        const result =
            await pool.query(
                `
                UPDATE shares
                SET permission = $1
                WHERE id = $2
                RETURNING *
                `,
                [
                    permission,
                    shareId
                ]
            );

        if (
            result.rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "Condivisione non trovata"
                });
        }

        return res
            .status(200)
            .json(
                result.rows[0]
            );

    } catch (
    error
    ) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

async function
    removeSharedFile(
        req,
        res
    ) {

    try {

        const {
            fileId,
            userId
        } = req.params;

        const result =
            await pool.query(
                `
                DELETE
                FROM shares
                WHERE
                    file_id = $1
                    AND
                    shared_with_user_id = $2
                RETURNING *
                `,
                [
                    fileId,
                    userId
                ]
            );

        if (
            result.rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "Condivisione non trovata"
                });
        }

        return res
            .status(200)
            .json({
                message:
                    "File rimosso dai condivisi"
            });

    } catch (
    error
    ) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

module.exports = {
    getSharedFiles,
    shareFile,
    getFileShares,
    revokeShare,
    updateSharePermission,
    removeSharedFile,
    getPendingShares,
    acceptShare
};