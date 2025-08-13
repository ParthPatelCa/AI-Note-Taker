import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import { Audio } from "expo-av";
import { transcribeAsync, summarizeAsync } from "../api/client";
import { insertSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Button, Text, AnimatedView, Pulse, Card, CardContent } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

export default function VoiceCapture({ navigation }: any) {
  const [rec, setRec] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState("Idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rec && status === "Recording") {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rec, status]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This app needs microphone access to record voice notes.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      handleError(error, 'Failed to request microphone permission');
      setHasPermission(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant microphone access to record voice notes.',
        [
          { text: 'Cancel' },
          { text: 'Settings', onPress: () => requestPermissions() }
        ]
      );
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      });
      
      setRec(recording);
      setStatus("Recording");
      setRecordingDuration(0);
    } catch (err) {
      handleError(err, 'Failed to start recording');
    }
  };
  const stopRecording = async () => {
    if (!rec) return;

    try {
      setStatus("Stopping...");
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      
      if (!uri) {
        throw new Error('No recording file created');
      }

      if (recordingDuration < 1) {
        Alert.alert(
          'Recording too short',
          'Please record for at least 1 second.',
          [{ text: 'OK' }]
        );
        setRec(null);
        setStatus("Idle");
        setRecordingDuration(0);
        return;
      }

      setStatus("Transcribing...");
      const { text } = await transcribeAsync(uri);
      
      if (!text.trim()) {
        Alert.alert(
          'No speech detected',
          'We couldn\'t detect any speech in your recording. Please try again.',
          [{ text: 'OK' }]
        );
        setRec(null);
        setStatus("Idle");
        setRecordingDuration(0);
        return;
      }

      setStatus("Summarizing...");
      const { summary } = await summarizeAsync(text, "medium", true);
      const id = nanoid();
      insertSummary({ 
        id, 
        createdAt: Date.now(), 
        title: "Voice note", 
        medium: summary, 
        sourceKind: "voice" 
      });
      
      showSuccessToast("Voice note summarized successfully!");
      navigation.replace("Summary", { id });
    } catch (error) {
      handleError(error, 'Failed to process voice recording');
    } finally {
      setRec(null);
      setStatus("Idle");
      setRecordingDuration(0);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <Card style={styles.statusCard}>
          <CardContent>
            <View style={styles.statusContainer}>
              {status === "Recording" ? (
                <Pulse duration={800}>
                  <Text variant="h2" align="center" style={{ color: colors.red }}>
                    🎤 Recording
                  </Text>
                </Pulse>
              ) : (
                <Text variant="h2" align="center">
                  {status === "Idle" ? "🎤" : "⏳"} {status}
                </Text>
              )}
              
              {status === "Recording" && (
                <AnimatedView animation="fadeIn" delay={500}>
                  <Text variant="h3" align="center" style={styles.duration}>
                    {formatDuration(recordingDuration)}
                  </Text>
                </AnimatedView>
              )}
            </View>
          </CardContent>
        </Card>
      </AnimatedView>

      {hasPermission === false && (
        <AnimatedView animation="fadeIn" delay={400}>
          <Card style={styles.permissionCard}>
            <CardContent>
              <Text align="center" style={{ color: colors.background }}>
                Microphone permission is required to record voice notes.
              </Text>
              <Button 
                variant="outline" 
                size="sm" 
                onPress={requestPermissions}
                style={styles.permissionButton}
              >
                Grant Permission
              </Button>
            </CardContent>
          </Card>
        </AnimatedView>
      )}
      
      <View style={styles.buttonContainer}>
        {!rec ? (
          <AnimatedView animation="scale" delay={300}>
            <Button 
              size="lg" 
              onPress={startRecording}
              disabled={hasPermission === false}
              style={[styles.recordButton, { backgroundColor: colors.blue }]}
            >
              Start Recording
            </Button>
          </AnimatedView>
        ) : (
          <AnimatedView animation="scale">
            <Button 
              size="lg" 
              variant="destructive"
              onPress={stopRecording}
              style={styles.recordButton}
            >
              Stop Recording
            </Button>
          </AnimatedView>
        )}
      </View>

      {status === "Idle" && hasPermission && (
        <AnimatedView animation="fadeInUp" delay={600}>
          <Card style={styles.tipsCard}>
            <CardContent>
              <Text variant="h4" style={styles.tipsTitle}>
                Recording Tips
              </Text>
              <Text style={styles.tip}>• Speak clearly and at normal pace</Text>
              <Text style={styles.tip}>• Record in a quiet environment</Text>
              <Text style={styles.tip}>• Keep recording for at least 1 second</Text>
              <Text style={styles.tip}>• Tap stop when finished speaking</Text>
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
    justifyContent: 'center' as const,
  },
  statusCard: {
    marginBottom: spacing[6],
  },
  statusContainer: {
    alignItems: 'center' as const,
    gap: spacing[3],
  },
  duration: {
    color: colors.red,
    fontFamily: 'SpaceMono-Regular',
    marginTop: spacing[2],
  },
  permissionCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.red,
  },
  permissionButton: {
    marginTop: spacing[4],
    borderColor: colors.background,
  },
  buttonContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing[8],
  },
  recordButton: {
    minWidth: 200,
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
