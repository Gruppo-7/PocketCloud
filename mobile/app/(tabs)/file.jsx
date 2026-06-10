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
import { openFile, openInSystem } from "../../utils/fileActions";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import MoveModal from "../../components/MoveModal";

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
  const { folders, setFolders, reloadFolders } = useFolders();
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);

  async function
    uploadFile(
      file,
      conflictStrategy = null,
      fileHash
    ) {

    const user =
      await getCurrentUser();

    const formData =
      new FormData();

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

    formData.append(
      "sha256_fingerprint",
      fileHash
    );

    if (
      conflictStrategy
    ) {

      formData.append(
        "conflict_strategy",
        conflictStrategy
      );
    }

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
      await response
        .json();

    console.log(
      "Upload response:",
      data
    );

    return {
      response,
      data
    };
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

      const fileHash =
        await generateFileHash(
          file.uri
        );

      console.log(
        "SHA256:",
        fileHash
      );

      console.log(
        "Selected file:",
        file
      );

      const {
        response,
        data
      } =
        await uploadFile(
          file,
          undefined,
          fileHash
        );

      if (
        !response.ok
      ) {

        if (
          data.conflict
        ) {

          Alert.alert(

            data.sameContent
              ? "File già esistente"
              : "Nome già utilizzato",

            data.sameContent

              ? `Questo file esiste già.`

              : `Esiste già un file chiamato "${file.name}", ma il contenuto è diverso.`,

            [

              {
                text:
                  "Annulla",

                style:
                  "cancel",
              },

              {
                text:
                  "Mantieni entrambi",

                onPress:
                  async () => {

                    try {

                      const {

                        response:
                        retryResponse,

                        data:
                        retryData

                      } =
                        await uploadFile(

                          file,

                          "keep_both",

                          fileHash
                        );

                      console.log(
                        "Retry upload:",
                        retryData
                      );

                      if (
                        !retryResponse.ok
                      ) {

                        Alert.alert(
                          "Errore",
                          "Upload fallito"
                        );

                        return;
                      }

                      await reloadFiles();

                      Alert.alert(

                        "Upload riuscito",

                        retryData
                          .file
                          .name
                      );

                    } catch (
                    error
                    ) {

                      console.error(
                        "Retry upload error:",
                        error
                      );

                      Alert.alert(
                        "Errore",
                        "Upload fallito"
                      );
                    }
                  },
              },

              {
                text:
                  "Sostituisci",

                style:
                  "destructive",

                onPress:
                  async () => {

                    try {

                      const {

                        response:
                        retryResponse,

                        data:
                        retryData

                      } =
                        await uploadFile(

                          file,

                          "replace",

                          fileHash
                        );

                      console.log(
                        "Replace upload:",
                        retryData
                      );

                      if (
                        !retryResponse.ok
                      ) {

                        Alert.alert(
                          "Errore",
                          "Sostituzione fallita"
                        );

                        return;
                      }

                      await reloadFiles();

                      Alert.alert(
                        "File sostituito",
                        retryData
                          .file
                          .name
                      );

                    } catch (
                    error
                    ) {

                      console.error(
                        "Replace upload error:",
                        error
                      );

                      Alert.alert(
                        "Errore",
                        "Sostituzione fallita"
                      );
                    }
                  },
              },
            ]
          );

          return;
        }

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
    renameFolder(
      folderId,
      newName
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/folders/${folderId}/rename`,
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
              }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Rename folder:",
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

      setFolders(
        prev =>
          prev.map(
            folder =>

              folder.id ===
                folderId

                ? {
                  ...folder,
                  name:
                    newName,
                }

                : folder
          )
      );

      Alert.alert(
        "Rinominata",
        "Cartella rinominata"
      );

    } catch (
    error
    ) {

      console.error(
        "Rename folder error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile rinominare cartella"
      );
    }
  }

  function
    isDescendantFolder(
      folderId,
      targetFolderId
    ) {

    if (
      !targetFolderId
    ) {

      return false;
    }

    let currentId =
      targetFolderId;

    while (
      currentId
      !==
      null
    ) {

      if (
        currentId
        ===
        folderId
      ) {

        return true;
      }

      const folder =
        folders.find(
          f =>
            f.id
            ===
            currentId
        );

      if (
        !folder
      ) {

        return false;
      }

      currentId =
        folder.parent_folder_id;
    }

    return false;
  }

  async function
    moveItem() {

    try {

      if (
        !itemToMove
      ) {
        return;
      }

      const targetFolderId =
        selectedMoveFolder
          ?.id
        ?? null;

      const isFolder =

        itemToMove
          .itemType
        ===
        "folder";

      /* stessa posizione */

      if (
        !isFolder
      ) {

        const currentFolderId =

          itemToMove
            .folder_id
          ?? null;

        if (
          currentFolderId
          ===
          targetFolderId
        ) {

          Alert.alert(

            "Nessuno spostamento",

            "Il file si trova già qui."
          );

          return;
        }

      } else {

        const currentParentId =

          itemToMove
            .parent_folder_id
          ?? null;

        if (
          currentParentId
          ===
          targetFolderId
        ) {

          Alert.alert(

            "Nessuno spostamento",

            "La cartella si trova già qui."
          );

          return;
        }

        /* sé stessa */

        if (
          Number(
            targetFolderId
          )
          ===
          Number(
            itemToMove.id
          )
        ) {

          Alert.alert(

            "Spostamento non valido",

            "Una cartella non può essere spostata dentro sé stessa."
          );

          return;
        }

        /* sottocartella propria */

        if (

          isDescendantFolder(

            Number(
              itemToMove.id
            ),

            Number(
              targetFolderId
            )
          )
        ) {

          Alert.alert(

            "Spostamento non valido",

            "Una cartella non può essere spostata dentro una sua sottocartella."
          );

          return;
        }
      }

      const baseUrl =
        await getBaseUrl();

      const endpoint =

        isFolder

          ? `${baseUrl}/folders/${itemToMove.id}/move`

          : `${baseUrl}/files/${itemToMove.id}/move`;

      const body =

        isFolder

          ? {
            parent_folder_id:
              selectedMoveFolder
                ?.id
              ?? null,
          }

          : {
            folder_id:
              selectedMoveFolder
                ?.id
              ?? null,
          };

      const response =
        await fetch(
          endpoint,
          {

            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body
              ),
          }
        );

      const data =
        await response
          .json();

      console.log(
        "Move response:",
        data
      );

      if (
        !response.ok
      ) {

        throw new Error(
          data.error
        );
      }

      await reloadFiles?.();

      await reloadFolders?.();

      setShowMoveModal(
        false
      );

      setSelectedMoveFolder(
        null
      );

      setItemToMove(
        null
      );

      Alert.alert(

        "Spostato",

        isFolder

          ? "Cartella spostata"

          : "File spostato"
      );

    } catch (
    error
    ) {

      console.error(
        "Move error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile spostare elemento"
      );
    }
  }

  async function
    renameFile(
      fileId,
      newName
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/files/${fileId}/rename`,
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
              }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Rename response:",
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

  async function
    deleteFile(
      fileId,
      showAlert = true
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

      setSelectedFiles([]);

      setSelectionMode(
        false
      );

      if (
        showAlert
      ) {

        Alert.alert(
          "Eliminato",
          "File rimosso"
        );
      }

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

  const visibleFolders =
    (
      folders
      || []
    ).filter(
      folder =>
        folder.parent_folder_id
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

  const combinedItems =
    [
      ...visibleFolders.map(
        folder => ({
          ...folder,
          itemType:
            "folder",
        })
      ),

      ...sortedFiles.map(
        file => ({
          ...file,
          itemType:
            "file",
        })
      ),
    ];

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
          file.id,
          false
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

      const totalDeleted =
        selectedFiles.length
        +
        selectedFolders.length;

      Alert.alert(

        totalDeleted === 1

          ? "Eliminato"

          : "Eliminati",

        totalDeleted === 1

          ? "Elemento eliminato"

          : `${totalDeleted} elementi eliminati`
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

        <FileList
          data={combinedItems}
          gridView={gridView}
          disabled={!serverOnline}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          selectedFolders={
            selectedFolders
          }

          setSelectedFolders={
            setSelectedFolders
          }

          currentFolder={
            currentFolder
          }

          setCurrentFolder={
            setCurrentFolder
          }

          folderHistory={
            folderHistory
          }

          setFolderHistory={
            setFolderHistory
          }

          onRenameFile={
            renameFile
          }

          onRenameFolder={
            renameFolder
          }

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

          folders={
            folders
          }

          setItemToMove={
            setItemToMove
          }

          setShowMoveModal={
            setShowMoveModal
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
                  pickDocument,
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

      <MoveModal
        visible={
          showMoveModal
        }

        folders={
          folders
        }

        selectedFolder={
          selectedMoveFolder
        }

        setSelectedFolder={
          setSelectedMoveFolder
        }

        onCancel={() => {

          setShowMoveModal(
            false
          );

          setSelectedMoveFolder(
            null
          );

          setItemToMove(
            null
          );
        }}

        onConfirm={
          moveItem
        }
      />

    </SafeAreaView>
  );
}