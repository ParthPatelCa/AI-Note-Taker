import { useEffect, useState } from "react";
import { View, ScrollView, Share, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getSummary, updateSummary } from "../store/db";
import { summarizeAsync } from "../api/client";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Button, Card, CardHeader, CardContent, Text, Badge, AnimatedView, FadeInList, Pulse } from "../components/ui";
import { colors, spacing, typography } from "../lib/tokens";

interface Summary {
  id: string;
  createdAt: number;
  title: string;
  tldr?: string;
  medium?: string;
  full?: string;
  actions?: string;
  sourceKind: string;
  rawContent?: string;
  isSynced?: number;
}

export default function Summary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<"short"|"medium"|"full">("medium");
  const [wantActions, setWantActions] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  useEffect(() => {
    try {
      const found = getSummary(id);
      if (found) {
        const summaryData = found as Summary;
        setSummary(summaryData);
        // Show controls if we have raw content to reprocess
        setShowControls(Boolean(summaryData.rawContent));
      } else {
        handleError(new Error("Summary not found"), "Could not load summary");
        navigation.goBack();
      }
    } catch (error) {
      handleError(error, "Failed to load summary");
      navigation.goBack();
    }
  }, [id]);

  const handleReprocess = async () => {
    if (!summary?.rawContent) {
      Alert.alert('Cannot Reprocess', 'No original content available for reprocessing.');
      return;
    }

    Alert.alert(
      'Reprocess Summary',
      `This will generate a new ${selectedLevel} summary${wantActions ? ' with action items' : ' without action items'}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reprocess', onPress: performReprocess }
      ]
    );
  };

  const performReprocess = async () => {
    if (!summary?.rawContent) return;

    setIsReprocessing(true);
    try {
      const { summary: newSummary, tldr, full, actions } = await summarizeAsync(
        summary.rawContent,
        selectedLevel,
        wantActions
      );

      const updates: any = {};
      
      // Update the appropriate summary based on level
      if (selectedLevel === 'short') {
        updates.tldr = newSummary;
      } else if (selectedLevel === 'medium') {
        updates.medium = newSummary;
      } else {
        updates.full = newSummary;
      }

      // Handle additional fields
      if (tldr) updates.tldr = tldr;
      if (full) updates.full = full;
      if (wantActions && actions) {
        updates.actions = actions;
      } else if (!wantActions) {
        updates.actions = null;
      }

      updates.isSynced = 1; // Mark as synced since we just processed it

      await updateSummary(summary.id, updates);
      
      // Refresh the summary data
      const refreshed = getSummary(summary.id) as Summary;
      setSummary(refreshed);
      
      showSuccessToast('Summary reprocessed successfully!');
    } catch (error) {
      handleError(error, 'Failed to reprocess summary');
    } finally {
      setIsReprocessing(false);
    }
  };

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

  const isProcessing = summary.medium === 'Processing...' || summary.tldr === 'Processing...' || summary.full === 'Processing...';

  return (
    <ScrollView style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <Card style={styles.headerCard}>
          <CardHeader>
            <View style={styles.titleRow}>
              <Text style={styles.sourceIcon}>{getSourceIcon(summary.sourceKind)}</Text>
              <Text variant="h3" style={styles.title}>{summary.title}</Text>
              {summary.isSynced === 0 && (
                <Badge variant="secondary">
                  <Text variant="small">⏳ Pending</Text>
                </Badge>
              )}
            </View>
            <Badge variant="outline">
              <Text variant="small">{formatDate(summary.createdAt)}</Text>
            </Badge>
          </CardHeader>
        </Card>
      </AnimatedView>

      {showControls && !isProcessing && (
        <AnimatedView animation="fadeIn" delay={200}>
          <Card style={styles.controlsCard}>
            <CardContent>
              <Text variant="h4" style={styles.controlsTitle}>Regenerate Summary</Text>
              
              <View style={styles.controlRow}>
                <Text variant="body" style={styles.controlLabel}>Summary Level:</Text>
                <View style={styles.levelButtons}>
                  {(['short', 'medium', 'full'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onPress={() => setSelectedLevel(level)}
                      style={styles.levelButton}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </View>
              </View>

              <View style={styles.controlRow}>
                <Text variant="body" style={styles.controlLabel}>Include Action Items:</Text>
                <Button
                  variant={wantActions ? 'default' : 'outline'}
                  size="sm"
                  onPress={() => setWantActions(!wantActions)}
                  style={styles.toggleButton}
                >
                  {wantActions ? '✓ Yes' : '✗ No'}
                </Button>
              </View>

              <Button
                onPress={handleReprocess}
                loading={isReprocessing}
                disabled={isReprocessing}
                style={styles.reprocessButton}
              >
                {isReprocessing ? 'Reprocessing...' : 'Regenerate Summary'}
              </Button>
            </CardContent>
          </Card>
        </AnimatedView>
      )}

      {isProcessing && (
        <AnimatedView animation="fadeIn" delay={200}>
          <Card style={styles.processingCard}>
            <CardContent>
              <View style={styles.processingContent}>
                <Pulse>
                  <Text variant="h4" align="center">🔄 Processing</Text>
                </Pulse>
                <Text variant="muted" align="center" style={{ marginTop: spacing[2] }}>
                  This note will be processed when connection is restored.
                </Text>
              </View>
            </CardContent>
          </Card>
        </AnimatedView>
      )}

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
  controlsCard: {
    margin: spacing[4],
    marginTop: 0,
    backgroundColor: colors.accent.DEFAULT,
  },
  controlsTitle: {
    marginBottom: spacing[4],
  },
  controlRow: {
    marginBottom: spacing[4],
  },
  controlLabel: {
    marginBottom: spacing[2],
    fontWeight: typography.medium,
  },
  levelButtons: {
    flexDirection: 'row' as const,
    gap: spacing[2],
  },
  levelButton: {
    flex: 1,
  },
  toggleButton: {
    alignSelf: 'flex-start' as const,
    minWidth: 80,
  },
  reprocessButton: {
    marginTop: spacing[2],
  },
  processingCard: {
    margin: spacing[4],
    marginTop: 0,
    backgroundColor: colors.muted.DEFAULT,
  },
  processingContent: {
    padding: spacing[4],
  },
};
