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
                name,
                size,
                mime_type,
                folder_id,
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