import React from "react";
import { View, ScrollView } from "react-native";
import { Button, Card, CardContent, Text, AnimatedView, FadeInList } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

export default function Home({ navigation }: any) {
  const captureOptions = [
    {
      title: "Record Voice",
      description: "Speak and get AI summaries",
      icon: "🎤",
      color: colors.blue,
      screen: "VoiceCapture",
    },
    {
      title: "Scan Image", 
      description: "Extract text from photos",
      icon: "📷",
      color: colors.purple,
      screen: "ImageCapture",
    },
    {
      title: "Type Notes",
      description: "Write and summarize text", 
      icon: "📝",
      color: colors.green,
      screen: "TextInput",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <View style={styles.header}>
          <Text variant="h1" align="center">QuickScribe</Text>
          <Text variant="muted" align="center">AI-powered note taking</Text>
        </View>
      </AnimatedView>

      <View style={styles.content}>
        <AnimatedView animation="fadeInUp" delay={200}>
          <Text variant="h3" style={{ marginBottom: spacing[4] }}>
            Capture Your Ideas
          </Text>
        </AnimatedView>
        
        <FadeInList stagger={150} animation="fadeInUp">
          {captureOptions.map((option, index) => (
            <Card key={index} style={{ marginBottom: spacing[4] }}>
              <CardContent style={styles.captureCard}>
                <View style={styles.captureInfo}>
                  <Text style={styles.captureIcon}>{option.icon}</Text>
                  <View style={styles.captureText}>
                    <Text variant="large">{option.title}</Text>
                    <Text variant="muted">{option.description}</Text>
                  </View>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => navigation.navigate(option.screen)}
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </FadeInList>

        <AnimatedView animation="fadeIn" delay={800}>
          <Button
            variant="ghost"
            style={{ marginTop: spacing[6] }}
            onPress={() => navigation.navigate("History")}
          >
            📚 View All Notes
          </Button>
        </AnimatedView>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.muted.DEFAULT,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[6],
  },
  captureCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  captureInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  captureIcon: {
    fontSize: 28,
    marginRight: spacing[4],
  },
  captureText: {
    flex: 1,
  },
};
