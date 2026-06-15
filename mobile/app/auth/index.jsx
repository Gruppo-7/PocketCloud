import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { saveLoginState, saveCurrentUser } from "../../utils/storage";
import { removeServerAddress, logout } from "../../utils/storage";
import { getBaseUrl } from "../../utils/api";
import { generateSalt, deriveMasterKey, cleanupTemporaryFiles, generateMasterKey, encryptMasterKey, decryptMasterKey } from "../../utils/crypto";
import { saveMasterKey, getMasterKey } from "../../utils/secureStorage";

export default function AuthScreen() {

    // Login o registrazione
    const [isLogin, setIsLogin] = useState(true);

    // Campi comuni
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Registrazione
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [preparingSecureSession, setPreparingSecureSession] = useState(false);
    const [creatingAccount, setCreatingAccount] = useState(false);

    // Verifica email
    function isValidEmail(email) {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(
            email
        );
    }

    // Password minima
    function isValidPassword(password) {

        return (
            password.length >= 8
        );
    }

    // Username valido
    function isValidUsername(username) {

        return (
            username.length >= 3 &&
            !username.includes(" ")
        );
    }

    // Login
    async function
        handleLogin() {

        if (
            !email ||
            !password
        ) {

            Alert.alert(
                "Errore",
                "Compila tutti i campi"
            );

            return;
        }

        if (
            !isValidEmail(
                email
            )
        ) {

            Alert.alert(
                "Errore",
                "Inserisci una email valida"
            );

            return;
        }

        try {

            const baseUrl =
                await getBaseUrl();

            const response =
                await fetch(
                    `${baseUrl}/auth/login`,
                    {

                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                email,
                                password,
                            }),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok
            ) {

                throw new Error(
                    data.error
                );
            }

            try {

                if (
                    !data.user
                        .encryption_salt
                ) {

                    console.log(
                        "Legacy user detected"
                    );

                    await saveLoginState(
                        true
                    );

                    await saveCurrentUser(
                        data.user
                    );

                    Alert.alert(
                        "Login",
                        "Accesso eseguito"
                    );

                    router.replace(
                        "/(tabs)/file"
                    );

                    return;
                }

                setPreparingSecureSession(
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

                        password,

                        data.user
                            .encryption_salt
                    );

                const masterKey =
                    decryptMasterKey(

                        data.user
                            .encrypted_master_key,

                        unlockKey,

                        data.user
                            .encrypted_master_key_iv
                    );

                if (
                    !masterKey
                ) {

                    throw new Error(
                        "SECURE_SESSION_FAILED"
                    );
                }

                await saveMasterKey(
                    masterKey
                );

                const storedKey =
                    await getMasterKey();

                if (
                    !storedKey
                ) {

                    throw new Error(
                        "SECURE_SESSION_FAILED"
                    );
                }

            } finally {

                setPreparingSecureSession(
                    false
                );
            }

            await saveLoginState(
                true
            );

            await saveCurrentUser(
                data.user
            );

            Alert.alert(
                "Login",
                "Accesso eseguito"
            );

            router.replace(
                "/(tabs)/file"
            );

        } catch (error) {

            if (
                error.message
                ===
                "SECURE_SESSION_FAILED"
            ) {

                Alert.alert(

                    "Sessione sicura non disponibile",

                    "Impossibile inizializzare la sessione sicura.\n\nRiprova ad effettuare il login."
                );

                return;
            }

            Alert.alert(
                "Errore",
                error.message ||
                "Login fallito"
            );
        }
    }

    // Registrazione
    async function
        handleRegister() {

        if (
            !name ||
            !surname ||
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            Alert.alert(
                "Errore",
                "Compila tutti i campi"
            );

            return;
        }

        if (
            !isValidUsername(
                username
            )
        ) {

            Alert.alert(
                "Errore",
                "Username non valido"
            );

            return;
        }

        if (
            !isValidEmail(
                email
            )
        ) {

            Alert.alert(
                "Errore",
                "Inserisci una email valida"
            );

            return;
        }

        if (
            !isValidPassword(
                password
            )
        ) {

            Alert.alert(
                "Errore",
                "La password deve contenere almeno 8 caratteri"
            );

            return;
        }

        if (
            password !==
            confirmPassword
        ) {

            Alert.alert(
                "Errore",
                "Le password non coincidono"
            );

            return;
        }

        try {
            setCreatingAccount(
                true
            );

            const baseUrl =
                await getBaseUrl();

            const encryptionSalt =
                await generateSalt();

            const masterKey =
                await generateMasterKey();

            const passwordKey =
                await deriveMasterKey(
                    password,
                    encryptionSalt
                );

            const {
                encrypted_master_key,
                encrypted_master_key_iv
            } =
                await encryptMasterKey(

                    masterKey,

                    passwordKey
                );

            console.log({

                first_name:
                    name,

                last_name:
                    surname,

                username,

                email,

                password,

                encryption_salt:
                    encryptionSalt,

                encrypted_master_key,

                encrypted_master_key_iv
            });

            const response =
                await fetch(
                    `${baseUrl}/auth/register`,
                    {

                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({

                                first_name:
                                    name,

                                last_name:
                                    surname,

                                username,

                                email,

                                password,

                                encryption_salt:
                                    encryptionSalt,

                                encrypted_master_key,

                                encrypted_master_key_iv
                            }),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok
            ) {

                throw new Error(
                    data.error
                );
            }

            Alert.alert(
                "Registrazione",
                "Account creato"
            );

            setIsLogin(
                true
            );

        } catch (error) {

            Alert.alert(
                "Errore",
                error.message ||
                "Registrazione fallita"
            );

        } finally {

            setCreatingAccount(
                false
            );
        }
    }

    async function
        changeServer() {

        try {

            await cleanupTemporaryFiles();

            await logout();

            await removeServerAddress();

            router.replace(
                "/setup"
            );

        } catch (
        error
        ) {

            Alert.alert(
                "Errore",
                "Impossibile cambiare server"
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
                            marginBottom: 20,
                        }}
                    >
                        {isLogin
                            ? "Bentornato"
                            : "Crea account"}
                    </Text>

                    {/* Campi registrazione */}
                    {!isLogin && (
                        <>
                            <InputField
                                placeholder="Nome"
                                value={name}
                                onChangeText={setName}
                            />

                            <InputField
                                placeholder="Cognome"
                                value={surname}
                                onChangeText={setSurname}
                            />

                            <InputField
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </>
                    )}

                    {/* Email */}
                    <InputField
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Password */}
                    <InputField
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* Conferma password */}
                    {!isLogin && (
                        <InputField
                            placeholder="Conferma password"
                            value={confirmPassword}
                            onChangeText={
                                setConfirmPassword
                            }
                            secureTextEntry
                        />
                    )}

                    {/* Pulsante */}
                    <TouchableOpacity
                        onPress={
                            isLogin
                                ? handleLogin
                                : handleRegister
                        }

                        style={{
                            backgroundColor: "#000",
                            borderRadius: 16,
                            alignItems: "center",
                            paddingVertical: 16,
                            marginTop: 10,
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: 16,
                            }}
                        >
                            {isLogin
                                ? "Accedi"
                                : "Registrati"}
                        </Text>
                    </TouchableOpacity>

                    {/* Cambio modalità */}
                    <TouchableOpacity
                        onPress={function () {

                            setIsLogin(
                                !isLogin
                            );
                        }}

                        style={{
                            marginTop: 22,
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "gray",
                                textAlign:
                                    "center",
                            }}
                        >
                            {isLogin
                                ? "Non hai un account? Registrati"
                                : "Hai già un account? Accedi"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={
                            changeServer
                        }

                        style={{
                            marginTop: 14,
                            alignItems:
                                "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "gray",
                                fontSize: 14,
                            }}
                        >
                            Connetti a un altro server
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
            {
                preparingSecureSession
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
                            }}
                        >

                            <Text
                                style={{
                                    fontSize:
                                        18,

                                    fontWeight:
                                        "600",
                                }}
                            >
                                🔒 Preparazione
                                sessione sicura...
                            </Text>

                        </View>

                    </View>
                )
            }
            {
                creatingAccount
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
                                🔐 Creazione account
                                sicuro...
                            </Text>

                            <Text
                                style={{
                                    marginTop:
                                        10,

                                    color:
                                        "gray",

                                    textAlign:
                                        "center",
                                }}
                            >
                                Preparazione
                                crittografia end-to-end
                            </Text>

                        </View>

                    </View>
                )
            }
        </SafeAreaView>
    );
}

function InputField({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
}) {

    return (
        <TextInput
            placeholder={placeholder}

            value={value}

            onChangeText={
                onChangeText
            }

            secureTextEntry={
                secureTextEntry
            }

            keyboardType={
                keyboardType
            }

            autoCapitalize={
                autoCapitalize
            }

            style={{
                backgroundColor:
                    "#F8F8F8",

                borderRadius: 14,

                borderWidth: 1,
                borderColor:
                    "#ECECEC",

                padding: 16,

                fontSize: 16,

                marginBottom: 14,
            }}
        />
    );
}