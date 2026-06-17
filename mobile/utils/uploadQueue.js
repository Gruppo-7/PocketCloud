import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
    "pending_upload_jobs";

export async function
    getPendingUploads() {

    try {

        const saved =
            await AsyncStorage
                .getItem(
                    STORAGE_KEY
                );

        return saved

            ? JSON.parse(
                saved
            )

            : [];

    } catch (
    error
    ) {

        console.error(
            "Get uploads error:",
            error
        );

        return [];
    }
}

export async function
    savePendingUpload(
        uploadJob
    ) {

    try {

        const current =
            await getPendingUploads();

        current.push(
            uploadJob
        );

        await AsyncStorage
            .setItem(

                STORAGE_KEY,

                JSON.stringify(
                    current
                )
            );

    } catch (
    error
    ) {

        console.error(
            "Save upload error:",
            error
        );
    }
}

export async function
    removePendingUpload(
        uploadId
    ) {

    try {

        const current =
            await getPendingUploads();

        const updated =
            current.filter(
                job =>

                    job.id
                    !==
                    uploadId
            );

        await AsyncStorage
            .setItem(

                STORAGE_KEY,

                JSON.stringify(
                    updated
                )
            );

    } catch (
    error
    ) {

        console.error(
            "Remove upload error:",
            error
        );
    }
}

export async function
    updatePendingUpload(
        uploadId,
        updates
    ) {

    try {

        const current =
            await getPendingUploads();

        const updated =
            current.map(
                job =>

                    job.id
                        ===
                        uploadId

                        ? {
                            ...job,
                            ...updates
                        }

                        : job
            );

        await AsyncStorage
            .setItem(

                STORAGE_KEY,

                JSON.stringify(
                    updated
                )
            );

    } catch (
    error
    ) {

        console.error(
            "Update upload error:",
            error
        );
    }
}

let isProcessing =
    false;

export async function
    processUploadQueue(
        processFn
    ) {

    if (
        isProcessing
    ) {

        return;
    }

    isProcessing =
        true;

    try {

        const uploads =
            await getPendingUploads();

        for (
            const job
            of uploads
        ) {

            try {

                await processFn(
                    job
                );

            } catch (
            error
            ) {

                console.error(
                    "Queue upload failed:",
                    error
                );

                break;
            }
        }

    } finally {

        isProcessing =
            false;
    }
}

export async function
clearPendingUploads() {

    await AsyncStorage
        .removeItem(
            STORAGE_KEY
        );
}