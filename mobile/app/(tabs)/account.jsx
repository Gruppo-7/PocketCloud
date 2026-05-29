import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {

    // Mock dati utente
    const user = {
        name: "Mario",
        surname: "Rossi",
        username: "mario.rossi",
        email: "mario.rossi@email.com",
        usedStorage: "2.4 GB",
    };

    // Cambio password
    function changePassword() {
        Alert.alert(
            "Cambio password",
            "Funzionalità non ancora disponibile"
        );
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
                        {user.name} {user.surname}
                    </Text>

                    <Text
                        style={{
                            color: "gray",
                            marginTop: 4,
                        }}
                    >
                        @{user.username}
                    </Text>
                </View>

                {/* PROFILO */}
                <SectionTitle title="PROFILO" />

                <View style={styles.card}>
                    <InfoRow
                        icon="person-outline"
                        label="Nome"
                        value={user.name}
                    />

                    <InfoRow
                        icon="person-outline"
                        label="Cognome"
                        value={user.surname}
                    />

                    <InfoRow
                        icon="at-outline"
                        label="Username"
                        value={user.username}
                    />

                    <InfoRow
                        icon="mail-outline"
                        label="Email"
                        value={user.email}
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
                        onPress={changePassword}
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
                        value={user.usedStorage}
                    />
                </View>
            </ScrollView>
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