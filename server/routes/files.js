const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const crypto = require("crypto");

const storage =
    multer.diskStorage({

        destination:
            (
                req,
                file,
                cb
            ) => {

                cb(
                    null,
                    "storage/"
                );
            },

        filename:
            (
                req,
                file,
                cb
            ) => {

                const extension =
                    path.extname(
                        file.originalname
                    );

                const storageKey =
                    crypto
                        .randomUUID()
                    + extension;

                cb(
                    null,
                    storageKey
                );
            },
    });

const upload = multer({ storage });

const { getFiles } = require("../controllers/filesController");

const { uploadFile } = require("../controllers/uploadController");

const { deleteFile } = require("../controllers/deleteController");

const { downloadFile } = require("../controllers/downloadController");

const { getStorageUsage } = require( "../controllers/storageController" );

router.get(
    "/storage/:userId",
    getStorageUsage
);

router.get(
    "/:userId",
    getFiles
);

router.post(
    "/upload",

    upload.single(
        "file"
    ),

    uploadFile
);

router.get(
    "/download/:fileId",
    downloadFile
);

router.delete(
    "/:fileId",
    deleteFile
);

module.exports = router;