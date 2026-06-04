const fs = require("fs");

const path = require("path");

const { pool } = require( "../database/db" );

async function
deleteFile(
    req,
    res
) {

    try {

        const {
            fileId
        } = req.params;

        console.log(
            "Delete file:",
            fileId
        );

        // Cerca file
        const result =
            await pool.query(
                `
                SELECT
                    *
                FROM files
                WHERE id = $1
                `,
                [fileId]
            );

        const file =
            result.rows[0];

        if (!file) {

            return res
                .status(404)
                .json({
                    error:
                        "File not found"
                });
        }

        // Path file fisico
        const filePath =
            path.join(
                __dirname,
                "..",
                "storage",
                file.storage_key
            );

        // Cancella file fisico
        if (
            fs.existsSync(
                filePath
            )
        ) {

            fs.unlinkSync(
                filePath
            );
        }

        // Cancella DB
        await pool.query(
            `
            DELETE
            FROM files
            WHERE id = $1
            `,
            [fileId]
        );

        return res
            .status(200)
            .json({
                message:
                    "File deleted"
            });

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

module.exports = {
    deleteFile,
};