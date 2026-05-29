import { ScrollView, TouchableOpacity, Text, View } from "react-native";

export default function FilterChips({
    visible,
    gridView,
    selectedFilter,
    setSelectedFilter,
}) {

    // Filtri disponibili
    const filters = [
        {
            key: "all",
            label: "Tutti",
        },
        {
            key: "document",
            label: "Documenti",
        },
        {
            key: "image",
            label: "Immagini",
        },
        {
            key: "video",
            label: "Video",
        },
        {
            key: "audio",
            label: "Audio",
        },
    ];

    // Se non devono essere visibili
    if (!visible) {
        return null;
    }

    return (
        <View
            style={{
                marginBottom: 14,
            }}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {filters.map(function (filter) {

                    const isSelected =
                        selectedFilter ===
                        filter.key;

                    return (
                        <TouchableOpacity
                            key={filter.key}

                            onPress={function () {
                                setSelectedFilter(
                                    filter.key
                                );
                            }}

                            style={{
                                backgroundColor:
                                    isSelected
                                        ? "#000"
                                        : "#fff",

                                borderRadius: 16,

                                borderWidth: 1,

                                borderColor:
                                    isSelected
                                        ? "#000"
                                        : "#ECECEC",

                                justifyContent:
                                    "center",

                                alignItems:
                                    "center",

                                marginRight: 10,

                                paddingHorizontal:
                                    gridView
                                        ? 28
                                        : 18,

                                paddingVertical:
                                    gridView
                                        ? 24
                                        : 12,

                                minWidth:
                                    gridView
                                        ? 150
                                        : undefined,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        isSelected
                                            ? "#fff"
                                            : "#000",

                                    fontSize: 15,

                                    fontWeight:
                                        "500",
                                }}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}