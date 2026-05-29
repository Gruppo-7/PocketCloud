const express =
    require("express");

const cors =
    require("cors");

const app =
    express();

const PORT =
    3000;

app.use(cors());

app.use(
    express.json()
);

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
    () => {

        console.log(
            `Server running on port ${PORT}`
        );
    }
);