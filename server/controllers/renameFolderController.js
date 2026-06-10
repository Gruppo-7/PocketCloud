const {
    pool
} = require(
    "../database/db"
);

async function
    renameFolder(
        req,
        res
    ) {

    try {

        const {
            folderId
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
                        "Missing folder name"
                });
        }

        const existingFolder =
            await pool.query(
                `
                SELECT
                    owner_id,
                    parent_folder_id
                FROM folders
                WHERE id = $1
                `,
                [folderId]
            );

        if (
            existingFolder
                .rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({
                    error:
                        "Folder not found"
                });
        }

        const {
            owner_id,
            parent_folder_id
        } =
            existingFolder
                .rows[0];

        const duplicate =
            await pool.query(
                `
                SELECT id
                FROM folders
                WHERE
                    owner_id = $1

                    AND parent_folder_id
                    IS NOT DISTINCT FROM $2

                    AND name = $3

                    AND id != $4

                LIMIT 1
                `,
                [

                    owner_id,

                    parent_folder_id,

                    name.trim(),

                    folderId,
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
                        "A folder with this name already exists"
                });
        }

        const result =
            await pool.query(
                `
                UPDATE folders
                SET

                    name = $1,

                    updated_at = NOW()

                WHERE id = $2

                RETURNING *
                `,
                [

                    name.trim(),

                    folderId,
                ]
            );

        return res
            .status(200)
            .json({

                message:
                    "Folder renamed",

                folder:
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
    renameFolder,
};