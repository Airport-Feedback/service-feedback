import { ContactFormData } from "@/components/kiosk/ContactForm";
const LOCAL_DB_NAME = process.env.LOCAL_DB_NAME || "FeedbackKioskDB";
const DB_VERSION = 1;
const STORE_NAME = "pendingFeedback";
const API_ENDPOINT = process.env.API_URL || "http://localhost:3000/api/feedback"; // Fixed extra quote
console.log("Local DB name", process.env.LOCAL_DB_NAME)
console.log("API URL name", process.env.API_URL)
interface StoredFeedback extends ContactFormData {
  id: string;
  deviceId: string;
  synced: number; // 0 = false, 1 = true
  attempts: number;
  lastAttempt?: string;
}

// Generate device ID for kiosk identification
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("kioskDeviceId");
  if (!deviceId) {
    deviceId = `kiosk-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("kioskDeviceId", deviceId);
  }
  return deviceId;
};

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

// Save feedback to IndexedDB
export const saveFeedbackOffline = async (formData: ContactFormData): Promise<string> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const feedbackEntry: StoredFeedback = {
    ...formData,
    id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    deviceId: getDeviceId(),
    synced: 0, // use 0 instead of false
    attempts: 0,
  };

  return new Promise((resolve, reject) => {
    const request = store.add(feedbackEntry);
    request.onsuccess = () => {
      console.log("Feedback saved offline:", feedbackEntry.id);
      resolve(feedbackEntry.id);
    };
    request.onerror = () => reject(request.error);
  });
};

// Get all unsynced feedback
const getPendingFeedback = async (): Promise<StoredFeedback[]> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("synced");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.only(0)); // 0 = unsynced
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Mark feedback as synced
const markAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const feedback = getRequest.result;
      if (feedback) {
        feedback.synced = 1; // mark as synced
        const updateRequest = store.put(feedback);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve(); // Item not found, consider it synced
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Update sync attempt counter
const updateSyncAttempt = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const feedback = getRequest.result;
      if (feedback) {
        feedback.attempts += 1;
        feedback.lastAttempt = new Date().toISOString();
        const updateRequest = store.put(feedback);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Send feedback to server
const sendToServer = async (feedback: StoredFeedback): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: feedback.rating,
        name: feedback.name,
        email: feedback.email,
        phone: feedback.phone,
        profession: feedback.profession,
        comment: feedback.comment,
        timestamp: feedback.timestamp,
        device_id: feedback.deviceId,
        offline_id: feedback.id,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Network error sending feedback:", error);
    return false;
  }
};

// Sync all pending feedback with exponential backoff
export const syncPendingFeedback = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("Device is offline, skipping sync");
    return;
  }

  try {
    const pendingItems = await getPendingFeedback();
    console.log(`Found ${pendingItems.length} pending feedback items to sync`);

    for (const item of pendingItems) {
      // Skip items that have failed too many times (max 5 attempts)
      if (item.attempts >= 5) {
        console.log(`Skipping item ${item.id} - too many failed attempts`);
        continue;
      }

      // Exponential backoff: wait longer after each failed attempt
      if (item.lastAttempt) {
        const timeSinceLastAttempt = Date.now() - new Date(item.lastAttempt).getTime();
        const backoffDelay = Math.pow(2, item.attempts) * 1000; // 1s, 2s, 4s, 8s, 16s

        if (timeSinceLastAttempt < backoffDelay) {
          console.log(`Skipping item ${item.id} - still in backoff period`);
          continue;
        }
      }

      await updateSyncAttempt(item.id);

      const success = await sendToServer(item);
      if (success) {
        await markAsSynced(item.id);
        console.log(`Successfully synced feedback ${item.id}`);
      } else {
        console.log(`Failed to sync feedback ${item.id}, attempt ${item.attempts + 1}`);
      }
    }
  } catch (error) {
    console.error("Error syncing pending feedback:", error);
  }
};

// Get sync status for admin/debugging
export const getSyncStatus = async () => {
  const pending = await getPendingFeedback();
  const total = pending.length;
  const failed = pending.filter(item => item.attempts >= 5).length;
  const retrying = pending.filter(item => item.attempts > 0 && item.attempts < 5).length;

  return {
    total,
    failed,
    retrying,
    online: navigator.onLine,
  };
};

// Clear old synced data (optional cleanup)
export const cleanupOldData = async (daysToKeep: number = 7): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));

  return new Promise((resolve, reject) => {
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const feedback = cursor.value as StoredFeedback;
        const feedbackDate = new Date(feedback.timestamp);

        if (feedback.synced === 1 && feedbackDate < cutoffDate) {
          cursor.delete();
        }

        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
};
