import {
    Modal,
    Pressable,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import {
    useState
} from "react";

export default function
CreateFolderModal({

    visible,

    onClose,

    onCreate,
}) {

    const [
        folderName,
        setFolderName
    ] =
        useState("");

    async function
    handleCreate() {

        if (
            !folderName
                .trim()
        ) {
            return;
        }

        await onCreate(
            folderName
        );

        setFolderName(
            ""
        );

        onClose();
    }

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
                        width: 280,

                        backgroundColor:
                            "#fff",

                        borderRadius:
                            18,

                        padding:
                            18,
                    }}
                >

                    <Text
                        style={{
                            fontSize:
                                18,

                            fontWeight:
                                "600",

                            marginBottom:
                                14,
                        }}
                    >
                        Nuova cartella
                    </Text>

                    <TextInput
                        value={
                            folderName
                        }

                        onChangeText={
                            setFolderName
                        }

                        placeholder=
                        "Nome cartella"

                        style={{
                            borderWidth:
                                1,

                            borderColor:
                                "#ECECEC",

                            borderRadius:
                                12,

                            padding:
                                12,

                            marginBottom:
                                16,
                        }}
                    />

                    <TouchableOpacity
                        onPress={
                            handleCreate
                        }

                        style={{
                            backgroundColor:
                                "#007AFF",

                            borderRadius:
                                12,

                            padding:
                                14,

                            alignItems:
                                "center",
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
                            Crea
                        </Text>

                    </TouchableOpacity>

                </View>

            </Pressable>
        </Modal>
    );
}