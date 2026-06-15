import { Modal, View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { getBaseUrl } from "../utils/api";

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

    const [existingShares, setExistingShares] = useState([]);

    const [loadingShares, setLoadingShares] = useState(false);

    useEffect(
        () => {

            if (
                file
                    ?.is_encrypted
            ) {

                setPermission(
                    "read"
                );
            }

        },

        [file]
    );

    useEffect(
        () => {

            if (
                visible
            ) {

                loadShares();

            } else {

                setUsername(
                    ""
                );

                setPermission(
                    "read"
                );

                setExistingShares(
                    []
                );
            }

        },
        [
            visible,
            file
        ]
    );

    async function
        loadShares() {

        if (
            !file?.id
        ) {
            return;
        }

        try {

            setLoadingShares(
                true
            );

            const baseUrl =
                await getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/shared/file/${file.id}`
                );

            const data =
                await response
                    .json();

            setExistingShares(
                Array.isArray(
                    data
                )
                    ? data
                    : []
            );

        } catch (
        error
        ) {

            console.error(
                "Load shares error:",
                error
            );

        } finally {

            setLoadingShares(
                false
            );
        }
    }

    async function
        handleTogglePermission(
            share
        ) {

        try {

            const newPermission =
                share.permission
                    === "read"
                    ? "write"
                    : "read";

            const baseUrl =
                await getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/shared/${share.share_id}`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                {
                                    permission:
                                        newPermission,
                                }
                            ),
                    }
                );

            const data =
                await response
                    .json();

            if (
                !response.ok
            ) {

                console.error(
                    data.error
                );

                return;
            }

            setExistingShares(
                (
                    prev
                ) =>
                    prev.map(
                        (
                            item
                        ) =>
                            item.share_id
                                ===
                                share.share_id
                                ? {
                                    ...item,

                                    permission:
                                        newPermission,
                                }
                                : item
                    )
            );

        } catch (
        error
        ) {

            console.error(
                "Update permission error:",
                error
            );
        }
    }

    function
        confirmRevoke(
            share
        ) {

        Alert.alert(
            "Revoca accesso",

            `Vuoi davvero revocare l'accesso a ${share.username}?`,

            [
                {
                    text:
                        "Annulla",

                    style:
                        "cancel",
                },

                {
                    text:
                        "Rimuovi",

                    style:
                        "destructive",

                    onPress:
                        () =>
                            handleRevoke(
                                share.share_id
                            ),
                },
            ]
        );
    }

    async function
        handleRevoke(
            shareId
        ) {

        try {

            const baseUrl =
                await getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/shared/${shareId}`,
                    {
                        method:
                            "DELETE",
                    }
                );

            const data =
                await response
                    .json();

            if (
                !response.ok
            ) {

                console.error(
                    data.error
                );

                return;
            }

            setExistingShares(
                (
                    prev
                ) =>
                    prev.filter(
                        (
                            share
                        ) =>
                            share.share_id
                            !==
                            shareId
                    )
            );

        } catch (
        error
        ) {

            console.error(
                "Revoke error:",
                error
            );
        }
    }

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
                        {
                            existingShares
                                .length > 0
                                ? "Gestione condivisione"
                                : "Condividi file"
                        }
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

                    {
                        existingShares
                            .length > 0 && (

                            <View
                                style={{
                                    backgroundColor:
                                        "#F7F8FA",

                                    borderRadius:
                                        16,

                                    padding:
                                        16,

                                    marginBottom:
                                        20,

                                    borderWidth:
                                        1,

                                    borderColor:
                                        "#ECECEC",
                                }}
                            >

                                <Text
                                    style={{
                                        fontSize:
                                            16,

                                        fontWeight:
                                            "700",

                                        marginBottom:
                                            14,
                                    }}
                                >
                                    Utenti con accesso
                                </Text>

                                <Text
                                    style={{
                                        fontSize:
                                            13,

                                        color:
                                            "#666",

                                        marginBottom:
                                            14,
                                    }}
                                >
                                    Tocca il permesso
                                    per modificarlo
                                </Text>

                                {
                                    existingShares
                                        .map(
                                            (
                                                share,
                                                index
                                            ) => (

                                                <View
                                                    key={
                                                        share.share_id
                                                    }

                                                    style={{
                                                        flexDirection:
                                                            "row",

                                                        justifyContent:
                                                            "space-between",

                                                        alignItems:
                                                            "center",

                                                        paddingVertical:
                                                            10,

                                                        borderBottomWidth:
                                                            index <
                                                                existingShares.length
                                                                - 1
                                                                ? 1
                                                                : 0,

                                                        borderBottomColor:
                                                            "#ECECEC",
                                                    }}
                                                >

                                                    <Text
                                                        style={{
                                                            fontSize:
                                                                15,

                                                            fontWeight:
                                                                "500",
                                                        }}
                                                    >
                                                        {
                                                            share.username
                                                        }
                                                    </Text>

                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                "row",

                                                            alignItems:
                                                                "center",

                                                            gap:
                                                                10,
                                                        }}
                                                    >

                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                handleTogglePermission(
                                                                    share
                                                                )
                                                            }

                                                            activeOpacity={0.7}

                                                            style={{
                                                                backgroundColor:
                                                                    share.permission
                                                                        === "read"
                                                                        ? "#EAF3FF"
                                                                        : "#EEF8EE",

                                                                paddingHorizontal:
                                                                    10,

                                                                paddingVertical:
                                                                    6,

                                                                borderRadius:
                                                                    999,
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize:
                                                                        13,

                                                                    fontWeight:
                                                                        "600",

                                                                    color:
                                                                        share.permission
                                                                            === "read"
                                                                            ? "#007AFF"
                                                                            : "#34C759",
                                                                }}
                                                            >
                                                                {
                                                                    share.permission
                                                                        ===
                                                                        "read"
                                                                        ? "Lettura"
                                                                        : "Modifica"
                                                                }
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                confirmRevoke(
                                                                    share
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={{
                                                                    color:
                                                                        "#FF3B30",

                                                                    fontWeight:
                                                                        "600",
                                                                }}
                                                            >
                                                                Rimuovi
                                                            </Text>
                                                        </TouchableOpacity>

                                                    </View>

                                                </View>
                                            ))
                                }

                            </View>
                        )
                    }

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
                                16,
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

                        {
                            !file
                                ?.is_encrypted
                            && (

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
                            )
                        }

                    </View>

                    {
                        file?.is_encrypted
                        && (

                            <Text
                                style={{
                                    fontSize:
                                        13,

                                    color:
                                        "#666",

                                    marginBottom:
                                        24,
                                }}
                            >
                                I file crittografati
                                supportano solo
                                accesso in lettura.
                            </Text>
                        )
                    }

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

        </Modal >
    );
}