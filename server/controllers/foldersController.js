const {
    pool
} = require(
    "../database/db"
);

const fs =
    require(
        "fs/promises"
    );

const path =
    require(
        "path"
    );

async function
    getFolders(
        req,
        res
    ) {

    try {

        const {
            userId
        } =
            req.params;

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    parent_folder_id,
                    created_at,
                    updated_at
                FROM folders
                WHERE owner_id = $1
                ORDER BY updated_at DESC
                `,
                [userId]
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
            "Get folders error:",
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
    createFolder(
        req,
        res
    ) {

    try {

        const {
            ownerId,
            name,
            parentFolderId,
        } =
            req.body;

        if (
            !name ||
            !name.trim()
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Folder name required",
                });
        }

        const result =
            await pool.query(
                `
                INSERT INTO folders (
                    owner_id,
                    name,
                    parent_folder_id
                )
                VALUES (
                    $1,
                    $2,
                    $3
                )
                RETURNING *
                `,
                [
                    ownerId,

                    name.trim(),

                    parentFolderId ??
                    null,
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
            "Create folder error:",
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error",
            });
    }
}

async function
    deleteFolder(
        req,
        res
    ) {

    try {

        const {
            id
        } =
            req.params;

        // prende tutte
        // le cartelle nested
        const foldersResult =
            await pool.query(
                `
                WITH RECURSIVE
                nested_folders
                AS (

                    SELECT id
                    FROM folders
                    WHERE id = $1

                    UNION ALL

                    SELECT f.id
                    FROM folders f
                    INNER JOIN
                    nested_folders nf
                    ON f.parent_folder_id
                    = nf.id
                )

                SELECT id
                FROM nested_folders
                `,
                [id]
            );

        const folderIds =
            foldersResult
                .rows
                .map(
                    row =>
                        row.id
                );

        // prende tutti
        // i file collegati
        const filesResult =
            await pool.query(
                `
                SELECT storage_key
                FROM files
                WHERE folder_id
                = ANY($1)
                `,
                [folderIds]
            );

        // elimina file fisici
        for (
            const file
            of filesResult.rows
        ) {

            try {

                const filePath =
                    path.join(
                        __dirname,
                        "..",
                        "storage",
                        file
                            .storage_key
                    );

                await fs.unlink(
                    filePath
                );


            } catch (
            error
            ) {

                console.warn(
                    "Failed to delete file:",
                    file.storage_key
                );
            }
        }

        // delete folder
        // DB cascade
        const result =
            await pool.query(
                `
                DELETE
                FROM folders
                WHERE id = $1
                RETURNING *
                `,
                [id]
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
                        "Folder not found"
                });
        }

        return res
            .status(200)
            .json({
                message:
                    "Folder deleted"
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
    getFolders,
    createFolder,
    deleteFolder
};