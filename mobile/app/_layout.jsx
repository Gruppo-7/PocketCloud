import { Stack } from 'expo-router';

export default function RootLayout() {
 
  return (
  <Stack screenOptions={{ headerShown: false }}/>  //Se si attiva nel file layout nella root è visualizzato in ogni schermata
  );
}
