const {
    pool
} = require(
    "../database/db"
);

async function
getStorageUsage(
    req,
    res
) {

    try {

        const {
            userId
        } = req.params;

        const result =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(size),
                        0
                    ) AS total
                FROM files
                WHERE owner_id = $1
                `,
                [userId]
            );

        return res
            .status(200)
            .json({
                total:
                    Number(
                        result
                            .rows[0]
                            .total
                    )
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
    getStorageUsage,
};