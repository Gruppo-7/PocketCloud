import { Modal, View, Text, TouchableOpacity } from "react-native";

export default function
ConfirmDeleteModal({

  visible,

  title,

  message,

  onCancel,

  onConfirm,
}) {

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
          }}
        >

          <Text
            style={{
              fontSize:
                22,

              fontWeight:
                "700",

              marginBottom:
                12,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize:
                16,

              lineHeight:
                22,

              color:
                "#555",

              marginBottom:
                24,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              flexDirection:
                "row",

              justifyContent:
                "flex-end",

              gap:
                12,
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
              onPress={
                onConfirm
              }

              style={{
                backgroundColor:
                  "#FF3B30",

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
                Elimina
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>

    </Modal>
  );
}