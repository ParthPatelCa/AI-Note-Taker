import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppState, AppStateStatus } from "react-native";
import Home from "./src/screens/Home";
import VoiceCapture from "./src/screens/VoiceCapture";
import TextInputScreen from "./src/screens/TextInput";
import ImageCapture from "./src/screens/ImageCapture";
import Summary from "./src/screens/Summary";
import History from "./src/screens/History";
import { init } from "./src/store/db";
import { startNetworkListener, syncPendingNotes } from "./src/services/SyncService";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

// This is a simplified global loading state for demonstration.
// In a real app, consider using React Context or a state management library.
let setLoadingGlobal: React.Dispatch<React.SetStateAction<boolean>>;
export const setLoading = (isLoading: boolean) => {
  if (setLoadingGlobal) {
    setLoadingGlobal(isLoading);
  }
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  setLoadingGlobal = setIsLoading; // Expose the setter globally

  useEffect(() => { 
    init(); 
    
    // Start network listener for automatic sync
    const unsubscribeNetworkListener = startNetworkListener();
    
    // Initial sync attempt
    syncPendingNotes().catch(error => {
      console.log('Initial sync failed:', error);
    });
    
    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, try to sync
        syncPendingNotes().catch(error => {
          console.log('Foreground sync failed:', error);
        });
      }
    };
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup function
    return () => {
      unsubscribeNetworkListener();
      appStateSubscription?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="VoiceCapture" component={VoiceCapture} />
          <Stack.Screen name="TextInput" component={TextInputScreen} />
          <Stack.Screen name="ImageCapture" component={ImageCapture} />
          <Stack.Screen name="Summary" component={Summary} />
          <Stack.Screen name="History" component={History} />
        </Stack.Navigator>
      </NavigationContainer>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
});


