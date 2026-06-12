import * as DocumentPicker
    from "expo-document-picker";

import { Alert }
    from "react-native";

import { getCurrentUser }
    from "./storage";

import { getBaseUrl }
    from "./api";

import * as FileSystem
    from "expo-file-system/legacy";

export async function
    uploadDocument({

        currentFolder =
        null,

        reloadFiles,

        onUploadSuccess,

        setIsUploading,

        setUploadProgress,
    }) {

    try {

        const result =
            await DocumentPicker
                .getDocumentAsync({

                    multiple:
                        false,

                    copyToCacheDirectory:
                        true,
                });

        if (
            result.canceled
        ) {
            return;
        }

        const file =
            result.assets[0];

        const user =
            await getCurrentUser();

        const baseUrl =
            await getBaseUrl();

        setIsUploading?.(
            true
        );

        setUploadProgress?.(
            0
        );

        const uploadTask =
            FileSystem
                .createUploadTask(
                    `${baseUrl}/files/upload`,

                    file.uri,

                    {

                        httpMethod:
                            "POST",

                        uploadType:
                            FileSystem
                                .FileSystemUploadType
                                .MULTIPART,

                        fieldName:
                            "file",

                        mimeType:
                            file.mimeType
                            ||
                            "application/octet-stream",

                        headers:
                        {
                            "x-file-name":
                                encodeURIComponent(
                                    file.name
                                ),
                        },

                        parameters:
                        {

                            owner_id:
                                String(
                                    user.id
                                ),

                            folder_id:
                                String(
                                    currentFolder
                                        ?.id
                                    ?? ""
                                ),
                        },
                    },

                    (
                        progress
                    ) => {

                        const percent =
                            Math.round(
                                (
                                    progress
                                        .totalBytesSent
                                    /
                                    progress
                                        .totalBytesExpectedToSend
                                )
                                * 100
                            );

                        setUploadProgress?.(
                            percent
                        );
                    }
                );

        const uploadResult =
            await uploadTask
                .uploadAsync();

        const response = {
            ok:
                uploadResult
                    .status
                >= 200
                &&
                uploadResult
                    .status
                < 300,

            status:
                uploadResult
                    .status
        };

        const data =
            JSON.parse(
                uploadResult
                    .body
            );

        if (
            !response.ok
        ) {

            throw new Error(
                data.error
            );
        }

        await reloadFiles?.();

        if (
            onUploadSuccess
        ) {

            onUploadSuccess(
                data.file
            );
        }

        return data.file;

    } catch (
    error
    ) {

        console.error(
            "Upload error:",
            error
        );

        Alert.alert(
            "Errore",
            "Upload fallito"
        );
    } finally {

        setTimeout(
            () => {

                setUploadProgress?.(
                    null
                );

                setIsUploading?.(
                    false
                );
            },

            500
        );
    }
}
