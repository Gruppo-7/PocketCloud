const express = require("express");

const cors = require("cors");

const app = express();

app.set(
    "trust proxy",
    true
);

const PORT = 3000;

const { pool, connectDatabase } = require("./database/db");

const authRoutes = require("./routes/auth");

const filesRoutes = require("./routes/files");

const sharedRoutes = require("./routes/shared");

const foldersRoutes = require("./routes/folders");

app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/files", filesRoutes);

app.use("/shared", sharedRoutes);

app.use("/folders", foldersRoutes);

app.get(
    "/health",
    async (
        req,
        res
    ) => {

        try {

            const {
                pool
            } = require(
                "./database/db"
            );

            await pool.query(
                "SELECT 1"
            );

            return res
                .status(200)
                .json({

                    status:
                        "online",

                    database:
                        "connected",

                    name:
                        "PocketCloud Server",

                    version:
                        "1.0.0",

                    uptime:
                        Math.floor(
                            process
                                .uptime()
                        ),

                    timestamp:
                        new Date()
                            .toISOString(),
                });

        } catch (
        error
        ) {

            return res
                .status(503)
                .json({

                    status:
                        "degraded",

                    database:
                        "disconnected",

                    error:
                        error.message,
                });
        }
    }
);

app.listen(
    PORT,
    async () => {

        console.log(
            `Server running on port ${PORT}`
        );

        await
            connectDatabase();
    }
);

async function
    gracefulShutdown(
        signal
    ) {

    console.log(
        `Received ${signal}. Shutting down PocketCloud...`
    );

    try {

        await pool.end();

        console.log(
            "PostgreSQL pool closed"
        );

    } catch (
    error
    ) {

        console.error(
            "Error closing database pool:",
            error.message
        );
    }

    process.exit(0);
}

process.on(
    "SIGTERM",
    () =>
        gracefulShutdown(
            "SIGTERM"
        )
);

process.on(
    "SIGINT",
    () =>
        gracefulShutdown(
            "SIGINT"
        )
);