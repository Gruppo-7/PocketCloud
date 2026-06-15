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
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { generateSalt, deriveMasterKey, generateIV, encryptText, decryptText, encryptFile, decryptFile, generateFileHash, generateFileKey } from "../../utils/crypto";
import { getMasterKey } from "../../utils/secureStorage";


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
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingShares, setPendingShares] = useState([]);

  async function
    uploadFile(

      file,

      conflictStrategy = null,

      fileHash,

      encryptionMetadata = null
    ) {

    try {

      const user =
        await getCurrentUser();

      const baseUrl =
        await getBaseUrl();

      setIsUploading(
        true
      );

      setUploadProgress(
        0
      );

      const subscription =
        FileSystem
          .createUploadTask(
            `${baseUrl}/files/upload`,

            file.uri,

            {

              httpMethod:
                "POST",

              uploadType:
                FileSystem
                  .FileSystemUploadType
                  .MULTIPART,

              fieldName:
                "file",

              mimeType:
                file.mimeType
                ||
                "application/octet-stream",


              headers:
              {
                "x-file-name":
                  encodeURIComponent(
                    file.name
                  ),
              },

              parameters:
              {

                owner_id:
                  String(
                    user.id
                  ),

                folder_id:
                  String(
                    currentFolder
                      ?.id
                    ?? ""
                  ),

                sha256_fingerprint:
                  fileHash,

                ...(conflictStrategy
                  ? {
                    conflict_strategy:
                      conflictStrategy
                  }
                  : {}),

                ...(encryptionMetadata
                  ? {

                    is_encrypted:
                      "true",

                    algorithm:
                      encryptionMetadata
                        .algorithm,

                    encryption_iv:
                      encryptionMetadata
                        .iv,

                    encrypted_file_key:
                      encryptionMetadata
                        .encryptedFileKey,

                    encrypted_file_key_iv:
                      encryptionMetadata
                        .encryptedFileKeyIV,

                    encryption_version:
                      "2",
                  }
                  : {}),
              },
            },

            (
              progress
            ) => {

              const percent =
                Math.round(
                  (
                    progress
                      .totalBytesSent
                    /
                    progress
                      .totalBytesExpectedToSend
                  )
                  * 100
                );

              setUploadProgress(
                percent
              );
            }
          );

      const uploadResult =
        await subscription
          .uploadAsync();

      const response = {
        ok:
          uploadResult
            .status
          >= 200
          &&
          uploadResult
            .status
          < 300,

        status:
          uploadResult
            .status
      };

      const data =
        JSON.parse(
          uploadResult
            .body
        );

      console.log(
        "Upload response:",
        data
      );

      return {
        response,
        data
      };
    } finally {

      setTimeout(
        () => {

          setUploadProgress(
            null
          );

          setIsUploading(
            false
          );
        },

        500
      );
    }
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
    loadPendingShares() {

    try {

      const user =
        await getCurrentUser();

      if (
        !user
      ) {
        return;
      }

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/shared/pending/${user.id}`
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

      setPendingShares(
        Array.isArray(
          data
        )
          ? data
          : []
      );

    } catch (
    error
    ) {

      console.error(
        "Load pending shares error:",
        error
      );
    }
  }

  async function pickDocument(shouldEncrypt = false) {

    try {

      const file =
        await pickSingleFile();

      if (
        !file
      ) {

        return;
      }

      let uploadTarget =
        file;

      let encryptionIV =
        null;

      let encryptionMetadata =
        null;

      if (
        shouldEncrypt
      ) {

        const masterKey =
          await getMasterKey();

        if (
          !masterKey
        ) {

          Alert.alert(

            "Errore",

            "Sessione sicura non disponibile"
          );

          return;
        }

        const fileKey =
          await generateFileKey();

        const fileIV =
          await generateIV();

        const encryptedFileKeyIV =
          await generateIV();

        const encryptedFileKey =
          encryptText(

            fileKey,

            masterKey,

            encryptedFileKeyIV
          );

        encryptionMetadata =
        {
          iv:
            fileIV,

          algorithm:
            "AES-256-CBC",

          encryptedFileKey,

          encryptedFileKeyIV,
        };

        const encryptedUri =
          await encryptFile(

            file.uri,

            fileKey,

            fileIV
          );

        uploadTarget = {

          ...file,

          uri:
            encryptedUri,

          name:
            `${file.name}.encrypted`,
        };

        console.log(
          "Encrypted upload ready"
        );
      }

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

          uploadTarget,

          undefined,

          fileHash,

          shouldEncrypt

            ? encryptionMetadata

            : null
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

      let uploadTarget =
        selectedFile;

      let encryptionMetadata =
        null;

      if (
        fileToReplace
          .is_encrypted
      ) {

        const masterKey =
          await getMasterKey();

        if (
          !masterKey
        ) {

          Alert.alert(

            "Errore",

            "Sessione sicura non disponibile"
          );

          return;
        }

        const decryptionKey =
          decryptText(

            fileToReplace
              .encrypted_file_key,

            masterKey,

            fileToReplace
              .encrypted_file_key_iv
          );

        if (
          !decryptionKey
        ) {

          Alert.alert(

            "Errore",

            "Impossibile recuperare chiave file"
          );

          return;
        }

        const newIV =
          await generateIV();

        const encryptedUri =
          await encryptFile(

            selectedFile.uri,

            decryptionKey,

            newIV
          );

        uploadTarget =
        {
          ...selectedFile,

          uri:
            encryptedUri,

          name:
            fileToReplace
              .name,
        };

        encryptionMetadata =
        {
          encryption_iv:
            newIV,
        };
      }

      const fileHash =
        await generateFileHash(
          selectedFile.uri
        );

      const baseUrl =
        await getBaseUrl();

      setIsUploading(
        true
      );

      setUploadProgress(
        0
      );

      const uploadTask =
        FileSystem
          .createUploadTask(
            `${baseUrl}/files/${fileToReplace.id}/replace`,

            uploadTarget.uri,

            {

              httpMethod:
                "PATCH",

              uploadType:
                FileSystem
                  .FileSystemUploadType
                  .MULTIPART,

              fieldName:
                "file",

              mimeType:
                selectedFile.mimeType
                ||
                "application/octet-stream",

              headers:
              {
                "x-file-name":
                  encodeURIComponent(
                    uploadTarget.name
                  ),
              },

              parameters:
              {

                userId:
                  String(
                    user.id
                  ),

                sha256_fingerprint:
                  fileHash,
                ...(encryptionMetadata
                  || {}),
              },
            },

            (
              progress
            ) => {

              const percent =
                Math.round(
                  (
                    progress
                      .totalBytesSent
                    /
                    progress
                      .totalBytesExpectedToSend
                  )
                  * 100
                );

              setUploadProgress(
                percent
              );
            }
          );

      const uploadResult =
        await uploadTask
          .uploadAsync();

      const response = {
        ok:
          uploadResult
            .status
          >= 200
          &&
          uploadResult
            .status
          < 300,

        status:
          uploadResult
            .status
      };

      const data =
        JSON.parse(
          uploadResult
            .body
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

    } finally {

      setTimeout(
        () => {

          setUploadProgress(
            null
          );

          setIsUploading(
            false
          );
        },

        500
      );
    }
  }

  async function
    renameFile(
      file,
      newName
    ) {

    try {

      const user =
        await getCurrentUser();

      const finalName =
        newName.trim();

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
                  finalName,

                userId:
                  user.id
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
    acceptShare(
      share
    ) {

    try {

      const masterKey =
        await getMasterKey();

      if (
        !masterKey
      ) {

        Alert.alert(

          "Errore",

          "Sessione sicura non disponibile"
        );

        return;
      }

      const fileKey =
        share
          .pending_file_key;

      if (
        !fileKey
      ) {

        Alert.alert(

          "Errore",

          "Chiave file non disponibile"
        );

        return;
      }

      const encryptedFileKeyIV =
        await generateIV();

      const encryptedFileKey =
        encryptText(

          fileKey,

          masterKey,

          encryptedFileKeyIV
        );

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/shared/${share.id}/accept`,
          {

            method:
              "PATCH",

            headers:
            {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                encrypted_file_key:
                  encryptedFileKey,

                encrypted_file_key_iv:
                  encryptedFileKeyIV,
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

      await loadPendingShares();

      Alert.alert(

        "Condivisione accettata",

        share.name
      );

    } catch (
    error
    ) {

      console.error(
        "Accept share error:",
        error
      );

      Alert.alert(
        "Errore",
        "Accettazione fallita"
      );
    }
  }

  async function
    rejectShare(
      shareId
    ) {

    try {

      const baseUrl =
        await getBaseUrl();

      const response =
        await fetch(
          `${baseUrl}/shared/${shareId}`,
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

        throw new Error(
          data.error
        );
      }

      setPendingShares(
        prev =>
          prev.filter(
            share =>
              share.id
              !==
              shareId
          )
      );

      Alert.alert(
        "Condivisione rifiutata"
      );

    } catch (
    error
    ) {

      console.error(
        "Reject share error:",
        error
      );

      Alert.alert(
        "Errore",
        "Impossibile rifiutare la condivisione"
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

      const user =
        await getCurrentUser();

      const baseUrl =
        await getBaseUrl();

      let pendingFileKey =
        null;

      if (
        file.is_encrypted
        &&
        file.encryption_version
        >= 2
      ) {

        const masterKey =
          await getMasterKey();

        if (
          !masterKey
        ) {

          Alert.alert(

            "Errore",

            "Sessione sicura non disponibile"
          );

          return;
        }

        pendingFileKey =
          decryptText(

            file
              .encrypted_file_key,

            masterKey,

            file
              .encrypted_file_key_iv
          );

        if (
          !pendingFileKey
        ) {

          Alert.alert(

            "Errore",

            "Impossibile condividere file crittografato"
          );

          return;
        }

        console.log(
          "Recovered share file key"
        );
      }

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

                pending_file_key:
                  pendingFileKey
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

  useFocusEffect(

    React.useCallback(
      () => {

        reloadFiles();

        reloadFolders();

        loadPendingShares();

      },

      []
    )
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

        {
          pendingShares.length
          > 0
          && (

            <TouchableOpacity

              onPress={() => {

                const share =
                  pendingShares[0];

                Alert.alert(

                  "Share ricevuta",

                  `${share.shared_by}
ha condiviso
${share.name}`,

                  [

                    {
                      text:
                        "Rifiuta",

                      style:
                        "destructive",

                      onPress:
                        () =>
                          rejectShare(
                            share.id
                          ),
                    },

                    {
                      text:
                        "Accetta",

                      onPress:
                        () =>
                          acceptShare(
                            share
                          ),
                    },
                  ]
                );
              }}

              style={{
                backgroundColor:
                  "#FFF",

                borderRadius:
                  16,

                padding:
                  16,

                marginBottom:
                  16,

                borderWidth:
                  1,

                borderColor:
                  "#E5E5E5",
              }}
            >

              <Text
                style={{
                  fontWeight:
                    "600",
                }}
              >
                Nuove condivisioni
              </Text>

              <Text
                style={{
                  marginTop:
                    4,
                  color:
                    "gray",
                }}
              >
                {
                  pendingShares
                    .length
                } file in attesa
              </Text>

            </TouchableOpacity>
          )
        }

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

          onReplaceFile={
            replaceFile
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

          files={
            files
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
                  () =>

                    Alert.alert(

                      "Carica file",

                      "Vuoi crittografare il file?",

                      [

                        {
                          text:
                            "Normale",

                          onPress:
                            () =>
                              pickDocument(
                                false
                              ),
                        },

                        {
                          text:
                            "🔒 Crittografato",

                          onPress:
                            () =>
                              pickDocument(
                                true
                              ),
                        },

                        {
                          text:
                            "Annulla",

                          style:
                            "cancel",
                        },
                      ]
                    ),
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

    </SafeAreaView>
  );
}