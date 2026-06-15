const fs =
    require("fs");

const path =
    require("path");

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
    replaceFile(
        req,
        res
    ) {

    try {

        const {
            fileId
        } = req.params;

        const {

            userId,

            sha256_fingerprint,

            encryption_iv

        } = req.body;

        const newFile =
            req.file;

        if (
            !newFile
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing file"
                });
        }

        const permission =
            await canModifyFile(
                userId,
                fileId
            );

        if (
            !permission
                .allowed
        ) {

            fs.unlinkSync(
                newFile.path
            );

            return res
                .status(403)
                .json({
                    error:
                        "Permesso negato"
                });
        }

        const fileResult =
            await pool.query(
                `
                SELECT
                    storage_key
                FROM files
                WHERE id = $1
                `,
                [fileId]
            );

        if (
            fileResult
                .rows
                .length === 0
        ) {

            fs.unlinkSync(
                newFile.path
            );

            return res
                .status(404)
                .json({
                    error:
                        "File not found"
                });
        }

        const oldStorageKey =
            fileResult
                .rows[0]
                .storage_key;

        const oldFilePath =
            path.join(
                __dirname,
                "..",
                "storage",
                oldStorageKey
            );

        if (
            fs.existsSync(
                oldFilePath
            )
        ) {

            fs.unlinkSync(
                oldFilePath
            );
        }

        const result =
            await pool.query(
                `
                UPDATE files
SET
    storage_key = $1,

    size = $2,

    mime_type = $3,

    updated_at = NOW(),

    sha256_fingerprint = $4,

    encryption_iv =
        COALESCE(
            $5,
            encryption_iv
        )

WHERE id = $6

RETURNING *
                `,
                [
                    newFile.filename,

                    newFile.size,

                    newFile.mimetype,

                    sha256_fingerprint,

                    encryption_iv
                    || null,

                    fileId,
                ]
            );

        return res
            .status(200)
            .json({

                message:
                    "File updated",

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
    replaceFile,
};