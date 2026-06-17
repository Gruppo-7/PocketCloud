import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";
import * as IntentLauncher from "expo-intent-launcher";
import { getMasterKey } from "./secureStorage";
import { decryptFile, generateFileHash, scheduleTempFileCleanup, cleanupTemporaryFiles, decryptText } from "./crypto";
import { getBaseUrl } from "./api";
import { CACHE_DIR, ensureCacheDirectory } from "./cacheManager";

export async function
    openFile(
        file
    ) {

    try {

        await ensureCacheDirectory();

        const baseUrl =
            await getBaseUrl();

        const fileUri =
            `${CACHE_DIR}${file.id}-${file.name}`;

        const downloadUrl =
            `${baseUrl}/files/download/${file.id}`;

        const fileInfo =
            await FileSystem
                .getInfoAsync(
                    fileUri
                );

        let finalUri;

        if (
            fileInfo.exists
        ) {

            console.log(
                "CACHE HIT:",
                file.name
            );

            finalUri =
                fileUri;

        } else {

            console.log(
                "CACHE MISS:",
                file.name
            );

            Alert.alert(
                "Download in corso",
                "Il file viene scaricato per l'apertura offline."
            );

            console.log(
                "Downloading:",
                downloadUrl
            );

            if (
                fileInfo.exists
            ) {

                console.log(
                    "CACHE HIT:",
                    file.name
                );

                finalUri =
                    fileUri;

            } else {

                console.log(
                    "CACHE MISS:",
                    file.name
                );

                const result =
                    await FileSystem.downloadAsync(
                        downloadUrl,
                        fileUri
                    );

                finalUri =
                    result.uri;
            }
        }

        if (
            file.is_encrypted
        ) {

            const masterKey =
                await getMasterKey();

            if (
                !masterKey
            ) {

                await cleanupTemporaryFiles();

                Alert.alert(

                    "Errore",

                    "Sessione sicura non disponibile"
                );

                return;
            }

            let decryptionKey =
                masterKey;

            /* Encryption v2:
               masterKey -> fileKey */
            if (
                Number(
                    file.encryption_version
                ) >= 2
            ) {

                const encryptedFileKey =

                    file
                        .share_encrypted_file_key

                    ||

                    file
                        .encrypted_file_key;

                const encryptedFileKeyIV =

                    file
                        .share_encrypted_file_key_iv

                    ||

                    file
                        .encrypted_file_key_iv;

                decryptionKey =
                    decryptText(

                        encryptedFileKey,

                        masterKey,

                        encryptedFileKeyIV
                    );

                if (
                    !decryptionKey
                ) {

                    await cleanupTemporaryFiles();

                    Alert.alert(

                        "Errore",

                        "Impossibile recuperare chiave file"
                    );

                    return;
                }
            }

            finalUri =
                await decryptFile(

                    finalUri,

                    decryptionKey,

                    file.encryption_iv,

                    file.name
                );

            console.log(
                "Decrypted file:",
                finalUri
            );

            const decryptedHash =
                await generateFileHash(
                    finalUri
                );

            console.log(
                "Integrity check:",
                decryptedHash
            );

            const expectedHash =
                file
                    .sha256_fingerprint
                    ?.trim()
                    .toLowerCase();

            const actualHash =
                decryptedHash
                    ?.trim()
                    .toLowerCase();

            console.log(
                "Expected:",
                expectedHash
            );

            console.log(
                "Actual:",
                actualHash
            );

            if (
                actualHash
                !==
                expectedHash
            ) {

                Alert.alert(

                    "Errore",

                    "Il file potrebbe essere corrotto o alterato"
                );

                return;
            }
        }

        console.log(
            "File URI:",
            finalUri
        );

        if (
            Platform.OS
            ===
            "ios"
        ) {

            await Linking
                .openURL(
                    finalUri
                );

        } else {

            const contentUri =
                await FileSystem
                    .getContentUriAsync(
                        finalUri
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

        if (
            file.is_encrypted
        ) {

            scheduleTempFileCleanup(

                finalUri,

                30000
            );
        }

    } catch (
    error
    ) {

        console.error(
            "Open file error:",
            error
        );

        if (
            error.message
            ===
            "MISSING_IV"
        ) {

            Alert.alert(

                "File protetto non valido",

                "Metadati di crittografia mancanti.\n\nIl file non può essere aperto."
            );

            return;
        }

        if (
            error.message
            ===
            "DECRYPT_FAILED"
        ) {

            Alert.alert(

                "Decrittazione fallita",

                "Impossibile decifrare il file protetto.\n\nProva ad effettuare nuovamente il login."
            );

            return;
        }

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

        await ensureCacheDirectory();

        if (
            !file
        ) {
            return;
        }

        const baseUrl =
            await getBaseUrl();

        const fileUri =
            `${CACHE_DIR}${file.id}-${file.name}`;

        const downloadUrl =
            `${baseUrl}/files/download/${file.id}`;

        console.log(
            "Sharing:",
            downloadUrl
        );

        const fileInfo =
            await FileSystem
                .getInfoAsync(
                    fileUri
                );

        if (
            !fileInfo.exists
            &&
            !(await isServerReachable())
        ) {

            Alert.alert(
                "File non disponibile",
                "Questo file non è disponibile offline."
            );

            return;
        }

        let finalUri;

        if (
            fileInfo.exists
        ) {

            console.log(
                "CACHE HIT:",
                file.name
            );

            finalUri =
                fileUri;

        } else {

            console.log(
                "CACHE MISS:",
                file.name
            );

            const result =
                await FileSystem
                    .downloadAsync(
                        downloadUrl,
                        fileUri
                    );

            finalUri =
                result.uri;
        }

        if (
            file.is_encrypted
        ) {

            const masterKey =
                await getMasterKey();

            if (
                !masterKey
            ) {

                await cleanupTemporaryFiles();

                Alert.alert(

                    "Errore",

                    "Sessione sicura non disponibile"
                );

                return;
            }

            let decryptionKey =
                masterKey;

            /* Encryption v2:
               masterKey -> fileKey */
            if (
                Number(
                    file.encryption_version
                ) >= 2
            ) {

                decryptionKey =
                    decryptText(

                        file
                            .encrypted_file_key,

                        masterKey,

                        file
                            .encrypted_file_key_iv
                    );

                if (
                    !decryptionKey
                ) {

                    await cleanupTemporaryFiles();

                    Alert.alert(

                        "Errore",

                        "Impossibile recuperare chiave file"
                    );

                    return;
                }
            }

            finalUri =
                await decryptFile(

                    finalUri,

                    decryptionKey,

                    file.encryption_iv,

                    file.name
                );

            console.log(
                "Decrypted for share:",
                finalUri
            );

            const decryptedHash =
                await generateFileHash(
                    finalUri
                );

            const expectedHash =
                file
                    .sha256_fingerprint
                    ?.trim()
                    .toLowerCase();

            const actualHash =
                decryptedHash
                    ?.trim()
                    .toLowerCase();

            console.log(
                "Expected:",
                expectedHash
            );

            console.log(
                "Actual:",
                actualHash
            );

            if (
                actualHash
                !==
                expectedHash
            ) {

                Alert.alert(

                    "Errore",

                    "Il file potrebbe essere corrotto o alterato"
                );

                return;
            }
        }

        console.log(
            "Sharing URI:",
            finalUri
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
                    1000
                )
        );

        console.log(
            "Sharing URI:",
            finalUri
        );

        await Sharing
            .shareAsync(
                finalUri
            );

        if (
            file.is_encrypted
        ) {

            scheduleTempFileCleanup(

                finalUri,

                60000
            );
        }

    } catch (
    error
    ) {

        console.error(
            "Share file error:",
            error
        );

        if (
            error.message
            ===
            "MISSING_IV"
        ) {

            Alert.alert(

                "File protetto non valido",

                "Metadati di crittografia mancanti.\n\nIl file non può essere aperto."
            );

            return;
        }

        if (
            error.message
            ===
            "DECRYPT_FAILED"
        ) {

            Alert.alert(

                "Decrittazione fallita",

                "Impossibile decifrare il file protetto.\n\nProva ad effettuare nuovamente il login."
            );

            return;
        }

        Alert.alert(
            "Errore",
            "Impossibile aprire 'Apri in...'"
        );
    }
}