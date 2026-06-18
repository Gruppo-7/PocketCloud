import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteMasterKey, getMasterKey } from "./secureStorage";

// SERVER

export async function saveServerAddress(
    address
) {

    try {

        await AsyncStorage.setItem(
            "serverAddress",
            address
        );

    } catch (error) {

        console.log(
            "Errore salvataggio server:",
            error
        );
    }
}

export async function getServerAddress() {

    try {

        return await AsyncStorage.getItem(
            "serverAddress"
        );

    } catch (error) {

        console.log(
            "Errore recupero server:",
            error
        );

        return null;
    }
}

export async function removeServerAddress() {

    try {

        await AsyncStorage.removeItem(
            "serverAddress"
        );

    } catch (error) {

        console.log(
            "Errore rimozione server:",
            error
        );
    }
}


// LOGIN

export async function saveLoginState(
    isLoggedIn
) {

    try {

        await AsyncStorage.setItem(
            "isLoggedIn",
            JSON.stringify(
                isLoggedIn
            )
        );

    } catch (error) {

        console.log(
            "Errore salvataggio login:",
            error
        );
    }
}

export async function getLoginState() {

    try {

        const value =
            await AsyncStorage.getItem(
                "isLoggedIn"
            );

        return value
            ? JSON.parse(value)
            : false;

    } catch (error) {

        console.log(
            "Errore recupero login:",
            error
        );

        return false;
    }
}

export async function
    logout() {

    try {

        await deleteMasterKey();

        await AsyncStorage
            .removeItem(
                "isLoggedIn"
            );

        console.log(
            "Logout completed"
        );

        const stored =
            await getMasterKey();

        console.log(
            "After logout:",
            stored
        );

    } catch (
    error
    ) {

        console.log(

            "Errore logout:",

            error
        );
    }
}

export async function
    saveCurrentUser(user) {

    try {

        await AsyncStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

    } catch (error) {

        console.error(
            "Save current user error:",
            error
        );
    }
}

export async function
    getCurrentUser() {

    try {

        const user =
            await AsyncStorage.getItem(
                "currentUser"
            );

        return user
            ? JSON.parse(user)
            : null;

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return null;
    }
}

export async function
    removeCurrentUser() {

    try {

        await AsyncStorage.removeItem(
            "currentUser"
        );

    } catch (error) {

        console.error(
            "Remove current user error:",
            error
        );
    }
}

export async function
    saveStorageUsage(
        storage
    ) {

    await AsyncStorage
        .setItem(
            "usedStorage",
            storage
        );
}

export async function
    getStorageUsage() {

    return await
        AsyncStorage
            .getItem(
                "usedStorage"
            );
}

// =========================
// CACHE FILES
// =========================

export async function
    saveCachedFiles(
        files,
        cacheKey = "cachedFiles"
    ) {

    try {

        await AsyncStorage
            .setItem(

                cacheKey,

                JSON.stringify(
                    files
                )
            );

    } catch (
    error
    ) {

        console.error(

            "Save cached files error:",

            error
        );
    }
}

export async function
    getCachedFiles(cacheKey = "cachedFiles") {

    try {

        const files =
            await AsyncStorage
                .getItem(
                    cacheKey
                );

        return files
            ? JSON.parse(
                files
            )
            : [];

    } catch (
    error
    ) {

        console.error(

            "Get cached files error:",

            error
        );

        return [];
    }
}


// =========================
// CACHE FOLDERS
// =========================

export async function
    saveCachedFolders(
        folders,
        cacheKey = "cachedFolders"
    ) {

    try {

        await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify(folders)
        );

    } catch (error) {

        console.error(
            "Save cached folders error:",
            error
        );
    }
}

export async function
    getCachedFolders(
        cacheKey = "cachedFolders"
    ) {

    try {

        const folders =
            await AsyncStorage.getItem(
                cacheKey
            );

        return folders
            ? JSON.parse(folders)
            : [];

    } catch (error) {

        console.error(
            "Get cached folders error:",
            error
        );

        return [];
    }
}


// =========================
// LAST SYNC
// =========================

export async function
    saveLastSync() {

    try {

        await AsyncStorage
            .setItem(

                "lastSync",

                new Date()
                    .toISOString()
            );

    } catch (
    error
    ) {

        console.error(

            "Save last sync error:",

            error
        );
    }
}

export async function
    getLastSync() {

    try {

        return await AsyncStorage
            .getItem(
                "lastSync"
            );

    } catch (
    error
    ) {

        console.error(

            "Get last sync error:",

            error
        );

        return null;
    }
}