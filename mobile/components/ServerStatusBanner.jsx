import {
    Text,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import {
    SafeAreaView,
} from
    "react-native-safe-area-context";

import {
    useServerStatus,
} from "../context/ServerContext";

export default function
    ServerStatusBanner() {

    const {
        serverOnline,
    } =
        useServerStatus();

    const [
        showConnected,
        setShowConnected,
    ] = useState(
        false
    );

    useEffect(() => {

        if (
            serverOnline
        ) {

            setShowConnected(
                true
            );

            const timer =
                setTimeout(
                    () => {
                        setShowConnected(
                            false
                        );
                    },
                    2000
                );

            return () =>
                clearTimeout(
                    timer
                );
        }
    }, [
        serverOnline
    ]);

    if (
        !serverOnline
    ) {

        return (
            <SafeAreaView
                edges={["top"]}

                style={{
                    backgroundColor:
                        "#E53935",

                    alignItems:
                        "center",

                    paddingVertical:
                        4,
                }}
            >
                <Text
                    style={{
                        color:
                            "#fff",

                        fontSize:
                            16,

                        fontWeight:
                            "700",

                        letterSpacing:
                            0.5,

                        textTransform:
                            "uppercase",
                    }}
                >
                    Server
                    PocketCloud
                    offline
                </Text>
            </SafeAreaView>
        );
    }

    if (
        showConnected
    ) {

        return (
            <SafeAreaView
                edges={["top"]}

                style={{
                    backgroundColor:
                        "#43A047",

                    alignItems:
                        "center",

                    paddingVertical:
                        4,
                }}
            >
                <Text
                    style={{
                        color:
                            "#fff",

                        fontSize:
                            16,

                        fontWeight:
                            "700",

                        letterSpacing:
                            0.5,

                        textTransform:
                            "uppercase",
                    }}
                >
                    Server PocketCloud
                    Connesso
                </Text>
            </SafeAreaView>
        );
    }

    return null;
}