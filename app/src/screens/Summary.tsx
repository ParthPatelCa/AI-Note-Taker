import { useEffect, useState } from "react";
import { View, ScrollView, Share } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getSummary } from "../store/db";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Button, Card, CardHeader, CardContent, Text, Badge, AnimatedView, FadeInList, Pulse } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

interface Summary {
  id: string;
  createdAt: number;
  title: string;
  tldr?: string;
  medium?: string;
  full?: string;
  actions?: string;
  sourceKind: string;
}

export default function Summary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  useEffect(() => {
    try {
      const found = getSummary(id);
      if (found) {
        setSummary(found as Summary);
      } else {
        handleError(new Error("Summary not found"), "Could not load summary");
        navigation.goBack();
      }
    } catch (error) {
      handleError(error, "Failed to load summary");
      navigation.goBack();
    }
  }, [id]);

  const handleShare = async () => {
    if (!summary) return;
    try {
      const content = `${summary.title}\n\n${summary.medium || summary.tldr || summary.full || 'No content'}`;
      await Share.share({
        message: content,
        title: summary.title,
      });
      showSuccessToast("Summary shared successfully!");
    } catch (error) {
      handleError(error, "Failed to share summary");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (sourceKind: string) => {
    switch (sourceKind) {
      case 'voice': return '🎤';
      case 'image': return '📷';
      case 'text': return '📝';
      default: return '📄';
    }
  };

  if (!summary) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Pulse>
            <Text variant="muted" align="center">Loading summary...</Text>
          </Pulse>
        </View>
      </View>
    );
  }

  const summaryCards = [
    summary.medium && { title: "Summary", content: summary.medium },
    summary.tldr && { title: "TL;DR", content: summary.tldr },
    summary.full && { title: "Detailed Summary", content: summary.full },
    summary.actions && { title: "Action Items", content: summary.actions },
  ].filter((card): card is { title: string; content: string } => Boolean(card));

  return (
    <ScrollView style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <Card style={styles.headerCard}>
          <CardHeader>
            <View style={styles.titleRow}>
              <Text style={styles.sourceIcon}>{getSourceIcon(summary.sourceKind)}</Text>
              <Text variant="h3" style={styles.title}>{summary.title}</Text>
            </View>
            <Badge variant="outline">
              <Text variant="small">{formatDate(summary.createdAt)}</Text>
            </Badge>
          </CardHeader>
        </Card>
      </AnimatedView>

      <View style={styles.content}>
        <FadeInList stagger={150} animation="fadeInUp">
          {summaryCards.map((card, index) => (
            <Card key={index} style={styles.sectionCard}>
              <CardContent>
                <Text variant="h4" style={styles.sectionTitle}>{card.title}</Text>
                <Text variant="p">{card.content}</Text>
              </CardContent>
            </Card>
          ))}
        </FadeInList>
      </View>

      <AnimatedView animation="fadeInUp" delay={600}>
        <View style={styles.actions}>
          <Button onPress={handleShare} style={{ marginBottom: spacing[3] }}>
            Share Summary
          </Button>
          
          <Button 
            variant="outline" 
            onPress={() => (navigation as any).navigate('History')}
          >
            View All Notes
          </Button>
        </View>
      </AnimatedView>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.muted.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing[6],
  },
  headerCard: {
    margin: spacing[4],
    marginBottom: spacing[2],
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing[2],
  },
  sourceIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  title: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
  },
  sectionCard: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  actions: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
};
