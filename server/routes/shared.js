const express = require("express");

const router = express.Router();

const { getSharedFiles, shareFile, getFileShares, revokeShare, updateSharePermission, removeSharedFile, getPendingShares, acceptShare } = require("../controllers/sharedController");

router.get(
    "/file/:fileId",
    getFileShares
);

router.get(
    "/pending/:userId",
    getPendingShares
);

router.delete(
    "/file/:fileId/user/:userId",
    removeSharedFile
);

router.patch(
    "/:shareId",
    updateSharePermission
);

router.patch(
    "/:shareId/accept",
    acceptShare
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