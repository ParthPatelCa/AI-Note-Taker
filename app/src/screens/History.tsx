import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { listSummaries } from "../store/db";
import { handleError } from "../utils/errorHandler";
import { Card, CardContent, Input, Text, Badge, AnimatedView, FadeInList, SkeletonCard } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

interface Summary {
  id: string;
  createdAt: number;
  title: string;
  medium?: string;
  sourceKind: string;
}

export default function History() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const loadSummaries = () => {
    setIsLoading(true);
    try {
      const data = listSummaries() as Summary[];
      setSummaries(data);
      setFilteredSummaries(data);
    } catch (error) {
      handleError(error, "Failed to load summaries");
    } finally {
      setIsLoading(false);
    }
  };

  // Reload summaries when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSummaries();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSummaries(summaries);
    } else {
      const filtered = summaries.filter(summary =>
        summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.medium?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSummaries(filtered);
    }
  }, [searchQuery, summaries]);

  const formatDate = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getSourceIcon = (sourceKind: string) => {
    switch (sourceKind) {
      case 'voice': return '🎤';
      case 'image': return '📷';
      case 'text': return '📝';
      default: return '📄';
    }
  };

  const navigateToSummary = (id: string) => {
    (navigation as any).navigate('Summary', { id });
  };

  const renderSummaryItem = (summary: Summary) => {
    const preview = summary.medium ? 
      summary.medium.substring(0, 100) + (summary.medium.length > 100 ? '...' : '') :
      'No content available';

    return (
      <Card key={summary.id} style={{ marginBottom: spacing[3] }}>
        <Pressable onPress={() => navigateToSummary(summary.id)}>
          <CardContent>
            <View style={styles.summaryHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.sourceIcon}>{getSourceIcon(summary.sourceKind)}</Text>
                <Text variant="large" style={styles.summaryTitle} numberOfLines={1}>
                  {summary.title}
                </Text>
              </View>
              <Badge variant="outline">
                <Text variant="small">{formatDate(summary.createdAt)}</Text>
              </Badge>
            </View>
            <Text variant="muted" numberOfLines={2} style={{ marginTop: spacing[2] }}>
              {preview}
            </Text>
          </CardContent>
        </Pressable>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedView animation="fadeInDown">
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search your notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </AnimatedView>

      {isLoading ? (
        <View style={{ padding: spacing[4] }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} showAvatar={false} lines={2} />
          ))}
        </View>
      ) : filteredSummaries.length === 0 ? (
        <AnimatedView animation="fadeIn" delay={300}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text variant="h4" align="center" style={{ marginBottom: spacing[2] }}>
              {searchQuery ? 'No matching notes found' : 'No notes yet'}
            </Text>
            <Text variant="muted" align="center">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Create your first note by capturing voice, text, or images'
              }
            </Text>
          </View>
        </AnimatedView>
      ) : (
        <ScrollView style={styles.summariesContainer}>
          <AnimatedView animation="fadeInUp" delay={200}>
            <Text variant="muted" style={{ padding: spacing[4] }}>
              {filteredSummaries.length} {filteredSummaries.length === 1 ? 'note' : 'notes'}
              {searchQuery && ` matching "${searchQuery}"`}
            </Text>
          </AnimatedView>
          <View style={{ paddingHorizontal: spacing[4] }}>
            <FadeInList stagger={100} animation="fadeInUp">
              {filteredSummaries.map(renderSummaryItem)}
            </FadeInList>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.muted.DEFAULT,
  },
  searchContainer: {
    padding: spacing[4],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    // Additional styling can be added here if needed
  },
  summariesContainer: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    marginRight: spacing[2],
  },
  sourceIcon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  summaryTitle: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing[8],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
};
