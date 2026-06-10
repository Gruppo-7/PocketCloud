import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { saveServerAddress } from "../../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "../../utils/api";

export default function SetupScreen() {

    // Indirizzo server
    const [serverAddress, setServerAddress] = useState("");

    // Stato connessione
    const [connectionStatus, setConnectionStatus] = useState("idle");

    const [isTesting, setIsTesting] = useState(false);

    // Validazione IP o dominio
    function isValidServerAddress(address) {

        const ipRegex =
            /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

        const domainRegex =
            /^(localhost|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

        return (
            ipRegex.test(address) ||
            domainRegex.test(address)
        );
    }

    // Test connessione mock
    async function
        testConnection() {

        if (!serverAddress) {

            Alert.alert(
                "Errore",
                "Inserisci un indirizzo server"
            );

            return;
        }

        if (
            !isValidServerAddress(
                serverAddress
            )
        ) {

            Alert.alert(
                "Errore",
                "Inserisci un IP o dominio valido"
            );

            return;
        }

        setIsTesting(
            true
        );

        setConnectionStatus(
            "idle"
        );

        try {

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => {

                        controller
                            .abort();

                    },
                    1100
                );

            const response =
                await fetch(
                    `http://${serverAddress}/health`,
                    {
                        signal:
                            controller
                                .signal,
                    }
                );

            clearTimeout(
                timeout
            );

            if (
                !response.ok
            ) {

                throw new Error(
                    "Server error"
                );
            }

            const data =
                await response
                    .json();

            if (
                data.status ===
                "online"
            ) {

                setConnectionStatus(
                    "success"
                );

                Alert.alert(
                    "Connessione riuscita",
                    `Server raggiungibile\nhttp://${serverAddress}`
                );

            } else {

                throw new Error(
                    "Server offline"
                );
            }

        } catch (error) {

            console.log(
                "Connection error:",
                error
            );

            setConnectionStatus(
                "error"
            );

            Alert.alert(
                "Errore",
                "Server non raggiungibile"
            );

        } finally {

            setIsTesting(
                false
            );
        }
    }

    // Continua
    async function continueSetup() {

        try {

            // Salva server
            await saveServerAddress(
                serverAddress
            );

            Alert.alert(
                "Configurazione",
                "Server salvato"
            );

            // Vai al login
            router.replace(
                "/auth"
            );

        } catch (error) {

            Alert.alert(
                "Errore",
                "Impossibile salvare il server"
            );
        }
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#F5F5F5",
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    padding: 20,
                }}

                showsVerticalScrollIndicator={false}
            >

                {/* Logo */}
                <View
                    style={{
                        alignItems: "center",
                        marginBottom: 30,
                    }}
                >
                    <Ionicons
                        name="cloud-outline"
                        size={64}
                    />

                    <Text
                        style={{
                            fontSize: 30,
                            fontWeight: "700",
                            marginTop: 10,
                        }}
                    >
                        PocketCloud
                    </Text>
                </View>

                {/* Card */}
                <View
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: 22,
                        padding: 22,
                        borderWidth: 1,
                        borderColor: "#ECECEC",
                    }}
                >

                    {/* Titolo */}
                    <Text
                        style={{
                            fontSize: 24,
                            fontWeight: "700",
                            marginBottom: 10,
                        }}
                    >
                        Configura server
                    </Text>

                    <Text
                        style={{
                            color: "gray",
                            marginBottom: 20,
                            lineHeight: 22,
                        }}
                    >
                        Inserisci l'indirizzo IP locale
                        o il dominio del server
                        PocketCloud.
                    </Text>

                    {/* Campo server */}
                    <TextInput
                        placeholder="192.168.1.10"

                        value={serverAddress}

                        onChangeText={
                            setServerAddress
                        }

                        autoCapitalize="none"

                        style={{
                            backgroundColor:
                                "#F8F8F8",

                            borderRadius: 14,

                            borderWidth: 1,
                            borderColor:
                                "#ECECEC",

                            padding: 16,

                            fontSize: 16,

                            marginBottom: 16,
                        }}
                    />

                    {/* Stato connessione */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <Ionicons
                            name={
                                connectionStatus ===
                                    "success"
                                    ? "checkmark-circle"

                                    : connectionStatus ===
                                        "error"
                                        ? "close-circle"
                                        : "ellipse-outline"
                            }

                            size={20}

                            color={
                                connectionStatus ===
                                    "success"
                                    ? "green"

                                    : connectionStatus ===
                                        "error"
                                        ? "red"
                                        : "gray"
                            }
                        />

                        <Text
                            style={{
                                marginLeft: 8,
                                color: "gray",
                            }}
                        >
                            {connectionStatus ===
                                "success"
                                ? "Server raggiungibile"

                                : connectionStatus ===
                                    "error"
                                    ? "Server non disponibile"

                                    : "Non verificato"}
                        </Text>
                    </View>

                    {/* Test connessione */}
                    <TouchableOpacity
                        disabled={
                            isTesting
                        }

                        onPress={
                            testConnection
                        }

                        style={{
                            backgroundColor:
                                "#000",

                            borderRadius: 16,

                            alignItems:
                                "center",

                            paddingVertical:
                                16,

                            marginBottom:
                                12,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontWeight:
                                    "600",

                                fontSize: 16,
                            }}
                        >
                            {
                                isTesting
                                    ? "Verifica..."
                                    : "Test connessione"
                            }
                        </Text>
                    </TouchableOpacity>

                    {/* Continua */}
                    <TouchableOpacity
                        disabled={
                            connectionStatus !==
                            "success"
                        }

                        onPress={
                            continueSetup
                        }

                        style={{
                            backgroundColor:
                                connectionStatus ===
                                    "success"
                                    ? "#000"
                                    : "#BDBDBD",

                            borderRadius: 16,

                            alignItems:
                                "center",

                            paddingVertical:
                                16,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontWeight:
                                    "600",

                                fontSize: 16,
                            }}
                        >
                            Continua
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}