const express = require("express");

const router = express.Router();

const {
    getSharedFiles
} = require(
    "../controllers/sharedController"
);

router.get(
    "/:userId",
    getSharedFiles
);

module.exports = router;