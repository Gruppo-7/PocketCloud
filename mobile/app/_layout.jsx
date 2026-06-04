import {
  Stack
} from "expo-router";

import {
  View
} from "react-native";

import {
  ServerProvider
} from "../context/ServerContext";

import ServerStatusBanner
from "../components/ServerStatusBanner";

export default function
RootLayout() {

  return (
    <ServerProvider>

      <View
        style={{
          flex: 1,
        }}
      >

        <ServerStatusBanner />

        <Stack
          screenOptions={{
            headerShown:
              false,
          }}
        />
      </View>

    </ServerProvider>
  );
}