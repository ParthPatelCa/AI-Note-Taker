import { View } from "react-native";
import { Text } from "../components/ui";

export default function Summary() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text variant="h2">Summary Screen</Text>
      <Text variant="p">This is a simplified summary screen to get the app working.</Text>
    </View>
  );
}
