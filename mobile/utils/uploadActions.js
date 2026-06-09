import * as DocumentPicker
    from "expo-document-picker";

import { Alert }
    from "react-native";

import { getCurrentUser }
    from "./storage";

import { getBaseUrl }
    from "./api";

export async function
    uploadDocument({

        currentFolder =
        null,

        reloadFiles,

        onUploadSuccess,
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

        const formData =
            new FormData();

        formData.append(
            "file",
            {

                uri:
                    file.uri,

                name:
                    file.name,

                type:
                    file.mimeType
                    ||
                    "application/octet-stream",
            }
        );

        formData.append(
            "owner_id",
            user.id
        );

        formData.append(
            "folder_id",
            currentFolder
                ?.id
            ?? ""
        );

        const baseUrl =
            await getBaseUrl();

        const response =
            await fetch(
                `${baseUrl}/files/upload`,
                {

                    method:
                        "POST",

                    body:
                        formData,
                }
            );

        const data =
            await response
                .json();

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
    }
}