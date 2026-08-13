import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Urbanist_600SemiBold, Urbanist_700Bold } from "@expo-google-fonts/urbanist";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { MonitoringScreen } from "./screens/MonitoringScreen";
import { colors } from "./theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  }

  return (
    <SafeAreaProvider>
      <MonitoringScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
