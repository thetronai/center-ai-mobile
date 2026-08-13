import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MonitoringScreen } from "./screens/MonitoringScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <MonitoringScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
