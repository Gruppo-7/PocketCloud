import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { saveLoginState } from "../../utils/storage";
import { removeServerAddress, logout } from "../../utils/storage";

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
    async function handleLogin() {

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

        try {

            // Salva login
            await saveLoginState(
                true
            );

            Alert.alert(
                "Login",
                "Accesso eseguito"
            );

            // Vai alla home
            router.replace(
                "/(tabs)/file"
            );

        } catch (error) {

            Alert.alert(
                "Errore",
                "Impossibile effettuare il login"
            );
        }
    }

    // Registrazione
    function handleRegister() {

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

        Alert.alert(
            "Registrazione",
            "Account creato"
        );
    }

    async function changeServer() {

        try {

            // Logout
            await logout();

            // Rimuove server
            await removeServerAddress();

            // Torna setup
            router.replace(
                "/setup"
            );

        } catch (error) {

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