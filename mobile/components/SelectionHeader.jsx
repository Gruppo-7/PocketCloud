import { View, Text, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function
    SelectionHeader({

        selectedCount,

        onClose,

        onActions,
    }) {

    return (
        <View
            style={{
                flexDirection:
                    "row",

                alignItems:
                    "center",

                justifyContent:
                    "space-between",

                marginBottom:
                    20,
            }}
        >

            <View
                style={{
                    flexDirection:
                        "row",

                    alignItems:
                        "center",
                }}
            >

                <TouchableOpacity
                    onPress={
                        onClose
                    }

                    style={{
                        marginRight:
                            14,
                    }}
                >
                    <Ionicons
                        name="close"
                        size={28}
                    />
                </TouchableOpacity>

                <Text
                    style={{
                        fontSize:
                            24,

                        fontWeight:
                            "600",
                    }}
                >
                    {
                        selectedCount
                    } {
                        selectedCount === 1
                            ? "selezionato"
                            : "selezionati"
                    }
                </Text>

            </View>

            <TouchableOpacity
                onPress={
                    onActions
                }
            >

                <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                />

            </TouchableOpacity>

        </View>
    );
}