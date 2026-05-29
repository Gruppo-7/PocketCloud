import { FlatList, Text, View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function FileList({
    data,
    gridView,
    renderSubtitle,
    onDeleteFile,
}) {
    const [selectedFile, setSelectedFile] = useState(null);

    function handleDelete() {
        if (selectedFile) {
            onDeleteFile(selectedFile.id);
            setSelectedFile(null);
        }
    }

    function renderItem({ item }) {
        return (
            <View
                style={{
                    flex: gridView ? 0.48 : undefined,
                    flexDirection: gridView ? "column" : "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: "#ECECEC",
                }}
            >
                <Ionicons
                    name="document"
                    size={gridView ? 48 : 26}
                />

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

                {!gridView && (
                    <TouchableOpacity onPress={() => setSelectedFile(item)}>
                        <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <>
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
                                marginBottom: 12,
                            }}
                        >
                            {selectedFile?.name}
                        </Text>

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
                                Elimina
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}
