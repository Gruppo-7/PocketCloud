const { pool } = require("../database/db");

async function
moveFile(
    req,
    res
) {

    try {

        const {
            fileId
        } = req.params;

        const {
            folder_id
        } = req.body;

        const result =
            await pool.query(
                `
                UPDATE files
                SET

                    folder_id = $1,

                    updated_at = NOW()

                WHERE id = $2

                RETURNING *
                `,
                [
                    folder_id
                    || null,

                    fileId,
                ]
            );

        return res
            .status(200)
            .json({

                message:
                    "File moved",

                file:
                    result.rows[0],
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
moveFolder(
    req,
    res
) {

    try {

        const {
            folderId
        } = req.params;

        const {
            parent_folder_id
        } = req.body;

        const result =
            await pool.query(
                `
                UPDATE folders
                SET

                    parent_folder_id = $1,

                    updated_at = NOW()

                WHERE id = $2

                RETURNING *
                `,
                [
                    parent_folder_id
                    || null,

                    folderId,
                ]
            );

        return res
            .status(200)
            .json({

                message:
                    "Folder moved",

                folder:
                    result.rows[0],
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
    moveFile,
    moveFolder,
};