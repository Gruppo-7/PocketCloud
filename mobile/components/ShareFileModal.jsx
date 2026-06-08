import { Modal, View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useState, useEffect } from "react";

export default function
    ShareFileModal({

        visible,

        file,

        onClose,

        onShare,
    }) {

    const [username, setUsername] = useState("");

    const [permission, setPermission] = useState("read");

    const [loading, setLoading] = useState(false);

    useEffect(
        () => {

            if (
                !visible
            ) {

                setUsername(
                    ""
                );

                setPermission(
                    "read"
                );
            }

        },
        [visible]
    );

    async function
        handleShare() {

        if (
            !username
                .trim()
        ) {
            return;
        }

        try {

            setLoading(
                true
            );

            await onShare({

                file,

                username:
                    username
                        .trim(),

                permission,
            });

        } finally {

            setLoading(
                false
            );
        }
    }

    return (

        <Modal
            visible={
                visible
            }

            transparent

            animationType=
            "fade"

            onRequestClose={
                onClose
            }
        >

            <Pressable
                onPress={
                    onClose
                }

                style={{
                    flex: 1,

                    backgroundColor:
                        "rgba(0,0,0,0.25)",

                    justifyContent:
                        "center",

                    alignItems:
                        "center",

                    padding:
                        24,
                }}
            >

                <Pressable
                    onPress={() => { }}

                    style={{
                        width:
                            "100%",

                        maxWidth:
                            340,

                        backgroundColor:
                            "#fff",

                        borderRadius:
                            24,

                        padding:
                            22,
                    }}
                >

                    <Text
                        style={{
                            fontSize:
                                22,

                            fontWeight:
                                "700",

                            marginBottom:
                                8,
                        }}
                    >
                        Condividi file
                    </Text>

                    <Text
                        style={{
                            color:
                                "#666",

                            marginBottom:
                                20,
                        }}
                    >
                        {
                            file?.name
                        }
                    </Text>

                    <TextInput
                        value={
                            username
                        }

                        onChangeText={
                            setUsername
                        }

                        placeholder=
                        "Username utente"

                        autoCapitalize=
                        "none"

                        style={{
                            borderWidth:
                                1,

                            borderColor:
                                "#ECECEC",

                            borderRadius:
                                12,

                            padding:
                                14,

                            marginBottom:
                                18,
                        }}
                    />

                    <Text
                        style={{
                            fontWeight:
                                "600",

                            marginBottom:
                                12,
                        }}
                    >
                        Permesso
                    </Text>

                    <View
                        style={{
                            flexDirection:
                                "row",

                            gap:
                                12,

                            marginBottom:
                                28,
                        }}
                    >

                        <TouchableOpacity
                            onPress={() =>
                                setPermission(
                                    "read"
                                )
                            }

                            style={{
                                flex: 1,

                                padding:
                                    14,

                                borderRadius:
                                    12,

                                borderWidth:
                                    1,

                                borderColor:
                                    permission
                                        ===
                                        "read"
                                        ? "#007AFF"
                                        : "#ECECEC",

                                alignItems:
                                    "center",
                            }}
                        >
                            <Text>
                                Lettura
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                setPermission(
                                    "write"
                                )
                            }

                            style={{
                                flex: 1,

                                padding:
                                    14,

                                borderRadius:
                                    12,

                                borderWidth:
                                    1,

                                borderColor:
                                    permission
                                        ===
                                        "write"
                                        ? "#007AFF"
                                        : "#ECECEC",

                                alignItems:
                                    "center",
                            }}
                        >
                            <Text>
                                Modifica
                            </Text>
                        </TouchableOpacity>

                    </View>

                    <View
                        style={{
                            flexDirection:
                                "row",

                            justifyContent:
                                "flex-end",

                            gap:
                                12,
                        }}
                    >

                        <TouchableOpacity
                            onPress={
                                onClose
                            }

                            style={{
                                paddingVertical:
                                    12,

                                paddingHorizontal:
                                    18,
                            }}
                        >
                            <Text>
                                Annulla
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={
                                handleShare
                            }

                            disabled={
                                loading
                            }

                            style={{
                                backgroundColor:
                                    "#007AFF",

                                borderRadius:
                                    12,

                                paddingVertical:
                                    12,

                                paddingHorizontal:
                                    18,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        "#fff",

                                    fontWeight:
                                        "600",
                                }}
                            >
                                {
                                    loading
                                        ? "Condivisione..."
                                        : "Condividi"
                                }
                            </Text>
                        </TouchableOpacity>

                    </View>

                </Pressable>

            </Pressable>

        </Modal>
    );
}