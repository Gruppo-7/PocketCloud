import * as FileSystem from "expo-file-system/legacy";

export const CACHE_DIR =
    FileSystem.documentDirectory +
    "pocketcloud-cache/";

export async function ensureCacheDirectory() {

    const info =
        await FileSystem.getInfoAsync(
            CACHE_DIR
        );

    if (!info.exists) {

        await FileSystem.makeDirectoryAsync(
            CACHE_DIR,
            {
                intermediates: true
            }
        );
    }
}

export async function clearCache() {

    await FileSystem.deleteAsync(
        CACHE_DIR,
        {
            idempotent: true
        }
    );

    await ensureCacheDirectory();
}

export async function isFileCached(
    file
) {

    const cacheVersion =
        new Date(file.updated_at).getTime();

    const filePath =
        `${CACHE_DIR}${file.id}-${cacheVersion}-${file.name}`;

    console.log(

        "CACHE CHECK",

        filePath

    );

    const info =
        await FileSystem.getInfoAsync(
            filePath
        );

    console.log(

        "CACHE EXISTS",

        file.name,

        info.exists);

    return info.exists;
}

export async function getCacheSize() {

    await ensureCacheDirectory();

    const files =
        await FileSystem.readDirectoryAsync(
            CACHE_DIR
        );

    let totalSize = 0;

    for (const file of files) {

        const info =
            await FileSystem.getInfoAsync(
                `${CACHE_DIR}${file}`
            );

        totalSize += info.size || 0;
    }

    return totalSize;
}

export async function deleteCachedFile(
    file
) {

    const cacheVersion =
        new Date(file.updated_at).getTime();

    const filePath =
        `${CACHE_DIR}${file.id}-${cacheVersion}-${file.name}`;

    await FileSystem.deleteAsync(
        filePath,
        {
            idempotent: true
        }
    );
}