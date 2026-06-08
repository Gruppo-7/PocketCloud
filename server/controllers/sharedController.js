const {
    pool
} = require(
    "../database/db"
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
    s.id AS share_id,

    f.id,
    f.name,
    f.size,
    f.mime_type,
    f.folder_id,
    f.created_at,
    f.updated_at,

    u.username AS owner,

    s.permission

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
    shareFile(
        req,
        res
    ) {

    try {

        const {

            file_id,

            username,

            permission,

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

        const fileResult =
            await pool.query(
                `
        SELECT
            owner_id
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

        const result =
            await pool.query(
                `
                INSERT INTO shares
                (
                    file_id,
                    shared_with_user_id,
                    permission
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                RETURNING *
                `,
                [
                    file_id,
                    shared_with_user_id,
                    permission,
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

module.exports = {
    getSharedFiles,
    shareFile,
    getFileShares,
    revokeShare,
    updateSharePermission
};