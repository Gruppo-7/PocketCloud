import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect } from "react";

const SyncContext = createContext();

export function SyncProvider({
    children
}) {

    const [
        syncStates,
        setSyncStates
    ] =
        useState(
            {}
        );

    const STORAGE_KEY =
        "pocketcloud_sync_states";

    useEffect(
        () => {

            async function
                loadSyncStates() {

                try {

                    const saved =
                        await AsyncStorage
                            .getItem(
                                STORAGE_KEY
                            );

                    if (
                        saved
                    ) {

                        const parsed =
                            JSON.parse(
                                saved
                            );

                        const DAY_MS =
                            24
                            * 60
                            * 60
                            * 1000;

                        const now =
                            Date.now();

                        const cleaned =
                            Object.fromEntries(

                                Object.entries(
                                    parsed
                                ).filter(

                                    ([_, state]) => {

                                        const age =
                                            now
                                            -
                                            (
                                                state.updatedAt
                                                || 0
                                            );

                                        return (
                                            age
                                            < DAY_MS
                                        );
                                    }
                                )
                            );

                        setSyncStates(
                            cleaned
                        );
                    }

                } catch (
                error
                ) {

                    console.warn(
                        "Load sync states error:",
                        error
                    );
                }
            }

            loadSyncStates();

        },

        []
    );

    useEffect(
        () => {

            async function
                saveSyncStates() {

                try {

                    await AsyncStorage
                        .setItem(

                            STORAGE_KEY,

                            JSON.stringify(
                                syncStates
                            )
                        );

                } catch (
                error
                ) {

                    console.warn(
                        "Save sync states error:",
                        error
                    );
                }
            }

            saveSyncStates();

        },

        [syncStates]
    );

    function
        updateFileState(
            fileId,
            state,
            progress = 0,
            fileName = null
        ) {

        setSyncStates(
            prev => ({

                ...prev,

                [fileId]:
                {
                    state,
                    progress,
                    fileName,

                    updatedAt:
                        Date.now()
                }
            })
        );
    }

    function
        removeFileState(
            fileId
        ) {

        setSyncStates(
            prev => {

                const updated =
                {
                    ...prev
                };

                if (
                    updated[
                    fileId
                    ]
                ) {

                    delete updated[
                        fileId
                    ];
                }

                return updated;
            }
        );
    }

    function getFileState(fileId) {

        return (
            syncStates[fileId]
            ||
            {
                state: "synced",
                progress: 0
            }
        );
    }

    return (

        <SyncContext.Provider
            value={{
                syncStates,
                updateFileState,
                removeFileState,
                getFileState
            }}
        >
            {
                children
            }
        </SyncContext.Provider>
    );
}

export function
    useSyncStatus() {

    return useContext(
        SyncContext
    );
}

export async function
    clearSyncStates() {

    await AsyncStorage
        .removeItem(
            "pocketcloud_sync_states"
        );
}