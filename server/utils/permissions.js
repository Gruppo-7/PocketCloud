const {
    pool
} = require(
    "../database/db"
);

async function
    canModifyFile(
        userId,
        fileId
    ) {

    console.log(
        "Permission check:",
        {
            userId,
            fileId
        }
    );

    const ownerResult =
        await pool.query(
            `
            SELECT owner_id
            FROM files
            WHERE id = $1
            `,
            [fileId]
        );

    if (
        ownerResult
            .rows
            .length === 0
    ) {

        return {
            allowed:
                false,

            reason:
                "FILE_NOT_FOUND",
        };
    }

    const ownerId =
        ownerResult
            .rows[0]
            .owner_id;

    /* owner */

    if (
        Number(
            ownerId
        )
        ===
        Number(
            userId
        )
    ) {

        return {
            allowed:
                true,
        };
    }

    /* shared + write */

    const shareResult =
        await pool.query(
            `
            SELECT permission
            FROM shares
            WHERE
                file_id = $1
                AND
                shared_with_user_id = $2
            `,
            [
                fileId,
                userId
            ]
        );

    if (
        shareResult
            .rows
            .length === 0
    ) {

        return {
            allowed:
                false,

            reason:
                "NO_ACCESS",
        };
    }

    console.log(
        "Share result:",
        shareResult.rows
    );

    const permission =
        shareResult
            .rows[0]
            .permission;

    if (
        permission
        !==
        "write"
    ) {

        return {
            allowed:
                false,

            reason:
                "READ_ONLY",
        };
    }

    return {
        allowed:
            true,
    };
}

async function
    isOwner(
        userId,
        fileId
    ) {

    const result =
        await pool.query(
            `
            SELECT owner_id
            FROM files
            WHERE id = $1
            `,
            [fileId]
        );

    if (
        result.rows
            .length === 0
    ) {

        return false;
    }

    return (
        Number(
            result
                .rows[0]
                .owner_id
        )
        ===
        Number(
            userId
        )
    );
}

module.exports = {
    canModifyFile,
    isOwner,
};