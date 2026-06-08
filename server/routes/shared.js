const express = require("express");

const router = express.Router();

const { getSharedFiles, shareFile, getFileShares, revokeShare, updateSharePermission } = require("../controllers/sharedController");

router.get(
    "/file/:fileId",
    getFileShares
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