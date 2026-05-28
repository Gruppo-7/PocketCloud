import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="file"  //Pagina a cui punta
        options={{
          title: "File",   //Titolo visualizzato
          tabBarIcon: ({ color, size }) => (
            <Ionicons  
              name="folder"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="condivisi"
        options={{
          title: "Condivisi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="share-social-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Impostazioni",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings"
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}