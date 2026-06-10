import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

export default function
    RenameModal({

        visible,

        title,

        initialValue,

        onClose,

        onSave,
    }) {

    const [
        value,
        setValue
    ] = useState("");

    useEffect(() => {

        if (
            visible
        ) {

            setValue(
                initialValue
                || ""
            );
        }

    }, [
        visible,
        initialValue
    ]);

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

                    backgroundColor:
                        "rgba(0,0,0,0.35)",

                    justifyContent:
                        "center",

                    padding:
                        20,
                }}
            >

                <View
                    style={{
                        backgroundColor:
                            "#fff",

                        borderRadius:
                            22,

                        padding:
                            22,
                    }}
                >

                    <Text
                        style={{
                            fontSize:
                                20,

                            fontWeight:
                                "600",

                            marginBottom:
                                16,
                        }}
                    >
                        {title}
                    </Text>

                    <TextInput
                        value={
                            value
                        }

                        onChangeText={
                            setValue
                        }

                        placeholder=
                        "Nuovo nome"

                        autoFocus

                        style={{
                            borderWidth:
                                1,

                            borderColor:
                                "#E2E2E2",

                            borderRadius:
                                14,

                            padding:
                                14,

                            fontSize:
                                16,
                        }}
                    />

                    <View
                        style={{
                            flexDirection:
                                "row",

                            justifyContent:
                                "flex-end",

                            marginTop:
                                22,

                            gap:
                                14,
                        }}
                    >

                        <TouchableOpacity
                            onPress={
                                onClose
                            }
                        >

                            <Text
                                style={{
                                    fontSize:
                                        16,

                                    color:
                                        "#666",
                                }}
                            >
                                Annulla
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                onSave(
                                    value
                                )
                            }
                        >

                            <Text
                                style={{
                                    fontSize:
                                        16,

                                    fontWeight:
                                        "600",

                                    color:
                                        "#007AFF",
                                }}
                            >
                                Salva
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </View>

        </Modal>
    );
}