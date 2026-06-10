import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
} from "react-native";

import {
    Ionicons
} from "@expo/vector-icons";

export default function
MoveModal({

    visible,

    folders,

    selectedFolder,

    setSelectedFolder,

    onCancel,

    onConfirm,
}) {

    const rootItem = {

        id:
            null,

        name:
            "Root",
    };

    const allFolders =
        [
            rootItem,
            ...folders,
        ];

    return (

        <Modal
            visible={
                visible
            }

            transparent

            animationType=
            "fade"
        >

            <View
                style={{
                    flex: 1,

                    justifyContent:
                        "center",

                    alignItems:
                        "center",

                    backgroundColor:
                        "rgba(0,0,0,0.35)",

                    padding:
                        24,
                }}
            >

                <View
                    style={{
                        width:
                            "100%",

                        backgroundColor:
                            "#fff",

                        borderRadius:
                            24,

                        padding:
                            24,

                        maxHeight:
                            "70%",
                    }}
                >

                    <Text
                        style={{
                            fontSize:
                                22,

                            fontWeight:
                                "700",

                            marginBottom:
                                18,
                        }}
                    >
                        Sposta in...
                    </Text>

                    <FlatList
                        data={
                            allFolders
                        }

                        keyExtractor={(
                            item
                        ) =>
                            String(
                                item.id
                            )
                        }

                        renderItem={({
                            item
                        }) => {

                            const isSelected =
                                selectedFolder
                                    ?.id
                                ===
                                item.id;

                            return (

                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedFolder(
                                            item
                                        )
                                    }

                                    style={{
                                        flexDirection:
                                            "row",

                                        alignItems:
                                            "center",

                                        paddingVertical:
                                            14,

                                        paddingHorizontal:
                                            12,

                                        borderRadius:
                                            14,

                                        backgroundColor:
                                            isSelected

                                                ? "#E8F1FF"

                                                : "transparent",
                                    }}
                                >

                                    <Ionicons
                                        name=
                                        "folder"

                                        size={
                                            22
                                        }

                                        color=
                                        "#007AFF"
                                    />

                                    <Text
                                        style={{
                                            marginLeft:
                                                12,

                                            fontSize:
                                                16,

                                            flex:
                                                1,

                                            fontWeight:
                                                isSelected

                                                    ? "600"

                                                    : "400",
                                        }}
                                    >
                                        {
                                            item.name
                                        }
                                    </Text>

                                </TouchableOpacity>
                            );
                        }}
                    />

                    <View
                        style={{
                            flexDirection:
                                "row",

                            justifyContent:
                                "flex-end",

                            gap:
                                12,

                            marginTop:
                                20,
                        }}
                    >

                        <TouchableOpacity
                            onPress={
                                onCancel
                            }

                            style={{
                                paddingVertical:
                                    12,

                                paddingHorizontal:
                                    18,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize:
                                        16,
                                }}
                            >
                                Annulla
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={
                                !selectedFolder
                            }

                            onPress={
                                onConfirm
                            }

                            style={{
                                backgroundColor:
                                    "#007AFF",

                                opacity:
                                    selectedFolder
                                        ? 1
                                        : 0.5,

                                borderRadius:
                                    12,

                                paddingVertical:
                                    12,

                                paddingHorizontal:
                                    18,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        "#fff",

                                    fontWeight:
                                        "600",
                                }}
                            >
                                Sposta qui
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </View>

        </Modal>
    );
}