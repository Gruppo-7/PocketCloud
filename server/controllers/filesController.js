const {
    pool
} = require(
    "../database/db"
);

async function
    getFiles(req, res) {

    try {

        const {
            userId
        } = req.params;

        const result =
            await pool.query(
                `
                SELECT
    id,
    owner_id,
    folder_id,
    name,
    size,
    mime_type,
    sha256_fingerprint,
    encryption_iv,
    encrypted_file_key,
    encrypted_file_key_iv,
    encryption_version,
    algorithm,
    is_encrypted,
    created_at,
    updated_at
FROM files
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
    getFiles,
};