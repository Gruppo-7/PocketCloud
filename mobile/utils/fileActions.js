import { Alert, Platform } from "react-native";

import * as FileSystem
    from "expo-file-system/legacy";

import * as Sharing
    from "expo-sharing";

import * as Linking
    from "expo-linking";

import * as IntentLauncher
    from "expo-intent-launcher";

import {
    getBaseUrl
} from "./api";

export async function
openFile(
    file
) {

    try {

        const baseUrl =
            await getBaseUrl();

        const fileUri =
            FileSystem
                .documentDirectory
            + file.name;

        const downloadUrl =
            `${baseUrl}/files/download/${file.id}`;

        console.log(
            "Downloading:",
            downloadUrl
        );

        const result =
            await FileSystem
                .downloadAsync(
                    downloadUrl,
                    fileUri
                );

        console.log(
            "Downloaded:",
            result
        );

        if (
            Platform.OS
            ===
            "ios"
        ) {

            await Linking
                .openURL(
                    result.uri
                );

        } else {

            const contentUri =
                await FileSystem
                    .getContentUriAsync(
                        result.uri
                    );

            await IntentLauncher
                .startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                        data:
                            contentUri,

                        flags:
                            1,
                    }
                );
        }

    } catch (
        error
    ) {

        console.error(
            "Open file error:",
            error
        );

        Alert.alert(
            "Errore",
            "Impossibile aprire file"
        );
    }
}

export async function
openInSystem(
    file
) {

    try {

        if (
            !file
        ) {
            return;
        }

        const baseUrl =
            await getBaseUrl();

        const fileUri =
            FileSystem
                .documentDirectory
            + file.name;

        const downloadUrl =
            `${baseUrl}/files/download/${file.id}`;

        console.log(
            "Sharing:",
            downloadUrl
        );

        const result =
            await FileSystem
                .downloadAsync(
                    downloadUrl,
                    fileUri
                );

        console.log(
            "Downloaded for share:",
            result
        );

        const canShare =
            await Sharing
                .isAvailableAsync();

        console.log(
            "Can share:",
            canShare
        );

        if (
            !canShare
        ) {

            Alert.alert(
                "Errore",
                "Apri in... non disponibile"
            );

            return;
        }

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    300
                )
        );

        await Sharing
            .shareAsync(
                result.uri
            );

    } catch (
        error
    ) {

        console.error(
            "Share file error:",
            error
        );

        Alert.alert(
            "Errore",
            "Impossibile aprire 'Apri in...'"
        );
    }
}