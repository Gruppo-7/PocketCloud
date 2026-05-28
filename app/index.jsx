import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { getLoginState, getServerAddress } from "../utils/storage";

export default function Index() {

  // Loading iniziale
  const [loading, setLoading] = useState(true);

  // Stato app
  const [serverConfigured, setServerConfigured] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Controllo storage
  useEffect(
    function () {

      async function checkAppState() {

        try {

          // Recupera server
          const server =
            await getServerAddress();

          // Recupera login
          const loginState =
            await getLoginState();

          setServerConfigured(
            !!server
          );

          setIsLoggedIn(
            loginState
          );

        } catch (error) {

          console.log(
            "Errore app state:",
            error
          );

        } finally {

          setLoading(
            false
          );
        }
      }

      checkAppState();
    },

    []
  );

  // Loading screen
  if (loading) {

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent:
            "center",

          alignItems:
            "center",

          backgroundColor:
            "#F5F5F5",
        }}
      >
        <ActivityIndicator
          size="large"
        />
      </SafeAreaView>
    );
  }

  // Nessun server
  if (
    !serverConfigured
  ) {

    return (
      <Redirect
        href="/setup"
      />
    );
  }

  // Non loggato
  if (
    !isLoggedIn
  ) {

    return (
      <Redirect
        href="/auth"
      />
    );
  }

  // Tutto ok
  return (
    <Redirect
      href="/(tabs)/file"
    />
  );
}