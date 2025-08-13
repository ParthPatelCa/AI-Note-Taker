import { View, Text, Pressable } from "react-native";

export default function Home({ navigation }: any) {
  return (
    <View style={{ flex:1, padding:24, justifyContent:"center", gap:16 }}>
      <Text style={{ fontSize:28, fontWeight:"700", textAlign:"center" }}>QuickScribe</Text>
      <Pressable onPress={()=>navigation.navigate("VoiceCapture")} style={btn("#007AFF")}><Text style={bt()}>Voice</Text></Pressable>
      <Pressable onPress={()=>navigation.navigate("TextInput")} style={btn("#34C759")}><Text style={bt()}>Text</Text></Pressable>
      <Pressable onPress={()=>navigation.navigate("ImageCapture")} style={btn("#AF52DE")}><Text style={bt()}>Image</Text></Pressable>
      <Pressable onPress={()=>navigation.navigate("History")}><Text style={{ color:"#007AFF", textAlign:"center" }}>View Past Summaries</Text></Pressable>
    </View>
  );
}
const btn = (bg:string)=>({ backgroundColor:bg, borderRadius:16, padding:18, alignItems:"center" as const });
const bt = ()=>({ color:"#fff", fontSize:18, fontWeight:"600" as const });
