const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const crypto = require("crypto");

const { renameFile } = require("../controllers/renameController");

const { replaceFile } = require("../controllers/replaceController");

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

const { getStorageUsage } = require("../controllers/storageController");

const { moveFile } = require("../controllers/moveController");

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

router.patch(
    "/:fileId/rename",
    renameFile
);

router.patch(
    "/:fileId/move",
    moveFile
);

router.patch(
    "/:fileId/replace",

    upload.single(
        "file"
    ),

    replaceFile
);

router.delete(
    "/:fileId",
    deleteFile
);

module.exports = router;