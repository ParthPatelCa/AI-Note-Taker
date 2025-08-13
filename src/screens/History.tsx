import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { listSummaries } from "../store/db";
import { forceSync } from "../services/SyncService";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Card, CardContent, Input, Text, Badge, AnimatedView, FadeInList, SkeletonCard, Button } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

interface Summary {
  id: string;
  createdAt: number;
  title: string;
  medium?: string;
  sourceKind: string;
  isSynced?: number;
  lastModified?: number;
}

export default function History() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'voice' | 'text' | 'image' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadSummaries();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const result = await forceSync();
      if (result.success > 0) {
        showSuccessToast(`Successfully synced ${result.success} notes!`);
        loadSummaries(); // Refresh the list
      } else if (result.failed > 0) {
        showSuccessToast('Some notes failed to sync. Will retry later.');
      } else {
        showSuccessToast('All notes are already synced!');
      }
    } catch (error) {
      handleError(error, 'Failed to sync notes');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let filtered = summaries;

    // Apply text search
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(summary =>
        summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.medium?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply source filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'pending') {
        filtered = filtered.filter(summary => summary.isSynced === 0);
      } else {
        filtered = filtered.filter(summary => summary.sourceKind === activeFilter);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.createdAt - a.createdAt; // Newest first
      } else {
        return a.title.localeCompare(b.title); // Alphabetical
      }
    });

    setFilteredSummaries(filtered);
  }, [searchQuery, summaries, activeFilter, sortBy]);

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

    const isProcessing = summary.medium === 'Processing...';
    const isUnsynced = summary.isSynced === 0;

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
                {isUnsynced && (
                  <Badge variant="secondary" style={{ marginLeft: spacing[2] }}>
                    <Text variant="small">⏳ Pending</Text>
                  </Badge>
                )}
              </View>
              <Badge variant="outline">
                <Text variant="small">{formatDate(summary.createdAt)}</Text>
              </Badge>
            </View>
            <Text 
              variant="muted" 
              numberOfLines={2} 
              style={{ 
                marginTop: spacing[2],
                fontStyle: isProcessing ? 'italic' : 'normal',
                color: isProcessing ? colors.muted.foreground : undefined
              }}
            >
              {isProcessing ? 'Processing... Will be ready when connection is restored.' : preview}
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
          <Button
            variant="outline"
            size="sm"
            onPress={handleManualSync}
            loading={isSyncing}
            disabled={isSyncing}
            style={styles.syncButton}
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync'}
          </Button>
        </View>
        
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <View style={styles.filterRow}>
              {[
                { key: 'all', label: 'All', icon: '📋' },
                { key: 'voice', label: 'Voice', icon: '🎤' },
                { key: 'text', label: 'Text', icon: '📝' },
                { key: 'image', label: 'Images', icon: '📷' },
                { key: 'pending', label: 'Pending', icon: '⏳' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onPress={() => setActiveFilter(filter.key as any)}
                  style={styles.filterButton}
                >
                  {filter.icon} {filter.label}
                </Button>
              ))}
            </View>
          </ScrollView>
          
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
            style={styles.sortButton}
          >
            {sortBy === 'date' ? '📅' : '🔤'}
          </Button>
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
              {searchQuery || activeFilter !== 'all' 
                ? 'No matching notes found' 
                : 'No notes yet'
              }
            </Text>
            <Text variant="muted" align="center">
              {searchQuery 
                ? 'Try a different search term or filter' 
                : activeFilter !== 'all'
                ? `No ${activeFilter} notes found`
                : 'Create your first note by capturing voice, text, or images'
              }
            </Text>
            {(searchQuery || activeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                style={{ marginTop: spacing[4] }}
              >
                Clear Filters
              </Button>
            )}
          </View>
        </AnimatedView>
      ) : (
        <ScrollView 
          style={styles.summariesContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.DEFAULT]}
            />
          }
        >
          <AnimatedView animation="fadeInUp" delay={200}>
            <Text variant="muted" style={{ padding: spacing[4] }}>
              {filteredSummaries.length} {filteredSummaries.length === 1 ? 'note' : 'notes'}
              {searchQuery && ` matching "${searchQuery}"`}
              {activeFilter !== 'all' && ` (${activeFilter})`}
              {sortBy === 'title' && ' • Sorted alphabetically'}
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing[3],
  },
  searchInput: {
    flex: 1,
  },
  syncButton: {
    minWidth: 80,
  },
  filtersContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  filterScroll: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row' as const,
    gap: spacing[2],
    paddingRight: spacing[4],
  },
  filterButton: {
    minWidth: 80,
  },
  sortButton: {
    width: 40,
    height: 40,
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
