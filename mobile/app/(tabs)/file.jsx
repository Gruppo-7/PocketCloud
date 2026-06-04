import { Ionicons } from "@expo/vector-icons";
import { Alert, FlatList, Text, View, TouchableOpacity, TextInput, ScrollView, Linking, Platform } from "react-native";
import FileList from "../../components/FileList";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/SearchBar";
import FilterChips from "../../components/FilterChips";
import SortMenu from "../../components/SortMenu";
import { useState } from "react";
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

export default function FilesScreen() {

  const [showFilters, setShowFilters] = useState(false);

  const [filterType, setFilterType] = useState("all");

  const [showSearch, setShowSearch] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [gridView, setGridView] = useState(false);

  /* False -> elenco
     True -> griglia */

  const [showSortMenu, setShowSortMenu] = useState(false);

  const [sortBy, setSortBy] = useState("modified");

  const { serverOnline } = useServerStatus();

  const { files, setFiles, reloadFiles } = useFiles("files");

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
    shareFile(
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


  // RICERCA, ORDINAMENTO FILE E FILTRAGGIO FILE
  const filteredFiles = files.filter((file) => {

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
    [...filteredFiles].sort(
      (a, b) => {

        switch (
        sortBy
        ) {

          case "name":
            return a.name
              .toLowerCase()
              .localeCompare(
                b.name
                  .toLowerCase()
              );

          case "size":
            return (
              b.size -
              a.size
            );

          case "modified":
            return (
              new Date(
                b.created_at
              ).getTime()
              -
              new Date(
                a.created_at
              ).getTime()
            );

          default:
            return 0;
        }
      }
    );

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
                  name: "Nome",

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
              name="chevron-down"
              size={18}
              style={{
                marginLeft: 4,
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

        {/* MENU ORDINAMENTO */}
        <SortMenu
          showSortMenu={
            showSortMenu
          }

          setShowSortMenu={
            setShowSortMenu
          }

          sortBy={sortBy}

          setSortBy={
            setSortBy
          }

          options={[
            {
              key: "name",
              label: "Nome",
            },
            {
              key: "modified",
              label:
                "Ultima modifica",
            },
            {
              key: "size",
              label:
                "Dimensione",
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
          data={sortedFiles}
          gridView={gridView}
          disabled={!serverOnline}

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
            shareFile
          }
        />
      </View>

      {/* PULSANTE AGGIUNGI */}
      <FAB
        disabled={
          !serverOnline
        }

        onPress={
          serverOnline
            ? pickDocument
            : undefined
        }
      />
    </SafeAreaView>
  );
}
