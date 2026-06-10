import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { logout, getServerAddress, saveServerAddress } from "../../utils/storage";
import { useServerStatus } from "../../context/ServerContext";

export default function SettingsScreen() {

  const { serverOnline, lastCheck } = useServerStatus();
  const [serverAddress, setServerAddress] = useState("");
  const [showServerModal, setShowServerModal] = useState(false);
  const [tempServerAddress, setTempServerAddress] = useState("");
  const [changingServer, setChangingServer] = useState(false);

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

  useEffect(() => {

    async function
      loadServer() {

      const address =
        await getServerAddress();

      if (
        address
      ) {

        setServerAddress(
          address
        );
      }
    }

    loadServer();

  }, []);

  function
    isValidServerAddress(
      address
    ) {

    const value =
      address.trim();

    if (
      value ===
      "localhost"
    ) {

      return true;
    }

    const ipRegex =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    const hostnameRegex =
      /^(localhost|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    return (
      ipRegex.test(
        value
      )
      ||
      hostnameRegex.test(
        value
      )
    );
  }

  async function
    changeServer() {

    const address =
      tempServerAddress
        .trim();

    if (
      !address
    ) {

      Alert.alert(
        "Errore",
        "Inserisci un indirizzo server"
      );

      return;
    }

    if (
      !isValidServerAddress(
        address
      )
    ) {

      Alert.alert(
        "IP non valido",
        "Inserisci un indirizzo IP valido"
      );

      return;
    }

    try {

      setChangingServer(
        true
      );

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
          `http://${address}/health`,
          {
            signal:
              controller.signal,
          }
        );

      clearTimeout(
        timeout
      );

      if (
        !response.ok
      ) {

        throw new Error(
          "Server offline"
        );
      }

      await saveServerAddress(
        address
      );

      setServerAddress(
        address
      );

      setShowServerModal(
        false
      );

      Alert.alert(
        "Server aggiornato",
        "Connessione riuscita"
      );

    } catch {

      Alert.alert(
        "Server non raggiungibile",
        "Nessun server PocketCloud rilevato a questo indirizzo."
      );

    } finally {

      setChangingServer(
        false
      );
    }
  }

  function
    getLastCheckText() {

    if (
      !lastCheck
    ) {

      return "Mai";
    }

    const seconds =
      Math.floor(
        (
          Date.now() -
          new Date(
            lastCheck
          )
        ) / 1000
      );

    if (
      seconds < 10
    ) {

      return "Adesso";
    }

    if (
      seconds < 60
    ) {

      return `${seconds}s fa`;
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    return `${minutes} min fa`;
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

        {/* SERVER */}

        <Text
          style={{
            color: "gray",
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          SERVER
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

          <View
            style={{
              padding: 18,
            }}
          >

            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {
                serverOnline
                  ? "🟢 Online"
                  : "🔴 Offline"
              }
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "#555",
                marginBottom: 8,
              }}
            >
              PocketCloud Server
            </Text>

            <Text
              style={{
                color: "gray",
                marginBottom: 10,
              }}
            >
              {
                serverAddress
              }
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#8E8E93",
              }}
            >
              Ultimo controllo:{" "}
              {
                getLastCheckText()
              }
            </Text>

          </View>

          <TouchableOpacity
            onPress={() => {

              setTempServerAddress(
                serverAddress
              );

              setShowServerModal(
                true
              );
            }}
          >
            <SettingRow
              icon="server-outline"
              label="Cambia server"
            />
          </TouchableOpacity>

        </View>

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
          <TouchableOpacity
            disabled={
              !serverOnline
            }

            style={{
              opacity:
                serverOnline
                  ? 1
                  : 0.5,
            }}
          >
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
          <TouchableOpacity
            disabled={
              !serverOnline
            }

            style={{
              opacity:
                serverOnline
                  ? 1
                  : 0.5,
            }}

            onPress={() => {

              if (
                !serverOnline
              ) {
                return;
              }

              deleteAccount();
            }}
          >
            <SettingRow
              icon="warning-outline"
              label="Elimina account"
              danger
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={
              !serverOnline
            }

            style={{
              opacity:
                serverOnline
                  ? 1
                  : 0.5,
            }}

            onPress={() => {

              if (
                !serverOnline
              ) {
                return;
              }

              handleLogout();
            }}
          >
            <SettingRow
              icon="log-out-outline"
              label="Logout"
            />
          </TouchableOpacity>
        </View>

      </View>
      <Modal
        visible={
          showServerModal
        }

        transparent

        animationType="fade"
      >

        <View
          style={{
            flex: 1,
            justifyContent:
              "center",

            alignItems:
              "center",

            backgroundColor:
              "rgba(0,0,0,0.35)",
          }}
        >

          <View
            style={{
              width: "85%",

              backgroundColor:
                "#fff",

              borderRadius: 20,

              padding: 22,
            }}
          >

            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 12,
              }}
            >
              Cambia server
            </Text>

            <Text
              style={{
                color: "gray",
                marginBottom: 14,
              }}
            >
              Inserisci il nuovo
              indirizzo IP
            </Text>

            <TextInput
              value={
                tempServerAddress
              }

              onChangeText={
                setTempServerAddress
              }

              placeholder=
              "192.168.1.120"

              autoCapitalize=
              "none"

              style={{
                borderWidth: 1,
                borderColor:
                  "#D9D9D9",

                borderRadius: 14,

                padding: 14,

                fontSize: 16,

                marginBottom: 20,
              }}
            />

            <View
              style={{
                flexDirection:
                  "row",

                justifyContent:
                  "flex-end",

                gap: 12,
              }}
            >

              <TouchableOpacity
                onPress={() =>
                  setShowServerModal(
                    false
                  )
                }
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "gray",
                  }}
                >
                  Annulla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  changeServer
                }
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight:
                      "700",
                  }}
                >
                  {
                    changingServer
                      ? "Verifica..."
                      : "Salva"
                  }
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>
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