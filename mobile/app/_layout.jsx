import { Stack } from "expo-router";

import { View } from "react-native";

import { ServerProvider } from "../context/ServerContext";

import ServerStatusBanner from "../components/ServerStatusBanner";

import { useEffect } from "react";

import { cleanupTemporaryFiles } from "../utils/crypto";

export default function
  RootLayout() {

  useEffect(
    () => {

      cleanupTemporaryFiles();

    },

    []
  );

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