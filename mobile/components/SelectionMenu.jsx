import { Modal, Pressable, View, Text, TouchableOpacity } from "react-native";

export default function
    SelectionMenu({

        visible,

        onClose,

        options = [],
    }) {

    return (
        <Modal
            visible={
                visible
            }

            transparent

            animationType=
            "fade"

            onRequestClose={
                onClose
            }
        >
            <Pressable
                onPress={
                    onClose
                }

                style={{
                    flex: 1,

                    backgroundColor:
                        "rgba(0,0,0,0.2)",

                    justifyContent:
                        "center",

                    alignItems:
                        "center",
                }}
            >

                <View
                    style={{
                        width: 240,

                        backgroundColor:
                            "#fff",

                        borderRadius:
                            16,

                        padding:
                            16,
                    }}
                >

                    {
                        options.map(
                            option => (

                                <TouchableOpacity
                                    key={
                                        option.key
                                    }

                                    onPress={
                                        option.onPress
                                    }

                                    style={{
                                        paddingVertical:
                                            12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize:
                                                16,

                                            color:
                                                option.danger
                                                    ? "red"
                                                    : "#000",
                                        }}
                                    >
                                        {
                                            option.label
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )
                        )
                    }

                </View>

            </Pressable>
        </Modal>
    );
}