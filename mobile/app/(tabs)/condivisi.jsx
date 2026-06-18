import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import { Alert, Text, View, TouchableOpacity } from "react-native";
import FilterChips from "../../components/FilterChips";
import { SafeAreaView } from "react-native-safe-area-context";
import FileList from "../../components/FileList";
import { useState, useEffect } from "react";
import SortMenu from "../../components/SortMenu";
import FAB from "../../components/FAB";
import useFiles from "../../hooks/useFiles";
import { getFileType } from "../../utils/fileTypes";
import { useServerStatus } from "../../context/ServerContext";
import SelectionHeader from "../../components/SelectionHeader";
import SelectionMenu from "../../components/SelectionMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { getCurrentUser } from "../../utils/storage";
import { getBaseUrl } from "../../utils/api";
import { openFile, openInSystem } from "../../utils/fileActions";
import { uploadDocument } from "../../utils/uploadActions";
import ShareFileModal from "../../components/ShareFileModal";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";

async function
  shareWithUser({

    file,

    username,

    permission,
  }) {

  try {
    const user =
      await getCurrentUser();

    const baseUrl =
      await getBaseUrl();

    const response =
      await fetch(
        `${baseUrl}/shared`,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({

              file_id:
                file.id,

              username,

              permission,

              userId:
                user.id,
            }),
        }
      );

    const data =
      await response
        .json();

    if (
      !response.ok
    ) {

      Alert.alert(
        "Errore",

        data.error
        ||
        "Condivisione fallita"
      );

      return;
    }

    markServerAlive();

    Alert.alert(

      "Condivisione riuscita",

      `${file.name}
condiviso con
${username}`
    );

    return true;

  } catch (
  error
  ) {

    console.error(
      "Share error:",
      error
    );

    Alert.alert(
      "Errore",

      "Impossibile condividere il file"
    );
  }
}

