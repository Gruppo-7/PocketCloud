const express = require("express");

const router = express.Router();

const {
    getSharedFiles,
    shareFile
} = require(
    "../controllers/sharedController"
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