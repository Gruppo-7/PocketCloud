const path = require("path");

const crypto = require("crypto");

const { pool } = require("../database/db");

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

        const { owner_id, folder_id } = req.body;

        if (!owner_id) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing owner_id"
                });
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
                    mime_type
                )
                VALUES
                (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
                )
                RETURNING *
                `,
                [
                    owner_id,

                    folder_id || null,

                    req.file
                        .originalname,

                    req.file
                        .filename,

                    req.file
                        .size,

                    req.file
                        .mimetype,
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