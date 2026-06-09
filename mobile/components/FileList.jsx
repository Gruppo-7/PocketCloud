import { Alert, FlatList, Text, View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import FolderCard from "./FolderCard";

export default function FileList({
    data,
    gridView,
    selectedFiles,
    setSelectedFiles,
    selectionMode,
    setSelectionMode,
    disabled = false,
    sharedMode = false,
    renderSubtitle,
    onDeleteFile,
    onOpenFile,
    onShareFile,
    onPocketShare,
    showDeleteModal,
    setShowDeleteModal,
    loading,
    onRefresh,
    selectedFolders,
    setSelectedFolders,
    currentFolder,
    setCurrentFolder,
    folderHistory,
    setFolderHistory
}) {
    const [selectedFile, setSelectedFile] = useState(null);

    function
        handleDelete() {

        if (
            !selectedFile
        ) {
            return;
        }

        setSelectedFiles(
            [
                selectedFile
            ]
        );

        setSelectionMode(
            true
        );

        setSelectedFile(
            null
        );

        setShowDeleteModal(
            true
        );
    }

    function handleDetails() {

        if (
            !selectedFile
        ) {
            return;
        }

        Alert.alert("Dettagli file",

            `Nome:
${selectedFile.name}

Dimensione:
${(
                selectedFile.size
                / 1024
            ).toFixed(2)} KB

Tipo:
${selectedFile.mime_type
            || "Sconosciuto"}

Creato:
${new Date(
                selectedFile.created_at
            ).toLocaleString()}`
        );
    }

    function
        toggleFileSelection(
            file
        ) {

        const alreadySelected =
            selectedFiles.some(
                f =>
                    f.id ===
                    file.id
            );

        let updatedFiles;

        if (
            alreadySelected
        ) {

            updatedFiles =
                selectedFiles.filter(
                    f =>
                        f.id !==
                        file.id
                );

        } else {

            updatedFiles =
                [
                    ...selectedFiles,
                    file
                ];
        }

        setSelectedFiles(
            updatedFiles
        );
    }

    function renderItem({ item }) {

        if (
            item.itemType
            ===
            "folder"
        ) {

            return (

                <FolderCard

                    folder={item}

                    gridView={
                        gridView
                    }

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

                    onPress={() => {

                        setFolderHistory(
                            prev => [
                                ...prev,
                                currentFolder,
                            ]
                        );

                        setCurrentFolder(
                            item
                        );
                    }}
                />
            );
        }

        return (
            <TouchableOpacity
                disabled={
                    disabled
                }

                onPress={() => {

                    if (
                        disabled
                    ) {
                        return;
                    }

                    if (
                        selectionMode
                    ) {

                        toggleFileSelection(
                            item
                        );

                        return;
                    }

                    onOpenFile?.(
                        item
                    );
                }}

                onLongPress={() => {

                    if (
                        disabled
                    ) {
                        return;
                    }

                    if (
                        !selectionMode
                    ) {

                        setSelectionMode(
                            true
                        );

                        setSelectedFiles(
                            [item]
                        );
                    }
                }}

                style={{
                    opacity:
                        disabled
                            ? 0.5
                            : 1,

                    flex:
                        gridView
                            ? 0.48
                            : undefined,

                    flexDirection:
                        gridView
                            ? "column"
                            : "row",

                    alignItems:
                        "center",

                    backgroundColor:
                        selectedFiles.some(
                            f =>
                                f.id ===
                                item.id
                        )
                            ? "#E8F1FF"
                            : "#fff",

                    borderRadius:
                        16,

                    padding:
                        16,

                    marginBottom:
                        14,

                    borderWidth:
                        1,

                    borderColor:
                        selectedFiles.some(
                            f =>
                                f.id ===
                                item.id
                        )
                            ? "#007AFF"
                            : "#ECECEC",
                }}
            >

                <Ionicons
                    name="document"
                    size={gridView ? 48 : 26}
                />

                {
                    selectedFiles.some(
                        f =>
                            f.id ===
                            item.id
                    ) && (

                        <View
                            style={{
                                position:
                                    "absolute",

                                top: 10,

                                left: 10,

                                backgroundColor:
                                    "#007AFF",

                                borderRadius:
                                    12,

                                padding: 2,
                            }}
                        >
                            <Ionicons
                                name="checkmark"
                                size={16}
                                color="#fff"
                            />
                        </View>
                    )
                }

                <View
                    style={{
                        flex: gridView ? undefined : 1,
                        marginLeft: gridView ? 0 : 12,
                        marginTop: gridView ? 10 : 0,
                        alignItems: gridView ? "center" : "flex-start",
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        {item.name}
                    </Text>

                    {!gridView && renderSubtitle && (
                        <Text
                            style={{
                                color: "gray",
                                marginTop: 3,
                            }}
                        >
                            {renderSubtitle(item)}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    disabled={
                        disabled
                    }

                    onPress={() => {

                        if (
                            disabled
                        ) {
                            return;
                        }

                        setSelectedFile(
                            item
                        );
                    }}

                    style={{
                        position:
                            gridView
                                ? "absolute"
                                : "relative",

                        top:
                            gridView
                                ? 10
                                : undefined,

                        right:
                            gridView
                                ? 10
                                : undefined,

                        padding: 4,
                    }}
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    return (
        <>

            {disabled && (
                <View
                    style={{
                        position:
                            "absolute",

                        top: "45%",

                        left: 0,

                        right: 0,

                        zIndex: 10,

                        alignItems:
                            "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight:
                                "600",
                            color:
                                "#666",
                        }}
                    >
                        ⚠️ Riconnessione
                        al server...
                    </Text>
                </View>
            )}

            <FlatList
                key={gridView ? "grid" : "list"}
                data={data}
                numColumns={gridView ? 2 : 1}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={
                    gridView
                        ? { justifyContent: "space-between" }
                        : undefined
                }
                refreshing={
                    loading
                }

                onRefresh={
                    onRefresh
                }
                contentContainerStyle={{
                    paddingBottom: 30,
                }}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text>
                        Nessun file
                    </Text>
                }
            />

            <Modal
                visible={selectedFile !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedFile(null)}
            >
                <Pressable
                    onPress={() => setSelectedFile(null)}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 220,
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: "700",
                                marginBottom: 16,
                                fontSize: 16,
                            }}
                        >
                            {selectedFile?.name}
                        </Text>

                        <TouchableOpacity
                            onPress={() => {

                                const file =
                                    selectedFile;

                                setSelectedFile(
                                    null
                                );

                                onOpenFile?.(
                                    file
                                );
                            }}

                            style={{
                                paddingVertical: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                }}
                            >
                                Apri
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {

                                const file =
                                    selectedFile;

                                setSelectedFile(
                                    null
                                );

                                onShareFile?.(
                                    file
                                );
                            }}

                            style={{
                                paddingVertical: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                }}
                            >
                                Apri in...
                            </Text>
                        </TouchableOpacity>

                        {
                            !sharedMode && (

                                <TouchableOpacity
                                    onPress={() => {

                                        const file =
                                            selectedFile;

                                        setSelectedFile(
                                            null
                                        );

                                        onPocketShare?.(
                                            file
                                        );
                                    }}

                                    style={{
                                        paddingVertical: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                        }}
                                    >
                                        Condividi con...
                                    </Text>
                                </TouchableOpacity>
                            )
                        }

                        <TouchableOpacity
                            onPress={() => {

                                setSelectedFile(
                                    null
                                );

                                handleDetails();
                            }}

                            style={{
                                paddingVertical: 12,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                }}
                            >
                                Dettagli
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}

                            style={{
                                paddingVertical: 12,
                            }}
                        >
                            <Text
                                style={{
                                    color: "red",
                                    fontSize: 16,
                                }}
                            >
                                {
                                    sharedMode
                                        ? "Rimuovi dai condivisi"
                                        : "Elimina"
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal >
        </>
    );
}
