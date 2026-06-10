import { View, Text, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function
    FolderCard({

        folder,

        gridView,

        onPress,

        onMenuPress,

        selectionMode,

        selectedFolders,

        setSelectedFolders,

        setSelectionMode
    }) {

    const isSelected =
        selectedFolders
            ?.some(
                f =>
                    f.id ===
                    folder.id
            );

    function
        toggleFolderSelection() {

        if (
            !selectionMode
        ) {

            setSelectionMode(
                true
            );

            setSelectedFolders(
                [folder]
            );

            return;
        }

        const alreadySelected =
            selectedFolders
                .some(
                    f =>
                        f.id ===
                        folder.id
                );

        if (
            alreadySelected
        ) {

            setSelectedFolders(
                prev =>
                    prev.filter(
                        f =>
                            f.id !==
                            folder.id
                    )
            );

        } else {

            setSelectedFolders(
                prev => [
                    ...prev,
                    folder,
                ]
            );
        }
    }

    return (

        <TouchableOpacity

            onLongPress={
                toggleFolderSelection
            }

            onPress={() => {

                if (
                    selectionMode
                ) {

                    toggleFolderSelection();

                    return;
                }

                onPress();
            }}

            style={{
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
                    isSelected
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
                    isSelected
                        ? "#007AFF"
                        : "#ECECEC",
            }}
        >

            <Ionicons
                name="folder"
                size={
                    gridView
                        ? 48
                        : 26
                }

                color="#007AFF"
            />

            <View
                style={{
                    flex:
                        gridView
                            ? undefined
                            : 1,

                    marginLeft:
                        gridView
                            ? 0
                            : 12,

                    marginTop:
                        gridView
                            ? 10
                            : 0,

                    alignItems:
                        gridView
                            ? "center"
                            : "flex-start",
                }}
            >

                <Text
                    numberOfLines={
                        1
                    }

                    style={{
                        fontSize:
                            16,

                        fontWeight:
                            "600",
                    }}
                >
                    {
                        folder.name
                    }
                </Text>

            </View>

            <TouchableOpacity

                onPress={
                    onMenuPress
                }

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

                    padding:
                        4,
                }}
            >
                <Ionicons
                    name=
                    "ellipsis-vertical"

                    size={
                        20
                    }
                />
            </TouchableOpacity>

        </TouchableOpacity>
    );
}