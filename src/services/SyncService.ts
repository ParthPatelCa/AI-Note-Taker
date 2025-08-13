import { transcribeAsync, ocrAsync, summarizeAsync } from '../api/client';
import { getPendingSyncItems, updateSyncStatus, updateSummary } from '../store/db';
import { handleError } from '../utils/errorHandler';
import NetInfo from '@react-native-community/netinfo';

interface PendingSyncItem {
  id: string;
  sourceKind: 'voice' | 'text' | 'image';
  sourceUri?: string;
  rawContent?: string;
  title: string;
  createdAt: number;
}

class SyncService {
  private isRunning = false;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  async syncPendingNotes(): Promise<{ success: number; failed: number }> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return { success: 0, failed: 0 };
    }

    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('No network connectivity, skipping sync');
      return { success: 0, failed: 0 };
    }

    this.isRunning = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = getPendingSyncItems() as PendingSyncItem[];
      console.log(`Found ${pendingItems.length} items to sync`);

      for (const item of pendingItems) {
        try {
          const success = await this.syncSingleItem(item);
          if (success) {
            successCount++;
            // Reset retry count on success
            this.retryAttempts.delete(item.id);
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failedCount++;
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failedCount} failed`);
    } catch (error) {
      handleError(error, 'Failed to sync pending notes');
    } finally {
      this.isRunning = false;
    }

    return { success: successCount, failed: failedCount };
  }

  private async syncSingleItem(item: PendingSyncItem): Promise<boolean> {
    const retryCount = this.retryAttempts.get(item.id) || 0;
    
    if (retryCount >= this.maxRetries) {
      console.log(`Max retries reached for item ${item.id}, skipping`);
      return false;
    }

    try {
      let processedText = '';
      
      // Process based on source kind
      switch (item.sourceKind) {
        case 'voice':
          if (!item.sourceUri) {
            throw new Error('No source URI for voice note');
          }
          const transcription = await transcribeAsync(item.sourceUri);
          processedText = transcription.text;
          break;
          
        case 'image':
          if (!item.sourceUri) {
            throw new Error('No source URI for image note');
          }
          const ocrResult = await ocrAsync(item.sourceUri);
          processedText = ocrResult.text;
          break;
          
        case 'text':
          if (!item.rawContent) {
            throw new Error('No raw content for text note');
          }
          processedText = item.rawContent;
          break;
          
        default:
          throw new Error(`Unknown source kind: ${item.sourceKind}`);
      }

      if (!processedText.trim()) {
        throw new Error('No text content to summarize');
      }

      // Generate summary
      const summary = await summarizeAsync(processedText, 'medium', true);
      
      // Update the database with new summary and mark as synced
      await updateSummary(item.id, {
        medium: summary.summary,
        tldr: summary.tldr || null,
        full: summary.full || null,
        actions: summary.actions || null,
        isSynced: 1
      });

      console.log(`Successfully synced item ${item.id}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to sync item ${item.id} (attempt ${retryCount + 1}):`, error);
      
      // Increment retry count
      this.retryAttempts.set(item.id, retryCount + 1);
      
      // Exponential backoff for retries
      if (retryCount < this.maxRetries - 1) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.log(`Will retry item ${item.id} in ${delay}ms`);
        setTimeout(() => {
          this.syncSingleItem(item);
        }, delay);
      }
      
      return false;
    }
  }

  async syncOnNetworkRestore(): Promise<void> {
    console.log('Network restored, starting sync...');
    await this.syncPendingNotes();
  }

  startNetworkListener(): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Small delay to ensure connection is stable
        setTimeout(() => {
          this.syncOnNetworkRestore();
        }, 1000);
      }
    });

    return unsubscribe;
  }

  // Manual sync trigger for user-initiated sync
  async forcSync(): Promise<{ success: number; failed: number }> {
    console.log('Force sync initiated by user');
    return await this.syncPendingNotes();
  }
}

// Singleton instance
export const syncService = new SyncService();

// Convenience exports
export const syncPendingNotes = () => syncService.syncPendingNotes();
export const startNetworkListener = () => syncService.startNetworkListener();
export const forceSync = () => syncService.forcSync();
