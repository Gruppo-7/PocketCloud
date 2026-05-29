import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import { FlatList, Text, View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import FilterChips from "../../components/FilterChips";
import { SafeAreaView } from "react-native-safe-area-context";
import FileList from "../../components/FileList";
import { useState } from "react";
import SortMenu from "../../components/SortMenu";

export default function SharedScreen() {

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

  /* Mock dati condivisi */
  const [sharedFiles, setSharedFiles] = useState([
    {
      id: "1",
      name: "Tesi.pdf",

      owner:
        "Mario Rossi",

      permission:
        "Lettura",

      modifiedAt:
        "2026-05-20T10:30:00",
    },

    {
      id: "2",
      name:
        "Budget.xlsx",

      owner:
        "Luca Verdi",

      permission:
        "Modifica",

      modifiedAt:
        "2026-05-18T16:00:00",
    },

    {
      id: "3",
      name:
        "Presentazione.pptx",

      owner:
        "Giulia Bianchi",

      permission:
        "Lettura",

      modifiedAt:
        "2026-05-16T12:00:00",
    },
  ]);

  const deleteFile = (fileId) => {
    setSharedFiles(
      (prevFiles) =>
        prevFiles.filter(
          (file) =>
            file.id !== fileId
        )
    );
  };

  const getFileType = (
    fileName
  ) => {

    const extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase();

    // DOCUMENTI
    if (
      [
        "pdf",
        "doc",
        "docx",
        "txt",
        "xlsx",
        "xls",
        "ppt",
        "pptx",
      ].includes(
        extension
      )
    ) {
      return "document";
    }

    // IMMAGINI
    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "heic",
      ].includes(
        extension
      )
    ) {
      return "image";
    }

    // VIDEO
    if (
      [
        "mp4",
        "mov",
        "avi",
        "mkv",
        "webm",
      ].includes(
        extension
      )
    ) {
      return "video";
    }

    // AUDIO
    if (
      [
        "mp3",
        "wav",
        "aac",
        "flac",
        "ogg",
      ].includes(
        extension
      )
    ) {
      return "audio";
    }

    return "other";
  };

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
                b.modifiedAt
              ).getTime()
              -
              new Date(
                a.modifiedAt
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

          {/* AZIONI HEADER */}
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
          data={sortedFiles}
          gridView={gridView}
          renderSubtitle={(item) =>
            `${item.owner} • ${item.permission}`
          }
          onDeleteFile={deleteFile}
        />
      </View>
    </SafeAreaView>
  );
}