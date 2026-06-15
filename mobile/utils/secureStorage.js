import * as SecureStore from "expo-secure-store";

const MASTER_KEY =
    "pocketcloud_master_key";

export async function
saveMasterKey(
    key
) {

    await SecureStore
        .setItemAsync(
            MASTER_KEY,
            key
        );
}

export async function
getMasterKey() {

    return await SecureStore
        .getItemAsync(
            MASTER_KEY
        );
}

export async function
deleteMasterKey() {

    await SecureStore
        .deleteItemAsync(
            MASTER_KEY
        );
}