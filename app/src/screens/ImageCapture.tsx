import * as ImagePicker from "expo-image-picker";
import { View, Text, Pressable, Image, Alert } from "react-native";
import { useState } from "react";
import { ocrAsync, summarizeAsync } from "../api/client";
import { insertSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";

export default function ImageCapture({ navigation }: any) {
  const [uri, setUri] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setUri(res.assets[0].uri);
  }
  async function process() {
    try {
      if (!uri) return;
      setStatus("OCR");
      const { text } = await ocrAsync(uri);
      setStatus("Summarizing");
      const { summary } = await summarizeAsync(text || " ", "medium", true);
      const id = nanoid();
      insertSummary({ id, createdAt: Date.now(), title: "Image note", medium: summary, sourceKind:"image" });
      navigation.replace("Summary", { id });
    } catch (e:any) {
      Alert.alert("Error", e.message || "Failed");
      setStatus("Idle");
    }
  }

  return (
    <View style={{ flex:1, padding:24, gap:16 }}>
      {uri && <Image source={{ uri }} style={{ height:200, borderRadius:12 }} />}
      <Text>{status}</Text>
      <Pressable onPress={pick} style={btn("#8E8E93")}><Text style={bt()}>Select from Gallery</Text></Pressable>
      <Pressable onPress={process} style={btn("#007AFF")}><Text style={bt()}>Extract and Summarize</Text></Pressable>
    </View>
  );
}
const btn = (bg:string)=>({ backgroundColor:bg, borderRadius:16, padding:18, alignItems:"center" as const });
const bt = ()=>({ color:"#fff", fontSize:18, fontWeight:"600" as const });
