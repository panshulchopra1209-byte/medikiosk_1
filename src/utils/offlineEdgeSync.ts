/**
 * MediKiosk Local Edge Storage & Asynchronous Background Sync Engine
 * Ensures 100% uninterrupted intake, token issuance, and voice handling even during hospital internet outages.
 */
import { OPDQueueItem } from '../types';
import { fetchWithCsrf } from './csrf';

const OFFLINE_QUEUE_KEY = 'medikiosk_offline_edge_queue_v1';
const SIMULATED_OFFLINE_KEY = 'medikiosk_simulate_offline_v1';

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  syncInProgress: boolean;
}

// Check if currently operating offline (either real browser offline or simulated)
export function isOperatingOffline(): boolean {
  if (typeof window === 'undefined') return false;
  const isSimulated = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  return !navigator.onLine || isSimulated;
}

export function setSimulatedOffline(offline: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_OFFLINE_KEY, offline ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('medikiosk-network-changed', { detail: { isOnline: !isOperatingOffline() } }));
}

export function getSimulatedOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
}

// Retrieve pending offline queue items
export function getOfflinePendingQueue(): OPDQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read offline queue:', e);
    return [];
  }
}

// Save an item to the local edge queue
export function saveToOfflineEdgeQueue(item: OPDQueueItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflinePendingQueue();
    // Avoid duplicate IDs
    const filtered = current.filter((i) => i.id !== item.id);
    const updated = [...filtered, { ...item, status: item.status || 'WAITING' }];
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('medikiosk-offline-queue-changed', { detail: { count: updated.length } }));
  } catch (e) {
    console.warn('Failed to save to offline edge queue:', e);
  }
}

// Remove synced item from local edge queue
export function removeOfflineQueueItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflinePendingQueue();
    const updated = current.filter((i) => i.id !== id);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('medikiosk-offline-queue-changed', { detail: { count: updated.length } }));
  } catch (e) {
    console.warn('Failed to remove from offline queue:', e);
  }
}

// Flush and sync all pending edge queue records to central server
export async function syncOfflineQueueWithCentralServer(
  onProgress?: (synced: number, total: number) => void
): Promise<{ success: boolean; syncedCount: number; errors: number }> {
  if (isOperatingOffline()) {
    return { success: false, syncedCount: 0, errors: 0 };
  }

  const pending = getOfflinePendingQueue();
  if (pending.length === 0) {
    return { success: true, syncedCount: 0, errors: 0 };
  }

  let syncedCount = 0;
  let errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    try {
      const res = await fetchWithCsrf('/api/queue', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success) {
        removeOfflineQueueItem(item.id);
        syncedCount++;
        if (onProgress) onProgress(syncedCount, pending.length);
      } else {
        errors++;
      }
    } catch (err) {
      console.warn('Sync failed for item', item.id, err);
      errors++;
    }
  }

  localStorage.setItem('medikiosk_last_edge_sync', new Date().toISOString());
  window.dispatchEvent(
    new CustomEvent('medikiosk-sync-completed', {
      detail: { syncedCount, errors, timestamp: new Date().toISOString() },
    })
  );

  return { success: errors === 0, syncedCount, errors };
}

// Alias for enqueueing an offline intake record
export const enqueueOfflinePatient = saveToOfflineEdgeQueue;

// Background auto-sync listener that activates whenever edge connection is restored
export function setupOfflineQueueAutoSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    if (!isOperatingOffline()) {
      syncOfflineQueueWithCentralServer();
    }
  };

  const handleNetworkChange = () => {
    if (!isOperatingOffline()) {
      syncOfflineQueueWithCentralServer();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('medikiosk-network-changed', handleNetworkChange);

  // Check periodically every 15s if online with pending items
  const timer = setInterval(() => {
    if (!isOperatingOffline() && getOfflinePendingQueue().length > 0) {
      syncOfflineQueueWithCentralServer();
    }
  }, 15000);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('medikiosk-network-changed', handleNetworkChange);
    clearInterval(timer);
  };
}

