const { Pool } =
    require("pg");

require("dotenv")
    .config();

const pool =
    new Pool({

        host:
            process.env
                .DB_HOST,

        port:
            process.env
                .DB_PORT,

        user:
            process.env
                .DB_USER,

        password:
            process.env
                .DB_PASSWORD,

        database:
            process.env
                .DB_NAME,
    });

async function
    connectDatabase() {

    try {

        const client =
            await pool.connect();

        console.log(
            "Connected to PostgreSQL"
        );

        client.release();

        const result =
            await pool.query(
                "SELECT NOW()"
            );

        console.log(
            "Database time:",
            result.rows[0]
        );

    } catch (error) {

        console.error(
            "Database connection error:",
            error.message
        );
    }
}

module.exports = {
    pool,
    connectDatabase,
};