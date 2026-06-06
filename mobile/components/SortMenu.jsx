import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SortMenu({
  showSortMenu,
  setShowSortMenu,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  options,
}) {

  // Menu nascosto
  if (!showSortMenu) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 70,
        left: 20,

        backgroundColor: "#fff",

        borderRadius: 16,
        paddingVertical: 8,

        width: 220,

        borderWidth: 1,
        borderColor: "#ECECEC",

        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,

        elevation: 5,

        zIndex: 1000,
      }}
    >
      {options.map(function (option) {

        return (
          <TouchableOpacity
            key={option.key}

            onPress={function () {

              if (
                sortBy ===
                option.key
              ) {

                setSortDirection(
                  prev =>
                    prev ===
                      "asc"

                      ? "desc"

                      : "asc"
                );

              } else {

                setSortBy(
                  option.key
                );

                setSortDirection(
                  option.key ===
                    "modified"

                    ? "desc"

                    : "asc"
                );
              }

              setShowSortMenu(
                false
              );

            }}

            style={{
              flexDirection: "row",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              paddingHorizontal: 18,
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                fontSize: 16,
              }}
            >
              {option.label}
            </Text>

            {sortBy ===
              option.key && (
                <Ionicons
                  name="checkmark"
                  size={18}
                />
              )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}