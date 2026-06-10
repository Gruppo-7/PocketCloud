import { Alert, FlatList, Text, View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import FolderCard from "./FolderCard";
import RenameModal from "./RenameModal";
import { formatFileSize, formatDate } from "../utils/formatters";

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
    setFolderHistory,
    onRenameFile,
    onRenameFolder,
    folders,
    files,

    setItemToMove,

    setShowMoveModal
}) {
    const [selectedFile, setSelectedFile] = useState(null);

    const [selectedFolder, setSelectedFolder] = useState(null);

    const [fileToRename, setFileToRename] = useState(null);

    const [showRenameModal, setShowRenameModal] = useState(false);

    const [menuType, setMenuType] = useState(null);

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

    function
        handleDetails() {

        if (
            selectedFolder
        ) {

            const filesCount =
                files.filter(
                    file =>
                        file.folder_id
                        ===
                        selectedFolder.id
                ).length;

            const foldersCount =
                folders.filter(
                    folder =>
                        folder.parent_folder_id
                        ===
                        selectedFolder.id
                ).length;

            const parentFolder =
                folders.find(
                    folder =>
                        folder.id
                        ===
                        selectedFolder
                            .parent_folder_id
                );

            Alert.alert(

                "Dettagli cartella",

                `Nome:
${selectedFolder.name}

Posizione:
${parentFolder
                    ?.name
                ?? "Root"}

Contenuto:
${filesCount} file
${foldersCount} cartelle

Creata:
${formatDate(
                    selectedFolder
                        .created_at
                )}

Ultima modifica:
${formatDate(
                    selectedFolder
                        .updated_at
                )}`
            );

            return;
        }

        if (
            !selectedFile
        ) {
            return;
        }

        const parentFolder =
            folders.find(
                folder =>
                    folder.id
                    ===
                    selectedFile
                        .folder_id
            );

        Alert.alert(

            "Dettagli file",

            `Nome:
${selectedFile.name}

Tipo:
${selectedFile.mime_type
            || "Sconosciuto"}

Dimensione:
${formatFileSize(
                Number(
                    selectedFile.size
                )
            )}

Posizione:
${parentFolder
                ?.name
            ?? "Root"}

Creato:
${formatDate(
                selectedFile
                    .created_at
            )}

Ultima modifica:
${formatDate(
                selectedFile
                    .updated_at
            )}`
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

        const canWrite =
            !sharedMode
            ||
            item.permission
            ===
            "write";

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

                    onMenuPress={() => {

                        setMenuType(
                            "folder"
                        );

                        setSelectedFolder(
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

                        setMenuType(
                            "file"
                        );

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

    const isFolderMenu =
        menuType
        ===
        "folder";

    const canWriteSelected =
        !sharedMode
        ||
        selectedFile?.permission
        ===
        "write";

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
                keyExtractor={(item) =>

                    `${item.itemType}-${item.id}`
                }
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
                visible={
                    selectedFile !== null
                    ||
                    selectedFolder !== null
                }
                transparent
                animationType="fade"
                onRequestClose={() => {

                    setSelectedFile(
                        null
                    );

                    setSelectedFolder(
                        null
                    );

                    setMenuType(
                        null
                    );
                }}
            >
                <View
                    style={{
                        flex: 1,

                        backgroundColor:
                            "rgba(0,0,0,0.25)",

                        justifyContent:
                            "center",

                        alignItems:
                            "center",
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}

                        onPress={() => {

                            setSelectedFile(
                                null
                            );

                            setSelectedFolder(
                                null
                            );
                        }}

                        style={{
                            position:
                                "absolute",

                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }}
                    />
                    <Pressable
                        style={{
                            backgroundColor:
                                "#fff",

                            borderRadius:
                                24,

                            padding:
                                20,

                            width:
                                "82%",

                            maxWidth:
                                380,
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: "700",
                                marginBottom: 16,
                                fontSize: 16,
                            }}
                        >
                            {selectedFile?.name
                                ||
                                selectedFolder?.name}
                        </Text>

                        <TouchableOpacity
                            onPress={() => {

                                if (
                                    isFolderMenu
                                ) {

                                    setFolderHistory(
                                        prev => [
                                            ...prev,
                                            currentFolder,
                                        ]
                                    );

                                    setCurrentFolder(
                                        selectedFolder
                                    );

                                    setSelectedFolder(
                                        null
                                    );

                                    setSelectedFile(
                                        null
                                    );

                                    return;
                                }

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
                                paddingVertical:
                                    12,
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

                        {
                            !isFolderMenu && (

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
                                        paddingVertical:
                                            12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize:
                                                16,
                                        }}
                                    >
                                        Apri in...
                                    </Text>
                                </TouchableOpacity>
                            )
                        }

                        {
                            !sharedMode
                            &&
                            !isFolderMenu
                            && (

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

                        {
                            !isFolderMenu
                            &&
                            canWriteSelected
                            && (

                                <TouchableOpacity
                                    onPress={() => {

                                        Alert.alert(
                                            "Presto disponibile",
                                            "Aggiornamento file in sviluppo"
                                        );
                                    }}

                                    style={{
                                        paddingVertical:
                                            12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize:
                                                16,
                                        }}
                                    >
                                        Aggiorna file
                                    </Text>
                                </TouchableOpacity>
                            )
                        }

                        {
                            canWriteSelected && (

                                <TouchableOpacity
                                    onPress={() => {

                                        const itemToRename =

                                            selectedFile
                                            ||
                                            selectedFolder;

                                        setFileToRename(
                                            itemToRename
                                        );

                                        setSelectedFile(
                                            null
                                        );

                                        setSelectedFolder(
                                            null
                                        );

                                        setTimeout(() => {

                                            setShowRenameModal(
                                                true
                                            );

                                        }, 150);
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
                                        Rinomina
                                    </Text>
                                </TouchableOpacity>
                            )
                        }

                        {
                            !sharedMode && (

                                <TouchableOpacity
                                    onPress={() => {

                                        setItemToMove(

                                            selectedFile
                                            ||
                                            selectedFolder
                                        );

                                        setSelectedFile(
                                            null
                                        );

                                        setSelectedFolder(
                                            null
                                        );

                                        setMenuType(
                                            null
                                        );

                                        setTimeout(() => {

                                            setShowMoveModal(
                                                true
                                            );

                                        }, 150);
                                    }}

                                    style={{
                                        paddingVertical:
                                            12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize:
                                                16,
                                        }}
                                    >
                                        Sposta
                                    </Text>
                                </TouchableOpacity>
                            )
                        }

                        <TouchableOpacity
                            onPress={() => {

                                handleDetails();

                                setSelectedFile(
                                    null
                                );

                                setSelectedFolder(
                                    null
                                );

                                setMenuType(
                                    null
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
                                Dettagli
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {

                                if (
                                    selectedFolder
                                ) {

                                    setSelectedFolders(
                                        [
                                            selectedFolder
                                        ]
                                    );

                                    setSelectedFile(
                                        null
                                    );

                                    setSelectedFolder(
                                        null
                                    );

                                } else {

                                    setSelectedFiles(
                                        [
                                            selectedFile
                                        ]
                                    );

                                    setSelectedFile(
                                        null
                                    );
                                }

                                setShowDeleteModal(
                                    true
                                );
                            }}

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
                    </Pressable>
                </View>
            </Modal >
            <RenameModal
                visible={
                    showRenameModal
                }

                title={
                    fileToRename
                        ?.itemType
                        === "folder"

                        ? "Rinomina cartella"

                        : "Rinomina file"
                }

                initialValue={
                    fileToRename?.name
                }

                onClose={() => {

                    setShowRenameModal(
                        false
                    );
                }}

                onSave={async (
                    newName
                ) => {

                    if (
                        fileToRename
                            ?.itemType
                        === "folder"
                    ) {

                        await onRenameFolder?.(

                            fileToRename.id,

                            newName
                        );

                    } else {

                        await onRenameFile?.(

                            fileToRename.id,

                            newName
                        );
                    }

                    setShowRenameModal(
                        false
                    );

                    setFileToRename(
                        null
                    );
                }}
            />
        </>
    );
}
