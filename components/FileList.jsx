import { FlatList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FileList({
    data,
    gridView,
    renderSubtitle,
}) {

    function renderItem({ item }) {
        return (
            <View
                style={{
                    flex: gridView ? 0.48 : undefined,

                    flexDirection:
                        gridView
                            ? "column"
                            : "row",

                    alignItems: "center",

                    backgroundColor:
                        "#fff",

                    borderRadius: 16,

                    padding: 16,

                    marginBottom: 14,

                    borderWidth: 1,

                    borderColor:
                        "#ECECEC",
                }}
            >
                {/* Icona file */}
                <Ionicons
                    name="document"
                    size={
                        gridView
                            ? 48
                            : 26
                    }
                />

                {/* Testi */}
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
                    {/* Nome file */}
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: 16,
                            fontWeight: "600",
                        }}
                    >
                        {item.name}
                    </Text>

                    {/* Sottotitolo */}
                    {!gridView &&
                        renderSubtitle && (
                            <Text
                                style={{
                                    color: "gray",
                                    marginTop: 3,
                                }}
                            >
                                {renderSubtitle(
                                    item
                                )}
                            </Text>
                        )}
                </View>

                {/* Menu */}
                {!gridView && (
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                    />
                )}
            </View>
        );
    }

    return (
        <FlatList
            key={
                gridView
                    ? "grid"
                    : "list"
            }

            data={data}

            numColumns={
                gridView
                    ? 2
                    : 1
            }

            keyExtractor={(
                item
            ) => item.id}

            columnWrapperStyle={
                gridView
                    ? {
                        justifyContent:
                            "space-between",
                    }
                    : undefined
            }

            contentContainerStyle={{
                paddingBottom: 30,
            }}

            renderItem={
                renderItem
            }

            ListEmptyComponent={
                <Text>
                    Nessun file
                </Text>
            }
        />
    );
}