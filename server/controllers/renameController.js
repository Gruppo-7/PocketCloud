const {
    pool
} = require(
    "../database/db"
);

const {
    canModifyFile
} = require(
    "../utils/permissions"
);

async function
    renameFile(
        req,
        res
    ) {

    try {

        const {
            fileId
        } = req.params;

        const {
            name,
            userId
        } = req.body;

        const permission =
            await canModifyFile(
                userId,
                fileId
            );

        if (
            !permission
                .allowed
        ) {

            return res
                .status(403)
                .json({
                    error:
                        "Permesso negato"
                });
        }

        if (
            !name
            ||
            !name.trim()
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing file name"
                });
        }

        const existingFile =
            await pool.query(
                `
                SELECT

    owner_id,

    folder_id,

    name,

    is_encrypted

FROM files

WHERE id = $1
                `,
                [fileId]
            );

        if (
            existingFile
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

        const {

            owner_id,

            folder_id,

            name: currentName,

            is_encrypted

        } =
            existingFile
                .rows[0];

        let finalName =
            name.trim();

        if (
            is_encrypted
        ) {

            const cleanCurrentName =
                currentName
                    .replace(
                        /\.encrypted$/i,
                        ""
                    );

            const originalExtension =
                cleanCurrentName
                    .split(".")
                    .pop();

            finalName =
                `${finalName}.${originalExtension}.encrypted`;
        }

        const duplicate =
            await pool.query(
                `
                SELECT id
                FROM files
                WHERE
                    owner_id = $1

                    AND folder_id
                    IS NOT DISTINCT FROM $2

                    AND name = $3

                    AND id != $4

                LIMIT 1
                `,
                [

                    owner_id,

                    folder_id,

                    finalName,

                    fileId,
                ]
            );

        if (
            duplicate
                .rows
                .length > 0
        ) {

            return res
                .status(409)
                .json({
                    error:
                        "A file with this name already exists"
                });
        }

        const result =
            await pool.query(
                `
                UPDATE files
                SET

                    name = $1,

                    updated_at = NOW()

                WHERE id = $2

                RETURNING *
                `,
                [

                    finalName,

                    fileId,
                ]
            );

        return res
            .status(200)
            .json({
                message:
                    "File renamed",

                file:
                    result
                        .rows[0],
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
    renameFile
};