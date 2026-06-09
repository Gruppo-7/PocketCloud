const express = require("express");

const router = express.Router();

const { getSharedFiles, shareFile, getFileShares, revokeShare, updateSharePermission, removeSharedFile } = require("../controllers/sharedController");

router.get(
    "/file/:fileId",
    getFileShares
);

router.delete(
    "/file/:fileId/user/:userId",
    removeSharedFile
);

router.patch(
    "/:shareId",
    updateSharePermission
);

router.delete(
    "/:shareId",
    revokeShare
);

router.get(
    "/:userId",
    getSharedFiles
);

router.post(
    "/",
    shareFile
);

module.exports = router;