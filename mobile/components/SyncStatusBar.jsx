import { View, Text } from "react-native";
import { useServerStatus } from "../context/ServerContext";
import { useEffect, useState } from "react";
import { getLastSync } from "../utils/storage";
import { useSyncStatus } from "../context/SyncContext";

export default function SyncStatusBar() {

    const { syncStates } = useSyncStatus();

    const {
        serverOnline
    } =
        useServerStatus();

    const [
        lastSync,
        setLastSync
    ] =
        useState(
            null
        );

    useEffect(() => {

        async function
            loadSync() {

            const sync =
                await getLastSync();

            setLastSync(
                sync
            );
        }

        loadSync();

    }, [
        serverOnline
    ]);

    function getGlobalSyncState() {

        const states =
            Object.values(syncStates);

        if (
            states.some(
                s => s.state === "error"
            )
        ) {
            return "error";
        }

        if (
            states.some(
                s => s.state === "encrypting"
            )
        ) {
            return "encrypting";
        }

        if (
            states.some(
                s => s.state === "synced"
            )
        ) {
            return "synced";
        }

        if (
            states.some(
                s => s.state === "syncing"
            )
        ) {
            return "syncing";
        }

        if (
            states.some(
                s => s.state === "waiting_server"
            )
        ) {
            return "waiting_server";
        }

        return "online";
    }

    function
        getSyncText() {

        if (
            !lastSync
        ) {

            return "Mai";
        }

        const seconds =
            Math.floor(
                (
                    Date.now()
                    -
                    new Date(
                        lastSync
                    )
                )
                / 1000
            );

        if (
            seconds < 10
        ) {

            return "adesso";
        }

        if (
            seconds < 60
        ) {

            return `${seconds}s fa`;
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        return `${minutes} min fa`;
    }

    return (

        <View
            style={{
                borderTopWidth:
                    1,

                borderTopColor:
                    "#ECECEC",

                paddingVertical:
                    10,

                paddingHorizontal:
                    20,

                backgroundColor:
                    "#F5F5F5",
            }}
        >

            <Text
                style={{
                    textAlign:
                        "center",

                    fontSize:
                        13,

                    color:
                        "#666",
                }}
            >
                {
                    !serverOnline

                        ? `🔴 Offline · Ultimo sync ${getSyncText()}`

                        : getGlobalSyncState() === "encrypting"

                            ? "🔒 Crittografia in corso"

                            : getGlobalSyncState() === "syncing"

                                ? "⟳ Upload in corso"

                                : getGlobalSyncState() === "waiting_server"

                                    ? "⏸ In attesa server"

                                    : getGlobalSyncState() === "error"

                                        ? "⚠️ Alcuni upload hanno fallito"

                                        : getGlobalSyncState() === "synced"

                                            ? "✅ Upload completato"

                                            : `🟢 Online · Sync ${getSyncText()}`
                }
            </Text>

        </View>
    );
}