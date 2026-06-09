const path = require("path");

const crypto = require("crypto");

const { pool } = require("../database/db");

const fs = require("fs");

async function
    generateDuplicateName(

        owner_id,

        folder_id,

        originalName
    ) {

    const extension =
        path.extname(
            originalName
        );

    const baseName =
        path.basename(
            originalName,
            extension
        );

    let counter =
        1;

    let candidateName =
        originalName;

    while (true) {

        const existing =
            await pool.query(
                `
                SELECT id
                FROM files
                WHERE
                    owner_id = $1

                    AND folder_id
                    IS NOT DISTINCT FROM $2

                    AND name = $3

                LIMIT 1
                `,
                [

                    owner_id,

                    folder_id
                    || null,

                    candidateName,
                ]
            );

        if (
            existing
                .rows
                .length === 0
        ) {

            return candidateName;
        }

        candidateName =
            `${baseName} (${counter})${extension}`;

        counter++;
    }
}

async function uploadFile(
    req,
    res
) {

    try {

        if (!req.file) {

            return res
                .status(400)
                .json({
                    error:
                        "No file uploaded"
                });
        }

        const { owner_id, folder_id, conflict_strategy, sha256_fingerprint } = req.body;

        let fileName =
            req.file
                .originalname;

        const existingFile =
            await pool.query(
                `
        SELECT
    id,
    name,
    sha256_fingerprint
FROM files
WHERE
    owner_id = $1

    AND folder_id
    IS NOT DISTINCT FROM $2

    AND name = $3

LIMIT 1
        `,
                [

                    owner_id,

                    folder_id
                    || null,

                    fileName,
                ]
            );

        if (
            existingFile
                .rows
                .length > 0
        ) {

            const isSameContent =
                existingFile
                    .rows[0]
                    .sha256_fingerprint
                ===
                sha256_fingerprint;

            if (
                conflict_strategy
                ===
                "keep_both"
            ) {

                fileName =
                    await generateDuplicateName(

                        owner_id,

                        folder_id,

                        fileName
                    );

            } else if (

                conflict_strategy
                ===
                "replace"
            ) {

                const oldFile =
                    await pool.query(
                        `
                SELECT *
                FROM files
                WHERE id = $1
                `,
                        [
                            existingFile
                                .rows[0]
                                .id
                        ]
                    );

                const oldStoragePath =
                    path.join(

                        process.cwd(),

                        "storage",

                        oldFile
                            .rows[0]
                            .storage_key
                    );

                if (
                    fs.existsSync(
                        oldStoragePath
                    )
                ) {

                    fs.unlinkSync(
                        oldStoragePath
                    );
                }

                const updatedFile =
                    await pool.query(
                        `
                UPDATE files
                SET

                    storage_key = $1,

                    size = $2,

                    mime_type = $3,

                    sha256_fingerprint = $4,

                    updated_at = NOW()

                WHERE id = $5

                RETURNING *
                `,
                        [

                            req.file
                                .filename,

                            req.file
                                .size,

                            req.file
                                .mimetype,

                            sha256_fingerprint,

                            existingFile
                                .rows[0]
                                .id,
                        ]
                    );

                return res
                    .status(200)
                    .json({

                        message:
                            "File replaced",

                        file:
                            updatedFile
                                .rows[0],
                    });

            } else {

                fs.unlinkSync(
                    req.file.path
                );

                return res
                    .status(409)
                    .json({

                        conflict:
                            true,

                        sameContent:
                            isSameContent,

                        existingFile:
                            existingFile
                                .rows[0],
                    });
            }
        }

        console.log(
            "Uploaded file:",
            req.file
        );

        const result =
            await pool.query(
                `
                INSERT INTO files
                (
                    owner_id,
                    folder_id,
                    name,
                    storage_key,
                    size,
                    mime_type,
                    sha256_fingerprint
                )
                VALUES
                (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
                )
                RETURNING *
                `,
                [
                    owner_id,

                    folder_id || null,

                    fileName,

                    req.file
                        .filename,

                    req.file
                        .size,

                    req.file
                        .mimetype,

                    sha256_fingerprint
                ]
            );

        return res
            .status(201)
            .json({

                message:
                    "Upload successful",

                file:
                    result.rows[0],
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
    uploadFile,
};