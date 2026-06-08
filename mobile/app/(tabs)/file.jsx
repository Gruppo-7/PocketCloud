import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import FileList from "../../components/FileList";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/SearchBar";
import FilterChips from "../../components/FilterChips";
import SortMenu from "../../components/SortMenu";
import { useState, useEffect } from "react";
import FAB from "../../components/FAB";
import useFiles from "../../hooks/useFiles";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getBaseUrl } from "../../utils/api";
import { getCurrentUser } from "../../utils/storage";
import * as IntentLauncher from "expo-intent-launcher";
import { getFileType } from "../../utils/fileTypes";
import { useServerStatus } from "../../context/ServerContext";
import SelectionHeader from "../../components/SelectionHeader";
import SelectionMenu from "../../components/SelectionMenu";
import useFolders from "../../hooks/useFolders";
import FolderCard from "../../components/FolderCard";
import CreateFolderModal from "../../components/CreateFolderModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ShareFileModal from "../../components/ShareFileModal";

export default function FilesScreen() {

  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [gridView, setGridView] = useState(false);

  /* False -> elenco
     True -> griglia */

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { serverOnline } = useServerStatus();
  const { files, setFiles, reloadFiles } = useFiles("files");
  const { folders, setFolders } = useFolders();
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);

  async function pickDocument() {

    try {

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
        return;
      }

      const file = result.assets[0];

      console.log(
        "Selected file:",
        file
      );

      const user = await getCurrentUser();

      const formData = new FormData();

      formData.append(
        "file",
        {

          uri:
            file.uri,

          name:
            file.name,

          type:
            file.mimeType
            ||
            "application/octet-stream",
        }
      );

      formData.append(
        "owner_id",
        user.id
      );

      formData.append(
        "folder_id",
        currentFolder
          ?.id
        ?? ""
      );

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/files/upload`,
          {

            method:
              "POST",

            body:
              formData,
          }
        );

      const data =
        await response.json();

      console.log(
        "Upload response:",
        data
      );

      if (
        !response.ok
      ) {

        throw new Error(
          data.error
        );
      }

      await reloadFiles();

      Alert.alert(
        "Upload riuscito",
        file.name
      );

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      Alert.alert(
        "Errore",
        "Upload fallito"
      );
    }
  }

  async function
    createFolder(
      folderName
    ) {

    try {

      const user =
        await
          getCurrentUser();

      const baseUrl =
        await
          getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/folders`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ownerId:
                  user.id,

                name:
                  folderName,

                parentFolderId:
                  currentFolder
                    ?.id
                  ?? null,
              }),
          }
        );

      const createdFolder =
        await response.json();

      setFolders(
        prev => (
          [
            ...prev,
            createdFolder,
          ]
        )
      );

    } catch (
    error
    ) {

      console.error(
        "Create folder error:",
        error
      );

      Alert.alert(
        "Errore",

        "Impossibile creare la cartella"
      );
    }
  }

  async function
    deleteFile(
      fileId
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/files/${fileId}`,
          {

            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      console.log(
        "Delete response:",
        data
      );

      if (
        !response.ok
      ) {

        throw new Error(
          data.error
        );
      }

      await reloadFiles();

      Alert.alert(
        "Eliminato",
        "File rimosso"
      );

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile eliminare file"
      );
    }
  }

  async function
    deleteFolder(
      folderId
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/folders/${folderId}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        await response.json();

      console.log(
        "Delete folder:",
        data
      );

      if (
        !response.ok
      ) {

        throw new Error(
          data.error
        );
      }

      setFolders(
        prev =>
          prev.filter(
            folder =>
              folder.id !==
              folderId
          )
      );

    } catch (
    error
    ) {

      console.error(
        "Delete folder error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile eliminare cartella"
      );
    }
  }

  async function openFile(file) {

    try {

      const baseUrl =
        await getBaseUrl();

      const fileUri =
        FileSystem
          .documentDirectory
        + file.name;

      const downloadUrl =
        `${baseUrl}/files/download/${file.id}`;

      console.log(
        "Downloading:",
        downloadUrl
      );

      const result =
        await FileSystem
          .downloadAsync(
            downloadUrl,
            fileUri
          );

      console.log(
        "Downloaded:",
        result
      );

      if (
        Platform.OS ===
        "ios"
      ) {

        await Linking
          .openURL(
            result.uri
          );

      } else {

        const contentUri =
          await FileSystem
            .getContentUriAsync(
              result.uri
            );

        await IntentLauncher
          .startActivityAsync(
            "android.intent.action.VIEW",
            {
              data:
                contentUri,

              flags:
                1,
            }
          );
      }

    } catch (error) {

      console.error(
        "Open file error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile aprire file"
      );
    }
  }

  async function
    openInSystem(
      file
    ) {

    try {

      if (!file) {
        return;
      }

      const baseUrl =
        await getBaseUrl();

      const fileUri =
        FileSystem
          .documentDirectory
        + file.name;

      const downloadUrl =
        `${baseUrl}/files/download/${file.id}`;

      console.log(
        "Sharing:",
        downloadUrl
      );

      const result =
        await FileSystem
          .downloadAsync(
            downloadUrl,
            fileUri
          );

      console.log(
        "Downloaded for share:",
        result
      );

      const canShare =
        await Sharing
          .isAvailableAsync();

      console.log(
        "Can share:",
        canShare
      );

      if (
        !canShare
      ) {

        Alert.alert(
          "Errore",
          "Apri in... non disponibile"
        );

        return;
      }

      console.log(
        "BEFORE SHARE"
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300
          )
      );

      const fileInfo =
        await FileSystem
          .getInfoAsync(
            result.uri
          );

      console.log(
        "File info:",
        fileInfo
      );

      // versione minimale
      await Sharing.shareAsync(result.uri);

      console.log(
        "AFTER SHARE"
      );

    } catch (error) {

      console.error(
        "Share file error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile aprire 'Apri in...'"
      );
    }
  }

  async function
    shareWithUser({

      file,

      username,

      permission,
    }) {

    try {

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

      Alert.alert(
        "Condivisione riuscita",

        `${file.name}
condiviso con
${username}`
      );

      setShowShareModal(
        false
      );

      setFileToShare(
        null
      );

    } catch (error) {

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

  const visibleFiles =
    files.filter(
      file =>
        file.folder_id
        ===
        (
          currentFolder
            ?.id
          ?? null
        )
    );


  // RICERCA, ORDINAMENTO FILE E FILTRAGGIO FILE
  const filteredFiles = visibleFiles.filter((file) => {

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
    confirmDelete() {

    try {

      for (
        const file
        of selectedFiles
      ) {

        await deleteFile(
          file.id
        );
      }

      for (
        const folder
        of selectedFolders
      ) {

        await deleteFolder(
          folder.id
        );
      }

      setSelectedFiles(
        []
      );

      setSelectedFolders(
        []
      );

      setSelectionMode(
        false
      );

      setShowDeleteModal(
        false
      );

    } catch (
    error
    ) {

      console.error(
        "Confirm delete error:",
        error
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

                  setSelectedFolders(
                    []
                  );

                  setSelectionMode(
                    false
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

                <TouchableOpacity
                  onPress={() => {

                    setShowSortMenu(
                      !showSortMenu
                    );
                  }}

                  style={{
                    flexDirection:
                      "row",

                    alignItems:
                      "center",
                  }}
                >

                  {
                    currentFolder && (

                      <TouchableOpacity
                        onPress={() => {

                          const previousFolder =
                            folderHistory[
                            folderHistory
                              .length - 1
                            ];

                          setFolderHistory(
                            prev =>
                              prev.slice(
                                0,
                                -1
                              )
                          );

                          setCurrentFolder(
                            previousFolder
                          );
                        }}

                        style={{
                          marginRight:
                            8,
                        }}
                      >
                        <Ionicons
                          name=
                          "arrow-back"

                          size={24}
                        />
                      </TouchableOpacity>
                    )
                  }

                  <Text
                    style={{
                      fontSize:
                        26,

                      fontWeight:
                        "600",
                    }}
                  >
                    {
                      currentFolder
                        ? currentFolder
                          .name
                        : {
                          name:
                            "Nome",

                          modified:
                            "Ultima modifica",

                          size:
                            "Dimensione",
                        }[
                        sortBy
                        ]
                    }
                  </Text>

                  <Ionicons
                    name=
                    "chevron-down"

                    size={18}

                    style={{
                      marginLeft:
                        4,
                      opacity:
                        0.8,
                    }}
                  />

                </TouchableOpacity>

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
                    name=
                    "options-outline"

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
        {/* MENU ORDINAMENTO */}
        <SortMenu
          showSortMenu={
            showSortMenu
          }

          setShowSortMenu={
            setShowSortMenu
          }

          sortBy={
            sortBy
          }

          setSortBy={
            setSortBy
          }

          sortDirection={
            sortDirection
          }

          setSortDirection={
            setSortDirection
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

        {/* SEARCH BAR */}
        {showSearch && (
          <SearchBar
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Cerca file"
          />
        )}

        {/* FILTRI */}
        <FilterChips
          visible={showFilters}
          gridView={gridView}
          selectedFilter={filterType}
          setSelectedFilter={
            setFilterType
          }
        />

        {
          folders.filter(
            folder =>
              folder.parent_folder_id
              ===
              (
                currentFolder
                  ?.id
                ?? null
              )
          )
            .map(
              folder => (

                <FolderCard

                  selectionMode={
                    selectionMode
                  }

                  selectedFolders={
                    selectedFolders
                  }

                  setSelectedFolders={
                    setSelectedFolders
                  }

                  setSelectionMode={
                    setSelectionMode
                  }

                  key={
                    folder.id
                  }

                  folder={
                    folder
                  }

                  gridView={
                    gridView
                  }

                  onPress={() => {

                    setFolderHistory(
                      prev => [
                        ...prev,
                        currentFolder,
                      ]
                    );

                    setCurrentFolder(
                      folder
                    );
                  }}
                />
              )
            )
        }

        <FileList
          data={sortedFiles}
          gridView={gridView}
          disabled={!serverOnline}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}

          renderSubtitle={(item) =>
            "2 MB • ieri"
          }

          onDeleteFile={
            deleteFile
          }

          onOpenFile={
            openFile
          }

          onShareFile={
            openInSystem
          }

          selectedFiles={
            selectedFiles
          }

          setSelectedFiles={
            setSelectedFiles
          }

          selectionMode={
            selectionMode
          }

          setSelectionMode={
            setSelectionMode
          }

          onPocketShare={
            (file) => {

              setFileToShare(
                file
              );

              setShowShareModal(
                true
              );
            }
          }
        />
      </View>

      {/* PULSANTE AGGIUNGI */}
      <FAB
        disabled={
          !serverOnline
        }

        onPress={() =>
          Alert.alert(
            "Nuovo elemento",

            "Cosa vuoi creare?",

            [
              {
                text:
                  "Cartella",

                onPress:
                  () =>
                    setShowCreateFolder(
                      true
                    ),
              },

              {
                text:
                  "Carica file",

                onPress:
                  () =>
                    pickDocument(),
              },

              {
                text:
                  "Annulla",

                style:
                  "cancel",
              },
            ]
          )
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
            +
            selectedFolders.length
            === 1

            ? [

              ...(selectedFiles.length
                === 1

                ? [

                  {
                    key:
                      "open",

                    label:
                      "Apri",

                    onPress:
                      async () => {

                        await openFile(
                          selectedFiles[0]
                        );

                        setShowSelectionMenu(
                          false
                        );
                      },
                  },

                  {
                    key:
                      "share",

                    label:
                      "Apri in...",

                    onPress:
                      async () => {

                        await openInSystem(
                          selectedFiles[0]
                        );

                        setShowSelectionMenu(
                          false
                        );
                      },
                  },

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

                ]

                : []),

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
            +
            selectedFolders.length
            === 1

            ? selectedFolders
              .length
              === 1

              ? "Eliminare cartella?"

              : "Eliminare file?"

            : "Eliminare elementi?"
        }

        message={
          selectedFiles.length
            +
            selectedFolders.length
            === 1

            ? selectedFolders
              .length
              === 1

              ? "La cartella selezionata e tutto il suo contenuto verranno eliminati definitivamente."

              : "Il file selezionato verrà eliminato definitivamente."

            : selectedFolders
              .length > 0

              ? "Le cartelle selezionate e tutto il loro contenuto verranno eliminati definitivamente."

              : "I file selezionati verranno eliminati definitivamente."
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

      <CreateFolderModal
        visible={
          showCreateFolder
        }

        onClose={() =>
          setShowCreateFolder(
            false
          )
        }

        onCreate={
          createFolder
        }
      />

      <ShareFileModal
        visible={
          showShareModal
        }

        file={
          fileToShare
        }

        onClose={() => {

          setShowShareModal(
            false
          );

          setFileToShare(
            null
          );
        }}

        onShare={
          shareWithUser
        }
      />

    </SafeAreaView>
  );
}