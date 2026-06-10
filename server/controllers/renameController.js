const {
    pool
} = require(
    "../database/db"
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
            name
        } = req.body;

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
                    folder_id
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
            folder_id
        } =
            existingFile
                .rows[0];

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

                    name.trim(),

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

                    name.trim(),

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
    renameFile,
};