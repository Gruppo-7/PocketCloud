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

const { renameFolder } = require("../controllers/renameFolderController");

const { moveFolder } = require("../controllers/moveController");

router.get(
    "/:userId",
    getFolders
);

router.post(
    "/",
    createFolder
);

router.patch(
    "/:folderId/rename",
    renameFolder
);

router.patch(
    "/:folderId/move",
    moveFolder
);

router.delete(
    "/:id",
    deleteFolder
);

module.exports =
    router;