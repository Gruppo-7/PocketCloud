import { Ionicons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React from "react";
import { router } from "expo-router";
import { logout, getServerAddress, saveServerAddress, getCurrentUser } from "../../utils/storage";
import { useServerStatus } from "../../context/ServerContext";
import { cleanupTemporaryFiles } from "../../utils/crypto";
import { getBaseUrl } from "../../utils/api";
import { clearCache, getCacheSize } from "../../utils/cacheManager";

export default function SettingsScreen() {

  const { serverOnline, lastCheck, markServerAlive } = useServerStatus();
  const [serverAddress, setServerAddress] = useState("");
  const [showServerModal, setShowServerModal] = useState(false);
  const [tempServerAddress, setTempServerAddress] = useState("");
  const [changingServer, setChangingServer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  // Logout utente
  async function handleLogout() {

    try {

      await cleanupTemporaryFiles();

      await clearCache();

      await logout();

      router.replace(
        "/auth"
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile effettuare logout"
      );
    }
  }


  //Pulizia cache
  async function
    handleClearCache() {

    Alert.alert(

      "Cancella cache",

      "Tutti i file salvati offline verranno rimossi.",

      [
        {
          text: "Annulla",
          style: "cancel",
        },

        {
          text: "Cancella",

          style: "destructive",

          onPress: async () => {

            try {

              await clearCache();

              setCacheSize(0);

              Alert.alert(
                "Cache cancellata",
                "I file offline sono stati rimossi."
              );

            } catch (
            error
            ) {

              console.error(
                "Clear cache error:",
                error
              );

              Alert.alert(
                "Errore",
                "Impossibile cancellare la cache"
              );
            }
          },
        },
      ]
    );
  }

  // Eliminazione account
  async function
    deleteAccount() {

    if (
      !deletePassword
        .trim()
    ) {

      Alert.alert(
        "Errore",
        "Inserisci la password"
      );

      return;
    }

    try {

      setDeletingAccount(
        true
      );

      const user =
        await getCurrentUser();

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/auth/account/${user.id}`,
          {

            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                password:
                  deletePassword
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

      await cleanupTemporaryFiles();

      await logout();

      setShowDeleteModal(
        false
      );

      setDeletePassword(
        ""
      );

      Alert.alert(
        "Account eliminato",
        "Il tuo account è stato eliminato"
      );

      router.replace(
        "/auth"
      );

    } catch (
    error
    ) {

      Alert.alert(
        "Errore",
        error.message
        ||
        "Eliminazione account fallita"
      );

    } finally {

      setDeletingAccount(
        false
      );
    }
  }

  useFocusEffect(

    React.useCallback(
      () => {

        async function loadSettings() {

          const size =
            await getCacheSize();

          setCacheSize(
            size
          );

          const address =
            await getServerAddress();

          if (address) {

            setServerAddress(
              address
            );
          }
        }

        loadSettings();

      },
      []
    )
  );

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

      markServerAlive();

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

  function
    formatCacheSize(
      bytes
    ) {

    if (
      bytes < 1024
    ) {

      return `${bytes} B`;
    }

    if (
      bytes < 1024 * 1024
    ) {

      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes / (
        1024 * 1024
      )
    ).toFixed(1)} MB`;
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
          <Text

            style={{

              color: "#666",

              paddingHorizontal: 18,

              paddingTop: 18,

              paddingBottom: 6,

              fontSize: 14,

            }}

          >

            Cache utilizzata: {

              formatCacheSize(

                cacheSize

              )

            }

          </Text>
          <TouchableOpacity
            disabled={
              !serverOnline
            }

            onPress={
              handleClearCache
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

              setShowDeleteModal(
                true
              );
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
      <Modal
        visible={
          showDeleteModal
        }

        transparent

        animationType=
        "fade"
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

            padding:
              20,
          }}
        >

          <View
            style={{
              width:
                "100%",

              maxWidth:
                420,

              backgroundColor:
                "#fff",

              borderRadius:
                20,

              padding:
                24,
            }}
          >

            <Text
              style={{
                fontSize:
                  22,

                fontWeight:
                  "700",

                marginBottom:
                  12,

                color:
                  "#FF3B30",
              }}
            >
              Elimina account
            </Text>

            <Text
              style={{
                color:
                  "#666",

                marginBottom:
                  20,

                lineHeight:
                  22,
              }}
            >
              Questa operazione è permanente.
              Verranno eliminati file,
              cartelle, condivisioni e dati
              crittografati.
            </Text>

            <TextInput
              placeholder=
              "Inserisci password"

              value={
                deletePassword
              }

              onChangeText={
                setDeletePassword
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

                marginBottom:
                  20,
              }}
            />

            <View
              style={{
                flexDirection:
                  "row",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",
              }}
            >

              <TouchableOpacity
                onPress={() =>
                  setShowDeleteModal(
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
                  }}
                >
                  Annulla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  deleteAccount
                }

                disabled={
                  deletingAccount
                }

                style={{
                  backgroundColor:
                    "#FF3B30",

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
                    deletingAccount
                      ? "Eliminazione..."
                      : "Elimina"
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