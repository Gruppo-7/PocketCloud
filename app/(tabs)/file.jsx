import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import FileList from "../../components/FileList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import FilterChips from "../../components/FilterChips";
import SortMenu from "../../components/SortMenu";

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

  const [files, setFiles] = useState([
    {
      id: "1",
      name: "Documento.pdf",
      size: 2400000,
      modifiedAt:
        "2026-05-20T10:30:00",
    },

    {
      id: "2",
      name: "Vacanze.jpg",
      size: 1200000,
      modifiedAt:
        "2026-05-18T16:00:00",
    },

    {
      id: "3",
      name: "Progetto.zip",
      size: 54000000,
      modifiedAt:
        "2026-05-15T08:00:00",
    },

    {
      id: "4",
      name: "Budget.xlsx",
      size: 890000,
      modifiedAt:
        "2026-05-10T12:00:00",
    },
  ]);

  const deleteFile = (fileId) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileId)
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

  // RICERCA, ORDINAMENTO FILE E FILTRAGGIO FILE
  const filteredFiles =
    files.filter(
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
          renderSubtitle={(item) =>
            "2 MB • ieri"
          }
          onDeleteFile={deleteFile}
        />
      </View>
    </SafeAreaView>
  );
}
