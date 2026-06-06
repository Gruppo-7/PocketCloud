const express =
    require(
        "express"
    );

const router =
    express.Router();

const {
    getFolders,
    createFolder,
    deleteFolder
} = require(
    "../controllers/foldersController"
);

router.get(
    "/:userId",
    getFolders
);

router.post(
    "/",
    createFolder
);

router.delete(
    "/:id",
    deleteFolder
);

module.exports =
    router;