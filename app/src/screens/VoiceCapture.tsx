import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Audio } from "expo-av";
import { transcribeAsync, summarizeAsync } from "../api/client";
import { insertSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";

export default function VoiceCapture({ navigation }: any) {
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState("Idle");

  useEffect(()=>{ Audio.requestPermissionsAsync(); },[]);

  async function start() {
    setStatus("Recording");
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRec(recording);
  }
  async function stop() {
    try {
      setStatus("Stopping");
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRec(null);
      if (!uri) throw new Error("No file URI");
      setStatus("Transcribing");
      const { text } = await transcribeAsync(uri);
      setStatus("Summarizing");
      const { summary } = await summarizeAsync(text, "medium", true);
      const id = nanoid();
      insertSummary({ id, createdAt: Date.now(), title: "Voice note", medium: summary, sourceKind: "voice" });
      navigation.replace("Summary", { id });
    } catch (e:any) {
      Alert.alert("Error", e.message || "Failed");
      setStatus("Idle");
    }
  }

  return (
    <View style={{ flex:1, padding:24, gap:16 }}>
      <Text style={{ fontSize:22, fontWeight:"600" }}>{status}</Text>
      {!rec && <Pressable onPress={start} style={btn("#007AFF")}><Text style={bt()}>Start</Text></Pressable>}
      {rec && <Pressable onPress={stop} style={btn("#FF3B30")}><Text style={bt()}>Stop</Text></Pressable>}
    </View>
  );
}
const btn = (bg:string)=>({ backgroundColor:bg, borderRadius:16, padding:18, alignItems:"center" as const });
const bt = ()=>({ color:"#fff", fontSize:18, fontWeight:"600" as const });
