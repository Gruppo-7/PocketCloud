import { TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function
    FAB({

        onPress,

        disabled = false,

        icon = "add",

        bottom = 24,

        right = 24,
    }) {

    return (
        <TouchableOpacity
            disabled={
                disabled
            }

            onPress={onPress}

            style={{
                position:
                    "absolute",

                bottom,

                right,

                width: 64,
                height: 64,

                borderRadius:
                    32,

                backgroundColor:
                    disabled
                        ? "#BDBDBD"
                        : "#000",

                opacity:
                    disabled
                        ? 0.6
                        : 1,

                justifyContent:
                    "center",

                alignItems:
                    "center",

                elevation: 8,
            }}
        >
            <Ionicons
                name={icon}
                size={34}
                color="#fff"
            />
        </TouchableOpacity>
    );
}