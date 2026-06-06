const express = require("express");

const cors = require("cors");

const app = express();

const PORT = 3000;

const { connectDatabase } = require( "./database/db" );

const authRoutes = require( "./routes/auth" );

const filesRoutes = require( "./routes/files" );

const sharedRoutes = require(  "./routes/shared" );

const foldersRoutes = require( "./routes/folders" );

app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);

app.use( "/files", filesRoutes );

app.use( "/shared", sharedRoutes );

app.use( "/folders", foldersRoutes );

app.get(
    "/health",
    (req, res) => {

        res.json({
            status:
                "online",

            name:
                "PocketCloud Server",

            version:
                "1.0.0",
        });
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