import { useState, useEffect, useCallback } from "react";
import { View, TextInput as RNTextInput, Alert, Keyboard } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { summarizeAsync } from "../api/client";
import { insertSummary, updateSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Button, Text, AnimatedView, Card, CardContent, Badge } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

const DRAFT_KEY = 'text_input_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds

export default function TextInputScreen({ navigation }: any) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Idle");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load draft on focus
  useFocusEffect(
    useCallback(() => {
      loadDraft();
    }, [])
  );

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (value.trim()) {
      const timer = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
      
      setAutoSaveTimer(timer);
    }

    // Update counts
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(value.length);

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [value]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        setValue(draft);
        setLastSaved(new Date());
      }
    } catch (error) {
      // Silent fail for draft loading
    }
  };

  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem(DRAFT_KEY, value);
      setLastSaved(new Date());
    } catch (error) {
      // Silent fail for auto-save
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      setValue("");
      setLastSaved(null);
    } catch (error) {
      // Silent fail
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    
    if (diff < 60000) return "Saved just now";
    if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
    return `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const validateText = () => {
    if (!value.trim()) {
      Alert.alert('No Text', 'Please enter some text to summarize.');
      return false;
    }
    
    if (value.trim().length < 50) {
      Alert.alert(
        'Text Too Short',
        'Please enter at least 50 characters for a meaningful summary.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (value.length > 10000) {
      Alert.alert(
        'Text Too Long',
        'Please keep your text under 10,000 characters for optimal processing.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };
  const onSummarize = async () => {
    if (!validateText()) return;

    try {
      Keyboard.dismiss();
      setStatus("Saving...");
      
      // Save raw text immediately for offline-first approach
      const id = nanoid();
      const tempSummary = {
        id,
        createdAt: Date.now(),
        title: value.slice(0, 40) || "Text note",
        medium: "Processing...",
        sourceKind: "text",
        sourceUri: null,
        rawContent: value,
        isSynced: 0, // Mark as not synced yet
      };
      
      // Insert temporary record first
      await insertSummary(tempSummary);
      
      try {
        setStatus("Summarizing...");
        const { summary } = await summarizeAsync(value, "medium", true);
        
        // Update with processed summary and mark as synced
        await updateSummary(id, {
          medium: summary,
          isSynced: 1
        });
        
        showSuccessToast("Text note summarized successfully!");
      } catch (error) {
        // If processing fails, the note is still saved locally for later sync
        console.log('Processing failed, will retry during sync:', error);
        showSuccessToast("Text note saved! Will be processed when connection is restored.");
      }
      
      // Clear draft after successful save
      await clearDraft();
      
      navigation.replace("Summary", { id });
    } catch (error) {
      handleError(error, "Failed to save text note");
      setStatus("Idle");
    }
  };

  const handleClear = () => {
    if (!value.trim()) return;
    
    Alert.alert(
      'Clear Text',
      'Are you sure you want to clear all text? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearDraft }
      ]
    );
  };
  return (
    <View style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <Card style={styles.statusCard}>
          <CardContent>
            <View style={styles.statusRow}>
              <Text variant="h3">
                {status === "Idle" ? "📝 Text Editor" : "⏳ " + status}
              </Text>
              {lastSaved && status === "Idle" && (
                <Text style={styles.autoSaveText}>
                  {formatLastSaved()}
                </Text>
              )}
            </View>
          </CardContent>
        </Card>
      </AnimatedView>

      <AnimatedView animation="fadeIn" delay={300} style={styles.editorContainer}>
        <Card style={styles.textCard}>
          <CardContent style={styles.textCardContent}>
            <RNTextInput
              value={value}
              onChangeText={setValue}
              placeholder="Start typing your notes here... Text will be auto-saved as you type."
              placeholderTextColor={colors.muted.foreground}
              multiline
              textAlignVertical="top"
              style={styles.textInput}
              editable={status === "Idle"}
            />
            
            <View style={styles.textStats}>
              <View style={styles.statsRow}>
                <Badge variant="secondary">
                  {charCount} characters
                </Badge>
                <Badge variant="secondary">
                  {wordCount} words
                </Badge>
                {charCount > 9000 && (
                  <Badge variant="destructive">
                    ⚠️ Approaching limit
                  </Badge>
                )}
              </View>
            </View>
          </CardContent>
        </Card>
      </AnimatedView>

      <AnimatedView animation="fadeInUp" delay={500}>
        <View style={styles.actionContainer}>
          <Button 
            variant="outline" 
            size="lg"
            onPress={handleClear}
            disabled={!value.trim() || status !== "Idle"}
            style={styles.clearButton}
          >
            Clear
          </Button>
          
          <Button 
            size="lg"
            onPress={onSummarize}
            disabled={!value.trim() || status !== "Idle"}
            style={styles.summarizeButton}
          >
            Generate Summary
          </Button>
        </View>
      </AnimatedView>

      {status === "Idle" && !value.trim() && (
        <AnimatedView animation="fadeInUp" delay={700}>
          <Card style={styles.tipsCard}>
            <CardContent>
              <Text variant="h4" style={styles.tipsTitle}>
                Writing Tips
              </Text>
              <Text style={styles.tip}>• Minimum 50 characters for summarization</Text>
              <Text style={styles.tip}>• Auto-save keeps your work safe</Text>
              <Text style={styles.tip}>• Best results with structured text</Text>
              <Text style={styles.tip}>• Maximum 10,000 characters</Text>
            </CardContent>
          </Card>
        </AnimatedView>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing[6],
  },
  statusCard: {
    marginBottom: spacing[4],
  },
  statusRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  autoSaveText: {
    fontSize: 12,
    color: colors.muted.foreground,
    fontStyle: 'italic' as const,
  },
  editorContainer: {
    flex: 1,
    marginBottom: spacing[4],
  },
  textCard: {
    flex: 1,
  },
  textCardContent: {
    flex: 1,
    padding: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.foreground,
    padding: spacing[4],
    minHeight: 200,
  },
  textStats: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing[3],
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: spacing[2],
    flexWrap: 'wrap' as const,
  },
  actionContainer: {
    flexDirection: 'row' as const,
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  clearButton: {
    flex: 1,
  },
  summarizeButton: {
    flex: 2,
  },
  tipsCard: {
    backgroundColor: colors.muted.DEFAULT,
  },
  tipsTitle: {
    marginBottom: spacing[3],
    color: colors.foreground,
  },
  tip: {
    color: colors.muted.foreground,
    marginBottom: spacing[1],
    fontSize: 14,
  },
};
