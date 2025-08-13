import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { summarizeAsync } from "../api/client";
import { insertSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";

export default function TextInputScreen({ navigation }: any) {
  const [value, setValue] = useState("");
  async function onSummarize() {
    const { summary } = await summarizeAsync(value || " ", "medium", true);
    const id = nanoid();
    insertSummary({ id, createdAt: Date.now(), title: value.slice(0,40) || "Text note", medium: summary, sourceKind:"text" });
    navigation.replace("Summary", { id });
  }
  return (
    <View style={{ flex:1, padding:24, gap:12 }}>
      <TextInput value={value} onChangeText={setValue} placeholder="Paste or type notes here…" multiline style={{ flex:1, backgroundColor:"#F2F2F7", padding:12, borderRadius:12 }} />
      <Pressable onPress={onSummarize} style={{ backgroundColor:"#007AFF", borderRadius:16, padding:18, alignItems:"center" as const }}>
        <Text style={{ color:"#fff", fontSize:18, fontWeight:"600" as const }}>Generate Summary</Text>
      </Pressable>
    </View>
  );
}
