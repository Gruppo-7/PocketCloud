import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, getCachedFiles, saveCachedFiles, saveLastSync } from "../utils/storage";
import { getBaseUrl } from "../utils/api";
import { useServerStatus } from "../context/ServerContext";
import { isFileCached } from "../utils/cacheManager";

export default function
    useFiles(endpoint) {

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
                        await getCachedFiles();

                    if (
                        cachedFiles.length > 0
                    ) {

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
                    }

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

                    const response =
                        await fetch(
                            `${baseUrl}/${endpoint}/${user.id}`
                        );

                    const data =
                        await response
                            .json();

                    const finalFiles =
                        Array.isArray(
                            data
                        )
                            ? await Promise.all(

                                data.map(
                                    async file => ({

                                        ...file,

                                        isCached:
                                            await isFileCached(
                                                file
                                            )
                                    })
                                )
                            )
                            : [];

                    setFiles(
                        finalFiles
                    );

                    // aggiorna cache
                    await saveCachedFiles(
                        finalFiles
                    );

                    await saveLastSync();

                    markServerAlive();

                } catch (
                error
                ) {

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