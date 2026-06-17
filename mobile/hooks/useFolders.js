import { useEffect, useState } from "react";

import { getCurrentUser, getCachedFolders, saveCachedFolders, saveLastSync } from "../utils/storage";

import { getBaseUrl } from "../utils/api";

import { useServerStatus } from "../context/ServerContext";

export default function useFolders() {

    const [
        folders,
        setFolders
    ] =
        useState([]);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const {
        serverOnline,
        serverChecked
    } =
        useServerStatus();

    async function
        loadFolders() {

        try {

            const user =
                await getCurrentUser();

            if (
                !user
            ) {

                setFolders(
                    []
                );

                setLoading(
                    false
                );

                return;
            }

            // CACHE FIRST
            const cachedFolders =
                await getCachedFolders();

            if (
                cachedFolders.length > 0
            ) {

                setFolders(
                    cachedFolders
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
                    `${baseUrl}/folders/${user.id}`
                );

            const data =
                await response
                    .json();

            const finalFolders =
                Array.isArray(
                    data
                )
                    ? data
                    : [];

            setFolders(
                finalFolders
            );

            // aggiorna cache
            await saveCachedFolders(
                finalFolders
            );

            await saveLastSync();

        } catch (
        error
        ) {

            console.error(
                "Load folders error:",
                error
            );

        } finally {

            setLoading(
                false
            );
        }
    }

    useEffect(() => {

        loadFolders();

    }, [
        serverOnline,
        serverChecked
    ]);

    return {

        folders,

        setFolders,

        reloadFolders:
            loadFolders,

        loading,
    };
}