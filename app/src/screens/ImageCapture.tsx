import * as ImagePicker from "expo-image-picker";
import { View, Alert, Dimensions, Image } from "react-native";
import { useState, useEffect } from "react";
import { ocrAsync, summarizeAsync } from "../api/client";
import { insertSummary } from "../store/db";
import { nanoid } from "nanoid/non-secure";
import { handleError, showSuccessToast } from "../utils/errorHandler";
import { Button, Text, AnimatedView, Card, CardContent, Badge } from "../components/ui";
import { colors, spacing } from "../lib/tokens";

const { width } = Dimensions.get('window');

export default function ImageCapture({ navigation }: any) {
  const [uri, setUri] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [imageInfo, setImageInfo] = useState<{ width?: number; height?: number; size?: number } | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      setHasPermission(cameraStatus === 'granted' && libraryStatus === 'granted');
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This app needs camera and photo library access to capture and select images.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      handleError(error, 'Failed to request permissions');
      setHasPermission(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const validateImageQuality = (info: { width?: number; height?: number; size?: number }) => {
    const warnings = [];
    
    if (info.width && info.height) {
      const pixels = info.width * info.height;
      if (pixels < 500000) { // Less than 0.5MP
        warnings.push('Low resolution - OCR accuracy may be reduced');
      }
    }
    
    if (info.size && info.size > 10 * 1024 * 1024) { // Greater than 10MB
      warnings.push('Large file size - processing may be slower');
    }
    
    return warnings;
  };

export default function ImageCapture({ navigation }: any) {
  const [uri, setUri] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");

  const pickFromGallery = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to select images.',
        [
          { text: 'Cancel' },
          { text: 'Settings', onPress: () => requestPermissions() }
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
        exif: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUri(asset.uri);
        setImageInfo({
          width: asset.width,
          height: asset.height,
          size: asset.fileSize,
        });
      }
    } catch (error) {
      handleError(error, "Failed to pick image from gallery");
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take photos.',
        [
          { text: 'Cancel' },
          { text: 'Settings', onPress: () => requestPermissions() }
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
        exif: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUri(asset.uri);
        setImageInfo({
          width: asset.width,
          height: asset.height,
          size: asset.fileSize,
        });
      }
    } catch (error) {
      handleError(error, "Failed to take photo");
    }
  };

  const processImage = async () => {
    if (!uri) {
      Alert.alert('No Image', 'Please select or take a photo first.');
      return;
    }

    try {
      setStatus("Extracting text...");
      const { text } = await ocrAsync(uri);

      if (!text || text.trim().length < 10) {
        Alert.alert(
          'No Text Found',
          'We couldn\'t extract enough readable text from this image. Please try:\n\n• Taking a clearer photo\n• Ensuring good lighting\n• Making sure text is visible and not blurry',
          [
            { text: 'Try Again', onPress: () => setStatus("Idle") },
            { text: 'Process Anyway', onPress: () => continueProcessing(text) }
          ]
        );
        return;
      }

      await continueProcessing(text);
    } catch (error) {
      handleError(error, "Failed to process image");
      setStatus("Idle");
    }
  };

  const continueProcessing = async (text: string) => {
    try {
      setStatus("Summarizing...");
      const { summary } = await summarizeAsync(text || "No text found in image", "medium", true);

      const id = nanoid();
      await insertSummary({ 
        id, 
        createdAt: Date.now(), 
        title: "Image note", 
        medium: summary, 
        sourceKind: "image" 
      });
      
      showSuccessToast("Image note processed successfully!");
      navigation.replace("Summary", { id });
    } catch (error) {
      handleError(error, "Failed to process image note");
      setStatus("Idle");
    }
  };

  const clearImage = () => {
    setUri(null);
    setImageInfo(null);
    setStatus("Idle");
  };

  return (
    <View style={styles.container}>
      <AnimatedView animation="fadeInDown" duration={600}>
        <Card style={styles.statusCard}>
          <CardContent>
            <Text variant="h2" align="center">
              {status === "Idle" ? "📷" : "⏳"} {status}
            </Text>
          </CardContent>
        </Card>
      </AnimatedView>

      {hasPermission === false && (
        <AnimatedView animation="fadeIn" delay={400}>
          <Card style={styles.permissionCard}>
            <CardContent>
              <Text align="center" style={{ color: colors.background }}>
                Camera and photo library permissions are required.
              </Text>
              <Button 
                variant="outline" 
                size="sm" 
                onPress={requestPermissions}
                style={styles.permissionButton}
              >
                Grant Permissions
              </Button>
            </CardContent>
          </Card>
        </AnimatedView>
      )}

      {uri && (
        <AnimatedView animation="fadeIn" delay={300}>
          <Card style={styles.imageCard}>
            <CardContent>
              <Image 
                source={{ uri }} 
                style={styles.image}
                resizeMode="cover"
              />
              
              {imageInfo && (
                <View style={styles.imageDetails}>
                  <View style={styles.imageStats}>
                    {imageInfo.width && imageInfo.height && (
                      <Badge variant="secondary">
                        {imageInfo.width} × {imageInfo.height}
                      </Badge>
                    )}
                    {imageInfo.size && (
                      <Badge variant="secondary">
                        {formatFileSize(imageInfo.size)}
                      </Badge>
                    )}
                  </View>
                  
                  {imageInfo && validateImageQuality(imageInfo).map((warning, index) => (
                    <Badge key={index} variant="destructive" style={styles.warning}>
                      ⚠️ {warning}
                    </Badge>
                  ))}
                </View>
              )}
              
              <View style={styles.imageActions}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onPress={clearImage}
                  style={styles.clearButton}
                >
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onPress={processImage}
                  disabled={status !== "Idle"}
                  style={styles.processButton}
                >
                  Extract & Summarize
                </Button>
              </View>
            </CardContent>
          </Card>
        </AnimatedView>
      )}

      {!uri && hasPermission && (
        <>
          <AnimatedView animation="scale" delay={400}>
            <Button 
              size="lg" 
              onPress={takePhoto}
              style={[styles.actionButton, { backgroundColor: colors.blue }]}
            >
              📷 Take Photo
            </Button>
          </AnimatedView>

          <AnimatedView animation="scale" delay={500}>
            <Button 
              size="lg" 
              variant="outline"
              onPress={pickFromGallery}
              style={styles.actionButton}
            >
              🖼️ Choose from Gallery
            </Button>
          </AnimatedView>

          <AnimatedView animation="fadeInUp" delay={600}>
            <Card style={styles.tipsCard}>
              <CardContent>
                <Text variant="h4" style={styles.tipsTitle}>
                  OCR Tips
                </Text>
                <Text style={styles.tip}>• Ensure good lighting and focus</Text>
                <Text style={styles.tip}>• Keep text horizontal and readable</Text>
                <Text style={styles.tip}>• Avoid shadows and reflections</Text>
                <Text style={styles.tip}>• Use high contrast (dark text, light background)</Text>
              </CardContent>
            </Card>
          </AnimatedView>
        </>
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
    marginBottom: spacing[6],
  },
  permissionCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.red,
  },
  permissionButton: {
    marginTop: spacing[4],
    borderColor: colors.background,
  },
  imageCard: {
    marginBottom: spacing[6],
  },
  image: {
    width: width - (spacing[6] * 2) - (spacing[4] * 2), // Full width minus container and card padding
    height: 250,
    borderRadius: 12,
    marginBottom: spacing[4],
  },
  imageDetails: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  imageStats: {
    flexDirection: 'row' as const,
    gap: spacing[2],
    flexWrap: 'wrap' as const,
  },
  warning: {
    backgroundColor: colors.red,
  },
  imageActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: spacing[3],
  },
  clearButton: {
    flex: 1,
  },
  processButton: {
    flex: 2,
  },
  actionButton: {
    marginBottom: spacing[4],
    minHeight: 60,
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