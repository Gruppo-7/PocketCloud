const path = require("path");

const { pool } = require("../database/db");

async function
    downloadFile(
        req,
        res
    ) {

    try {

        const {
            fileId
        } = req.params;

        console.log(
            "Download file:",
            fileId
        );

        // Cerca file
        const result =
            await pool.query(
                `
                SELECT *
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

        const filePath =
            path.join(
                __dirname,
                "..",
                "storage",
                file.storage_key
            );

        return res
            .download(
                filePath,
                file.name
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

module.exports = {
    downloadFile,
};