export default function SharedScreen() {

  const { serverOnline } = useServerStatus();

  const [showFilters, setShowFilters] = useState(false);

  const [filterType, setFilterType] = useState("all");

  /* Layout:
     false = elenco
     true = griglia
  */
  const [gridView, setGridView] =
    useState(false);

  /* Menu ordinamento */
  const [
    showSortMenu,
    setShowSortMenu,
  ] = useState(false);

  /* Ricerca */
  const [showSearch, setShowSearch] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  /* Ordinamento attuale */
  const [sortBy, setSortBy] =
    useState("modified");

  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [selectedFolders, setSelectedFolders] = useState([]);

  const [selectionMode, setSelectionMode] = useState(false);

  const [showSelectionMenu, setShowSelectionMenu] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { files: sharedFiles, setFiles: setSharedFiles, reloadFiles, loading } = useFiles("shared");

  const { files, reloadFiles: reloadMyFiles } = useFiles("files");

  const [currentUser, setCurrentUser] = useState(null);

  const [showCloudPicker, setShowCloudPicker] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const [fileToShare, setFileToShare] = useState(null);

  const [pendingUploadedFile, setPendingUploadedFile] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const deleteFile = (fileId) => {
    setSharedFiles(
      (prevFiles) =>
        prevFiles.filter(
          (file) =>
            file.id !== fileId
        )
    );
  };

  useFocusEffect(

    React.useCallback(
      () => {

        reloadFiles();

        reloadMyFiles();
      },

      []
    )
  );

  useEffect(() => {

    async function
      loadUser() {

      const user =
        await getCurrentUser();

      setCurrentUser(
        user
      );
    }

    loadUser();

  }, []);

  //RICERCA, ORDINAMENTO E FILTRAGGIO FILE
  const filteredFiles =
    sharedFiles.filter(
      (file) => {

        // ricerca testuale
        const matchesSearch =
          file.name
            .toLowerCase()
            .includes(
              searchText
                .toLowerCase()
            );

        // tipo file
        const fileType =
          getFileType(
            file.name
          );

        // filtro categoria
        const matchesType =
          filterType ===
            "all"
            ? true
            : fileType ===
            filterType;

        return (
          matchesSearch &&
          matchesType
        );
      }
    );

  const sortedFiles =
    [...filteredFiles]

      .map(
        item => ({

          ...item,

          share_encrypted_file_key:
            item
              .encrypted_file_key,

          share_encrypted_file_key_iv:
            item
              .encrypted_file_key_iv,
        })
      )

      .sort(
        (a, b) => {

          let result =
            0;

          switch (
          sortBy
          ) {

            case "name":

              result =
                a.name
                  .toLowerCase()
                  .localeCompare(
                    b.name
                      .toLowerCase()
                  );

              break;

            case "size":

              result =
                a.size -
                b.size;

              break;

            case "modified":

              result =
                new Date(
                  a.updated_at
                ).getTime()
                -
                new Date(
                  b.updated_at
                ).getTime();

              break;

            default:
              result =
                0;
          }

          return (
            sortDirection
              === "asc"

              ? result

              : -result
          );
        }
      );

  useEffect(() => {

    const totalSelected =
      selectedFiles.length
      +
      selectedFolders.length;

    if (
      selectionMode
      &&
      totalSelected
      === 0
    ) {

      setSelectionMode(
        false
      );
    }

  }, [
    selectedFiles,
    selectedFolders,
    selectionMode
  ]);

  async function
    removeFromShared(
      fileId
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/shared/file/${fileId}/user/${currentUser.id}`,
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

        Alert.alert(
          "Errore",
          data.error
        );

        return;
      }

      deleteFile(
        fileId
      );

      setSelectedFiles(
        []
      );

      setSelectionMode(
        false
      );

    } catch (
    error
    ) {

      console.error(
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile rimuovere il file condiviso"
      );
    }
  }

  function
    confirmDelete() {

    removeFromShared(
      selectedFiles[0]
        ?.id
    );

    setSelectedFiles(
      []
    );

    setSelectionMode(
      false
    );

    setShowDeleteModal(
      false
    );
  }

  async function
    generateFileHash(
      uri
    ) {

    try {

      const fileContent =
        await FileSystem
          .readAsStringAsync(
            uri,
            {
              encoding:
                FileSystem
                  .EncodingType
                  .Base64,
            }
          );

      const hash =
        await Crypto
          .digestStringAsync(

            Crypto
              .CryptoDigestAlgorithm
              .SHA256,

            fileContent
          );

      return hash;

    } catch (
    error
    ) {

      console.error(
        "Hash error:",
        error
      );

      throw error;
    }
  }

  async function
    pickSingleFile() {

    const result =
      await DocumentPicker
        .getDocumentAsync({

          multiple:
            false,

          copyToCacheDirectory:
            true,
        });

    if (
      result.canceled
    ) {

      return null;
    }

    return result
      .assets[0];
  }

  async function
    replaceFile(
      fileToReplace
    ) {

    try {

      const user =
        await getCurrentUser();

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            200
          )
      );

      const selectedFile =
        await pickSingleFile();

      if (
        !selectedFile
      ) {

        return;
      }

      const fileHash =
        await generateFileHash(
          selectedFile.uri
        );

      const formData =
        new FormData();

      formData.append(
        "file",
        {
          uri:
            selectedFile.uri,

          name:
            selectedFile.name,

          type:
            selectedFile.mimeType
            ||
            "application/octet-stream",
        }
      );

      formData.append(
        "userId",
        user.id
      );

      formData.append(
        "sha256_fingerprint",
        fileHash
      );

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/files/${fileToReplace.id}/replace`,
          {
            method:
              "PATCH",
            body:
              formData,
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

      await reloadFiles();

      Alert.alert(
        "File aggiornato",
        selectedFile.name
      );

    } catch (
    error
    ) {

      console.error(
        "Replace error:",
        error
      );

      Alert.alert(
        "Errore",
        "Aggiornamento file fallito"
      );

    }
  }

  async function
    renameFile(
      file,
      newName
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/files/${file.id}/rename`,
          {

            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                name:
                  newName,

                userId:
                  currentUser.id
              }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Shared rename:",
        data
      );

      if (
        !response.ok
      ) {

        Alert.alert(

          "Errore",

          data.error
          ||
          "Rinomina fallita"
        );

        return;
      }

      await reloadFiles();

      Alert.alert(
        "Rinominato",
        "File rinominato"
      );

    } catch (
    error
    ) {

      console.error(
        "Rename error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile rinominare file"
      );
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          "#F5F5F5",
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >

        {/* HEADER */}

        {
          selectionMode
            ? (

              <SelectionHeader
                selectedCount={
                  selectedFiles.length
                  +
                  selectedFolders.length
                }

                onClose={() => {

                  setSelectedFiles(
                    []
                  );

                  setSelectionMode(
                    false
                  );

                  setSelectedFolders(
                    []
                  );
                }}

                onActions={() =>
                  setShowSelectionMenu(
                    true
                  )
                }
              />

            ) : (

              <View
                style={{
                  flexDirection:
                    "row",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  marginBottom:
                    20,
                }}
              >
                {/* ORDINAMENTO */}
                <TouchableOpacity
                  onPress={() =>
                    setShowSortMenu(
                      !showSortMenu
                    )
                  }

                  style={{
                    flexDirection:
                      "row",

                    alignItems:
                      "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight:
                        "600",
                    }}
                  >
                    {
                      {
                        name:
                          "Nome",

                        modified:
                          "Ultima modifica",

                        owner:
                          "Condiviso da",
                      }[
                      sortBy
                      ]
                    }
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={18}
                    style={{
                      marginLeft:
                        4,
                    }}
                  />
                </TouchableOpacity>

                {/* AZIONI */}
                <View
                  style={{
                    flexDirection:
                      "row",

                    gap: 18,
                  }}
                >
                  <Ionicons
                    name="search"
                    size={26}
                    onPress={() =>
                      setShowSearch(
                        !showSearch
                      )
                    }
                  />

                  <Ionicons
                    name={
                      gridView
                        ? "list"
                        : "grid"
                    }

                    size={26}

                    onPress={() =>
                      setGridView(
                        !gridView
                      )
                    }
                  />

                  <Ionicons
                    name="options-outline"
                    size={26}
                    onPress={() =>
                      setShowFilters(
                        !showFilters
                      )
                    }
                  />
                </View>
              </View>
            )
        }

        {/* SEARCH BAR */}
        {showSearch && (
          <SearchBar
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Cerca file condivisi"
          />
        )}

        {/* MENU ORDINAMENTO */}
        <SortMenu
          showSortMenu={
            showSortMenu
          }
          setShowSortMenu={
            setShowSortMenu
          }
          sortDirection={
            sortDirection
          }

          setSortDirection={
            setSortDirection
          }

          sortBy={sortBy}

          setSortBy={
            setSortBy
          }

          options={[
            {
              key: "name",

              label:
                sortBy ===
                  "name"
                  &&
                  sortDirection
                  === "asc"

                  ? "Nome (A-Z)"

                  : "Nome (Z-A)",
            },

            {
              key:
                "modified",

              label:
                sortDirection
                  === "desc"

                  ? "Più recenti"

                  : "Più vecchi",
            },

            {
              key:
                "size",

              label:
                sortDirection
                  === "desc"

                  ? "Grande → Piccolo"

                  : "Piccolo → Grande",
            },
          ]}
        />

        {/* FILTRI */}
        <FilterChips
          visible={showFilters}
          gridView={gridView}
          selectedFilter={filterType}
          setSelectedFilter={
            setFilterType
          }
        />

        {/* LISTA */}
        <FileList
          disabled={
            !serverOnline
          }
          data={sortedFiles}
          gridView={gridView}
          selectedFiles={
            selectedFiles
          }
          sharedMode={
            true
          }
          serverOnline={serverOnline}

          setSelectedFiles={
            setSelectedFiles
          }

          selectionMode={
            selectionMode
          }

          setSelectionMode={
            setSelectionMode
          }
          renderSubtitle={(item) =>
            `${item.owner} • ${item.permission}`
          }
          onDeleteFile={removeFromShared}

          onOpenFile={openFile}

          onShareFile={openInSystem}

          onRenameFile={
            renameFile
          }

          onReplaceFile={
            replaceFile
          }

          loading={
            loading
          }

          onRefresh={
            reloadFiles
          }
        />
      </View>

      {/* PULSANTE AGGIUNGI */}
      <FAB
        disabled={
          !serverOnline
        }

        icon="person-add"

        onPress={
          serverOnline
            ? () =>
              Alert.alert(
                "Condividi file",

                "Scegli origine file",

                [
                  {
                    text:
                      "Dal cloud",

                    onPress:
                      () =>
                        setShowCloudPicker(
                          true
                        ),
                  },

                  {
                    text:
                      "Dal dispositivo",

                    onPress:
                      async () => {

                        const uploadedFile =
                          await uploadDocument({

                            reloadFiles:
                              reloadMyFiles,

                            setIsUploading,

                            setUploadProgress,
                          });

                        if (
                          !uploadedFile
                        ) {
                          return;
                        }

                        setPendingUploadedFile(
                          uploadedFile
                        );

                        setFileToShare(
                          uploadedFile
                        );

                        setShowShareModal(
                          true
                        );
                      },
                  },

                  {
                    text:
                      "Annulla",

                    style:
                      "cancel",
                  },
                ]
              )
            : undefined
        }
      />

      <SelectionMenu
        visible={
          showSelectionMenu
        }

        onClose={() =>
          setShowSelectionMenu(
            false
          )
        }

        options={
          selectedFiles.length
            === 1

            ? [

              {
                key:
                  "details",

                label:
                  "Dettagli",

                onPress:
                  () => {

                    const file =
                      selectedFiles[0];

                    Alert.alert(
                      "Dettagli file",

                      `Nome:
${file.name}

Dimensione:
${(
                        file.size /
                        1024
                      ).toFixed(2)} KB`
                    );

                    setShowSelectionMenu(
                      false
                    );
                  },
              },

              {
                key:
                  "delete",

                label:
                  "Elimina",

                danger:
                  true,

                onPress:
                  () => {

                    setShowSelectionMenu(
                      false
                    );

                    setShowDeleteModal(
                      true
                    );
                  },
              },
            ]

            : [

              {
                key:
                  "delete",

                label:
                  "Elimina selezionati",

                danger:
                  true,

                onPress:
                  () => {

                    setShowSelectionMenu(
                      false
                    );

                    setShowDeleteModal(
                      true
                    );
                  },
              },
            ]
        }
      />

      <ConfirmDeleteModal
        visible={
          showDeleteModal
        }

        title={
          selectedFiles.length
            === 1

            ? "Rimuovere file?"

            : "Rimuovere elementi?"
        }

        message={
          selectedFiles.length
            === 1

            ? "Il file condiviso verrà rimosso."

            : "I file condivisi selezionati verranno rimossi."
        }

        onCancel={() =>
          setShowDeleteModal(
            false
          )
        }

        onConfirm={
          confirmDelete
        }
      />

      {
        showCloudPicker && (

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
                  20,

                maxHeight:
                  "70%",
              }}
            >

              <Text
                style={{
                  fontSize:
                    20,

                  fontWeight:
                    "600",

                  marginBottom:
                    16,
                }}
              >
                Seleziona file
              </Text>

              {
                files.map(
                  file => (

                    <TouchableOpacity

                      key={
                        file.id
                      }

                      onPress={() => {

                        setShowCloudPicker(
                          false
                        );

                        setFileToShare(
                          file
                        );

                        setShowShareModal(
                          true
                        );
                      }}

                      style={{
                        paddingVertical:
                          14,

                        borderBottomWidth:
                          1,

                        borderBottomColor:
                          "#ECECEC",
                      }}
                    >

                      <Text
                        style={{
                          fontSize:
                            16,
                        }}
                      >
                        {
                          file.name
                        }
                      </Text>

                    </TouchableOpacity>
                  )
                )
              }

              <TouchableOpacity
                onPress={() =>
                  setShowCloudPicker(
                    false
                  )
                }

                style={{
                  marginTop:
                    16,

                  alignItems:
                    "center",
                }}
              >

                <Text
                  style={{
                    color:
                      "#007AFF",

                    fontSize:
                      16,

                    fontWeight:
                      "600",
                  }}
                >
                  Annulla
                </Text>

              </TouchableOpacity>

            </View>
          </View>
        )
      }

      <ShareFileModal
        visible={
          showShareModal
        }

        file={
          fileToShare
        }

        onClose={
          async () => {

            if (
              pendingUploadedFile
            ) {

              try {

                const baseUrl =
                  await getBaseUrl();

                await fetch(
                  `${baseUrl}/files/${pendingUploadedFile.id}`,
                  {
                    method:
                      "DELETE",
                  }
                );

                await reloadMyFiles();

              } catch (
              error
              ) {

                console.error(
                  "Rollback delete error:",
                  error
                );
              }
            }

            setPendingUploadedFile(
              null
            );

            setShowShareModal(
              false
            );

            setFileToShare(
              null
            );
          }
        }

        onShare={
          async (
            payload
          ) => {

            const success =
              await shareWithUser(
                payload
              );

            if (
              success
            ) {

              setPendingUploadedFile(
                null
              );

              setShowShareModal(
                false
              );

              setFileToShare(
                null
              );
            }
          }
        }
      />

      {
        isUploading
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
                width:
                  "80%",

                backgroundColor:
                  "white",

                borderRadius:
                  16,

                padding:
                  24,

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

                  marginBottom:
                    16,
                }}
              >
                Caricamento file...
              </Text>

              <View
                style={{
                  width:
                    "100%",

                  height:
                    10,

                  backgroundColor:
                    "#E5E5E5",

                  borderRadius:
                    999,

                  overflow:
                    "hidden",
                }}
              >

                <View
                  style={{
                    width:
                      `${uploadProgress ?? 0}%`,

                    height:
                      "100%",

                    backgroundColor:
                      "#007AFF",
                  }}
                />
              </View>

              <Text
                style={{
                  marginTop:
                    12,

                  fontSize:
                    16,
                }}
              >
                {
                  uploadProgress
                }
                %
              </Text>

            </View>

          </View>
        )
      }

    </SafeAreaView >
  );
}