import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import VoiceCapture from "./src/screens/VoiceCapture";
import TextInputScreen from "./src/screens/TextInput";
import ImageCapture from "./src/screens/ImageCapture";
import Summary from "./src/screens/Summary";
import History from "./src/screens/History";
import { init } from "./src/store/db";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(()=>{ init(); },[]);
  return (
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
  );
}
