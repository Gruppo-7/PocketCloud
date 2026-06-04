const {
    pool
} = require(
    "../database/db"
);

async function
getSharedFiles(
    req,
    res
) {

    try {

        const {
            userId
        } = req.params;

        console.log(
            "Get shared files for user:",
            userId
        );

        const result =
            await pool.query(
                `
                SELECT
                    f.id,
                    f.name,
                    f.size,
                    f.mime_type,
                    f.folder_id,
                    f.created_at,
                    f.updated_at
                FROM file_access fa
                JOIN files f
                    ON f.id =
                    fa.file_id
                WHERE
                    fa.user_id = $1
                    AND fa.permission != 'owner'
                ORDER BY
                    f.updated_at DESC
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
    getSharedFiles,
};