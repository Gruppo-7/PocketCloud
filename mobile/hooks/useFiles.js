import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, getCachedFiles, saveCachedFiles, saveLastSync } from "../utils/storage";
import { getBaseUrl } from "../utils/api";
import { useServerStatus } from "../context/ServerContext";
import { isFileCached, deleteCachedFile } from "../utils/cacheManager";

export default function
    useFiles(endpoint) {

    const cacheKey =
        endpoint === "shared"
            ? "cachedSharedFiles"
            : "cachedFiles";

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);

    const { serverOnline, serverChecked, markServerAlive } = useServerStatus();

    const loadFiles =
        useCallback(
            async () => {

                try {

                    const user =
                        await getCurrentUser();

                    if (
                        !user
                    ) {

                        setFiles(
                            []
                        );

                        setLoading(
                            false
                        );

                        return;
                    }

                    // CACHE FIRST
                    const cachedFiles =
                        await getCachedFiles(
                            cacheKey
                        );

                    const cachedFilesWithStatus =
                        await Promise.all(

                            cachedFiles.map(
                                async file => ({
                                    ...file,
                                    isCached:
                                        await isFileCached(
                                            file
                                        )
                                })
                            )
                        );

                    setFiles(
                        cachedFilesWithStatus
                    );

                    setLoading(
                        false
                    );

                    // Server non ancora controllato
                    if (
                        !serverChecked
                    ) {
                        return;
                    }

                    // Offline → mostra cache
                    if (
                        !serverOnline
                    ) {

                        setLoading(
                            false
                        );

                        return;
                    }

                    const baseUrl =
                        await getBaseUrl();

                    /* Il server potrebbe essere

   andato offline mentre

   caricavamo la cache */

                    if (!serverOnline) {

                        setLoading(false);

                        return;
                    }

                    const response =
                        await fetch(
                            `${baseUrl}/${endpoint}/${user.id}`
                        );

                    const data =
                        await response
                            .json();

                    const finalFiles =
                        Array.isArray(data)

                            ? await Promise.all(

                                data.map(
                                    async file => {

                                        const cachedFile =
                                            cachedFiles.find(
                                                cached =>
                                                    cached.id === file.id
                                            );

                                        if (
                                            cachedFile &&
                                            cachedFile.updated_at !== file.updated_at
                                        ) {

                                            console.log(
                                                "CACHE INVALIDATED",
                                                file.name
                                            );

                                            await deleteCachedFile(
                                                file
                                            );

                                            return {
                                                ...file,
                                                isCached: false
                                            };
                                        }

                                        return {
                                            ...file,
                                            isCached:
                                                await isFileCached(
                                                    file
                                                )
                                        };
                                    }
                                )
                            )

                            : [];

                    console.log(
                        "FILES FROM SERVER",
                        finalFiles
                    );

                    setFiles(
                        finalFiles
                    );

                    // aggiorna cache
                    await saveCachedFiles(
                        finalFiles,
                        cacheKey
                    );

                    await saveLastSync();

                    markServerAlive();

                } catch (error) {

                    if (
                        error?.message ===
                        "Network request failed"
                    ) {

                        setLoading(false);

                        return;
                    }

                    console.error(
                        `Load ${endpoint} error:`,
                        error
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },

            [
                endpoint,
                serverOnline,
                serverChecked
            ]
        );

    useEffect(() => {

        loadFiles();

    }, [
        loadFiles
    ]);

    return {

        files,

        setFiles,

        reloadFiles:
            loadFiles,

        loading,
    };
}