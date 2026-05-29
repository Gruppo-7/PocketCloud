import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
}) {

  return (
    <View
      style={{
        backgroundColor:
          "#fff",

        borderRadius:
          16,

        paddingHorizontal:
          16,

        height: 52,

        flexDirection:
          "row",

        alignItems:
          "center",

        marginBottom:
          16,

        borderWidth:
          1,

        borderColor:
          "#ECECEC",
      }}
    >
      <Ionicons
        name="search"
        size={20}
        color="gray"
      />

      <TextInput
        placeholder={
          placeholder
        }

        value={value}

        onChangeText={
          onChangeText
        }

        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 16,
        }}
      />
    </View>
  );
}