import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getCurrentUser, saveStorageUsage, getStorageUsage, saveCurrentUser } from "../../utils/storage";
import { getBaseUrl } from "../../utils/api";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { useServerStatus } from "../../context/ServerContext";
import { generateSalt, deriveMasterKey, encryptMasterKey, decryptMasterKey } from "../../utils/crypto";
import { getMasterKey, saveMasterKey } from "../../utils/secureStorage";


export default function AccountScreen() {

    const { serverOnline } = useServerStatus();

    const [user, setUser] = useState(null);

    const [usedStorage, setUsedStorage] = useState("0 MB");

    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [changingPassword, setChangingPassword] =
        useState(false);

    useFocusEffect(

        React.useCallback(
            () => {

                loadUser();

            },
            []
        )
    );

    async function
        loadUser() {

        const cachedStorage =
            await getStorageUsage();

        if (
            cachedStorage
        ) {

            setUsedStorage(
                cachedStorage
            );
        }

        try {

            const currentUser =
                await getCurrentUser();

            console.log(
                "Current user:",
                currentUser
            );

            setUser(
                currentUser
            );

            await loadStorageUsage(currentUser.id);

        } catch (error) {

            console.error(
                "Load user error:",
                error
            );
        }
    }

    async function loadStorageUsage(userId) {

        if (
            !serverOnline
        ) {
            return;
        }

        try {

            const baseUrl =
                await getBaseUrl();

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () =>
                        controller.abort(),
                    700
                );

            const response =
                await fetch(
                    `${baseUrl}/files/storage/${userId}`,
                    {
                        signal:
                            controller.signal,
                    }
                );

            clearTimeout(
                timeout
            );

            const data =
                await response
                    .json();

            console.log(
                "Storage:",
                data
            );

            const bytes =
                data.total;

            let formattedStorage =
                "0 MB";

            if (
                bytes < 1024
            ) {

                formattedStorage =
                    `${bytes} B`;

            } else if (
                bytes <
                1024 * 1024
            ) {

                formattedStorage =
                    `${(
                        bytes / 1024
                    ).toFixed(2)} KB`;

            } else if (
                bytes <
                1024 *
                1024 *
                1024
            ) {

                formattedStorage =
                    `${(
                        bytes /
                        (
                            1024 *
                            1024
                        )
                    ).toFixed(2)} MB`;

            } else {

                formattedStorage =
                    `${(
                        bytes /
                        (
                            1024 *
                            1024 *
                            1024
                        )
                    ).toFixed(2)} GB`;
            }

            setUsedStorage(
                formattedStorage
            );

            await saveStorageUsage(
                formattedStorage
            );

        } catch (error) {

            console.log(
                "Storage unavailable"
            );
        }
    }

    // Cambio password
    async function
        changePassword() {

        if (
            !currentPassword
            ||
            !newPassword
            ||
            !confirmPassword
        ) {

            Alert.alert(
                "Errore",
                "Compila tutti i campi"
            );

            return;
        }

        if (
            newPassword.length
            < 8
        ) {

            Alert.alert(
                "Errore",
                "La nuova password deve contenere almeno 8 caratteri"
            );

            return;
        }

        if (
            newPassword
            !==
            confirmPassword
        ) {

            Alert.alert(
                "Errore",
                "Le password non coincidono"
            );

            return;
        }

        if (
            currentPassword
            ===
            newPassword
        ) {

            Alert.alert(
                "Errore",
                "La nuova password deve essere diversa dalla precedente"
            );

            return;
        }

        try {

            setChangingPassword(
                true
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        50
                    )
            );

            const unlockKey =
                await deriveMasterKey(

                    currentPassword,

                    user
                        .encryption_salt
                );

            let masterKey;

            try {

                masterKey =
                    decryptMasterKey(

                        user
                            .encrypted_master_key,

                        unlockKey,

                        user
                            .encrypted_master_key_iv
                    );

                if (
                    !masterKey
                ) {

                    throw new Error(
                        "INVALID_PASSWORD"
                    );
                }

            } catch {

                Alert.alert(
                    "Errore",
                    "Password attuale non valida"
                );

                return;
            }

            const newSalt =
                await generateSalt();

            const newUnlockKey =
                await deriveMasterKey(

                    newPassword,

                    newSalt
                );

            const encryptedData =
                await encryptMasterKey(

                    masterKey,

                    newUnlockKey
                );

            const baseUrl =
                await getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/auth/change-password`,
                    {

                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                userId:
                                    user.id,

                                currentPassword,

                                newPassword,

                                encryption_salt:
                                    newSalt,

                                encrypted_master_key:
                                    encryptedData
                                        .encrypted_master_key,

                                encrypted_master_key_iv:
                                    encryptedData
                                        .encrypted_master_key_iv
                            }),
                    }
                );

            const data =
                await response
                    .json();

            if (
                !response.ok
            ) {

                throw new Error(
                    data.error
                );
            }

            await saveMasterKey(
                masterKey
            );

            const updatedUser = {

                ...user,

                encryption_salt:
                    newSalt,

                encrypted_master_key:
                    encryptedData
                        .encrypted_master_key,

                encrypted_master_key_iv:
                    encryptedData
                        .encrypted_master_key_iv
            };

            setUser(
                updatedUser
            );

            await saveCurrentUser(
                updatedUser
            );

            setCurrentPassword(
                ""
            );

            setNewPassword(
                ""
            );

            setConfirmPassword(
                ""
            );

            setShowPasswordModal(
                false
            );

            Alert.alert(
                "Password aggiornata",
                "La password è stata aggiornata con successo"
            );

        } catch (
        error
        ) {

            Alert.alert(
                "Errore",
                error.message
                ||
                "Cambio password fallito"
            );

        } finally {

            setChangingPassword(
                false
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
                    paddingHorizontal: 20,
                    paddingTop: 10,
                    flexGrow: 1
                }}

                showsVerticalScrollIndicator={false}
            >
                {/* Titolo */}
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "700",
                        marginBottom: 24,
                    }}
                >
                    Account
                </Text>

                {/* Avatar */}
                <View
                    style={{
                        alignItems: "center",
                        marginBottom: 28,
                    }}
                >
                    <View
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 45,
                            backgroundColor: "#EAEAEA",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <Ionicons
                            name="person"
                            size={40}
                            color="gray"
                        />
                    </View>

                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: "600",
                        }}
                    >
                        {user?.first_name}{" "}{user?.last_name}
                    </Text>

                    <Text
                        style={{
                            color: "gray",
                            marginTop: 4,
                        }}
                    >
                        @{user?.username}
                    </Text>
                </View>

                {/* PROFILO */}
                <SectionTitle title="PROFILO" />

                <View style={styles.card}>
                    <InfoRow
                        icon="person-outline"
                        label="Nome"
                        value={
                            user?.first_name
                        }
                    />

                    <InfoRow
                        icon="person-outline"
                        label="Cognome"
                        value={
                            user?.last_name
                        }
                    />

                    <InfoRow
                        icon="at-outline"
                        label="Username"
                        value={
                            user?.username
                        }
                    />

                    <InfoRow
                        icon="mail-outline"
                        label="Email"
                        value={
                            user?.email
                        }
                    />

                </View>

                {/* SICUREZZA */}
                <SectionTitle title="SICUREZZA" />

                <View style={styles.card}>
                    <InfoRow
                        icon="lock-closed-outline"
                        label="Password"
                        value="••••••••"
                    />

                    <TouchableOpacity
                        onPress={() =>
                            setShowPasswordModal(
                                true
                            )
                        }
                    >
                        <ActionRow
                            icon="key-outline"
                            label="Cambia password"
                        />
                    </TouchableOpacity>
                </View>

                {/* STORAGE */}
                <SectionTitle title="STORAGE" />

                <View style={styles.card}>
                    <InfoRow
                        icon="cloud-outline"
                        label="Spazio occupato"
                        value={usedStorage}
                    />
                </View>
            </ScrollView>
            {showPasswordModal && (

                <View
                    style={{
                        position:
                            "absolute",

                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,

                        backgroundColor:
                            "rgba(0,0,0,0.35)",

                        justifyContent:
                            "center",

                        padding:
                            20,
                    }}
                >

                    <View
                        style={{
                            backgroundColor:
                                "#fff",

                            borderRadius:
                                20,

                            padding:
                                24,

                            width:
                                "100%",

                            maxWidth:
                                420,
                        }}
                    >

                        <Text
                            style={{
                                fontSize:
                                    22,

                                fontWeight:
                                    "700",

                                marginBottom:
                                    18,
                            }}
                        >
                            Cambia password
                        </Text>

                        <TextInput

                            placeholder=
                            "Password attuale"

                            value={
                                currentPassword
                            }

                            onChangeText={
                                setCurrentPassword
                            }

                            secureTextEntry
                            style={{
                                width:
                                    "100%",

                                backgroundColor:
                                    "#F8F8F8",

                                borderRadius:
                                    16,

                                borderWidth:
                                    1,

                                borderColor:
                                    "#E5E5E5",

                                paddingHorizontal:
                                    18,

                                paddingVertical:
                                    16,

                                fontSize:
                                    17,

                                color:
                                    "#000",

                                marginBottom:
                                    14,
                            }}
                        />

                        <TextInput
                            placeholder=
                            "Nuova password"

                            value={
                                newPassword
                            }

                            onChangeText={
                                setNewPassword
                            }

                            secureTextEntry
                            style={{
                                width:
                                    "100%",

                                backgroundColor:
                                    "#F8F8F8",

                                borderRadius:
                                    16,

                                borderWidth:
                                    1,

                                borderColor:
                                    "#E5E5E5",

                                paddingHorizontal:
                                    18,

                                paddingVertical:
                                    16,

                                fontSize:
                                    17,

                                color:
                                    "#000",

                                marginBottom:
                                    14,
                            }}
                        />

                        <TextInput
                            placeholder=
                            "Conferma password"

                            value={
                                confirmPassword
                            }

                            onChangeText={
                                setConfirmPassword
                            }

                            secureTextEntry
                            style={{
                                width:
                                    "100%",

                                backgroundColor:
                                    "#F8F8F8",

                                borderRadius:
                                    16,

                                borderWidth:
                                    1,

                                borderColor:
                                    "#E5E5E5",

                                paddingHorizontal:
                                    18,

                                paddingVertical:
                                    16,

                                fontSize:
                                    17,

                                color:
                                    "#000",

                                marginBottom:
                                    14,
                            }}
                        />

                        <View
                            style={{
                                flexDirection:
                                    "row",

                                justifyContent:
                                    "flex-end",

                                gap:
                                    12,

                                marginTop:
                                    12,
                            }}
                        >

                            <TouchableOpacity
                                onPress={() =>
                                    setShowPasswordModal(
                                        false
                                    )
                                }

                                style={{
                                    paddingHorizontal:
                                        18,

                                    paddingVertical:
                                        12,

                                    borderRadius:
                                        12,

                                    borderWidth:
                                        1,

                                    borderColor:
                                        "#E5E5E5",

                                    backgroundColor:
                                        "#F8F8F8",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize:
                                            16,

                                        fontWeight:
                                            "500",

                                        color:
                                            "#333",
                                    }}
                                >
                                    Annulla
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={
                                    changePassword
                                }

                                disabled={
                                    changingPassword
                                }

                                style={{
                                    backgroundColor:
                                        "#007AFF",

                                    paddingHorizontal:
                                        18,

                                    paddingVertical:
                                        12,

                                    borderRadius:
                                        12,
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            "#fff",

                                        fontWeight:
                                            "600",

                                        fontSize:
                                            16,
                                    }}
                                >
                                    {
                                        changingPassword
                                            ? "Aggiornamento..."
                                            : "Aggiorna"
                                    }
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            )}
            {
                changingPassword
                && (

                    <View
                        style={{
                            position:
                                "absolute",

                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,

                            backgroundColor:
                                "rgba(0,0,0,0.45)",

                            justifyContent:
                                "center",

                            alignItems:
                                "center",

                            zIndex:
                                999,
                        }}
                    >

                        <View
                            style={{
                                backgroundColor:
                                    "white",

                                padding:
                                    24,

                                borderRadius:
                                    16,

                                alignItems:
                                    "center",

                                width:
                                    "80%",
                            }}
                        >

                            <Text
                                style={{
                                    fontSize:
                                        18,

                                    fontWeight:
                                        "600",

                                    textAlign:
                                        "center",
                                }}
                            >
                                🔐 Aggiornamento
                                sicurezza account...
                            </Text>

                            <Text
                                style={{
                                    marginTop:
                                        10,

                                    color:
                                        "gray",

                                    textAlign:
                                        "center",

                                    lineHeight:
                                        22,
                                }}
                            >
                                Ricifratura della
                                chiave master in corso
                            </Text>

                        </View>

                    </View>
                )
            }
        </SafeAreaView>
    );
}

function SectionTitle({ title }) {
    return (
        <Text
            style={{
                color: "gray",
                fontWeight: "600",
                marginBottom: 8,
            }}
        >
            {title}
        </Text>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 18,
            }}
        >
            <Ionicons
                name={icon}
                size={22}
            />

            <Text
                style={{
                    flex: 1,
                    marginLeft: 14,
                    fontSize: 16,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    color: "gray",
                }}
            >
                {value}
            </Text>
        </View>
    );
}

function ActionRow({ icon, label }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 18,
            }}
        >
            <Ionicons
                name={icon}
                size={22}
            />

            <Text
                style={{
                    flex: 1,
                    marginLeft: 14,
                    fontSize: 16,
                }}
            >
                {label}
            </Text>

            <Ionicons
                name="chevron-forward"
                size={18}
                color="gray"
            />
        </View>
    );
}

const styles = {
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#ECECEC",
        marginBottom: 22,
    },
};