import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import { logout } from "../../utils/storage";

export default function SettingsScreen() {

  // Logout utente
  async function handleLogout() {

    try {

      await logout();

      router.replace(
        "/auth"
      );

    } catch (error) {

      Alert.alert(
        "Errore",
        "Impossibile effettuare il logout"
      );
    }
  }

  // Eliminazione account
  function deleteAccount() {
    Alert.alert(
      "Elimina account",
      "Sei sicuro di voler eliminare l'account?",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Elimina",
          style: "destructive",
          onPress: function () {
            console.log("Account eliminato");
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F5F5F5",
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        {/* Titolo */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: "700",
            marginBottom: 24,
          }}
        >
          Impostazioni
        </Text>

        {/* CACHE */}
        <Text
          style={{
            color: "gray",
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          CACHE
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#ECECEC",
            marginBottom: 22,
          }}
        >
          <TouchableOpacity>
            <SettingRow
              icon="trash-outline"
              label="Cancella cache"
            />
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <Text
          style={{
            color: "gray",
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          ACCOUNT
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#ECECEC",
            marginBottom: 22,
          }}
        >
          <TouchableOpacity onPress={deleteAccount}>
            <SettingRow
              icon="warning-outline"
              label="Elimina account"
              danger
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <SettingRow
              icon="log-out-outline"
              label="Logout"
            />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// Riga singola impostazione
function SettingRow({ icon, label, danger }) {
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
        color={danger ? "#FF3B30" : "#000"}
      />

      <Text
        style={{
          marginLeft: 14,
          fontSize: 16,
          color: danger ? "#FF3B30" : "#000",
        }}
      >
        {label}
      </Text>
    </View>
  );
}