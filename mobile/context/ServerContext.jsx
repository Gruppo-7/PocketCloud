import { createContext, useContext, useEffect, useState } from "react";

import { AppState } from "react-native";

import { getBaseUrl } from "../utils/api";

const ServerContext =
    createContext();

export function
    ServerProvider({
        children,
    }) {

    const [
        serverOnline,
        setServerOnline,
    ] = useState(
        false
    );

    const [
        serverChecked,
        setServerChecked,
    ] = useState(
        false
    );

    const [
        lastCheck,
        setLastCheck,
    ] = useState(
        null
    );

    async function
        checkServer() {

        try {

            const baseUrl =
                await getBaseUrl();

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () =>
                        controller.abort(),
                    1000
                );

            const response =
                await fetch(
                    `${baseUrl}/health`,
                    {
                        signal:
                            controller.signal,
                    }
                );

            clearTimeout(
                timeout
            );

            const online =
                response.ok;

            setServerOnline(
                online
            );

            setServerChecked(
                true
            );

            setLastCheck(
                new Date()
            );

            console.log(
                online
                    ? "🟢 Server online"
                    : "🔴 Server offline"
            );

        } catch {

            setServerOnline(
                false
            );

            setServerChecked(
                true
            );

            setLastCheck(
                new Date()
            );

            console.log(
                "🔴 Server offline"
            );
        }
    }

    useEffect(() => {

        checkServer();

        const interval =
            setInterval(
                checkServer,
                5000
            );

        const subscription =
            AppState
                .addEventListener(
                    "change",
                    state => {

                        if (
                            state ===
                            "active"
                        ) {
                            checkServer();
                        }
                    }
                );

        return () => {

            clearInterval(
                interval
            );

            subscription
                .remove();
        };
    }, []);

    return (
        <ServerContext.Provider
            value={{
                serverOnline,
                serverChecked,
                lastCheck,
                checkServer,
            }}
        >
            {children}
        </ServerContext.Provider>
    );
}

export function
    useServerStatus() {

    return useContext(
        ServerContext
    );
}