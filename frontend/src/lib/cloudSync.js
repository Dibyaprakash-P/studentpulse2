/**
 * Student Pulse — Cloud Sync Service
 * Syncs all localStorage data to Firebase Firestore so the same
 * Google account sees the same data on every device.
 *
 * Data structure in Firestore:
 *   users/{email}/data/{key} → { value: <JSON data> }
 */

import { getDb, isFirebaseConfigured } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* localStorage keys to sync */
const SYNC_KEYS = [
  "sp_users",
  "sp_activities",
  "sp_predictions",
  "sp_homework",
  "sp_attendance",
  "sp_notes",
  "sp_projects",
  "sp_report_cards",
  "sp_link_codes",
];

/* Sanitize email for use as Firestore document ID */
function emailToId(email) {
  return email.replace(/[.#$/\[\]]/g, "_");
}

/**
 * Push all local data to Firestore (called after any data change)
 */
export async function pushToCloud(email) {
  if (!isFirebaseConfigured() || !email) return;
  const db = getDb();
  if (!db) return;

  try {
    const userId = emailToId(email);
    const allData = {};

    for (const key of SYNC_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        allData[key] = raw;
      }
    }

    /* Store as a single document for speed */
    await setDoc(doc(db, "users", userId), {
      email,
      data: allData,
      lastSynced: new Date().toISOString(),
    }, { merge: true });

    console.log("[CloudSync] Pushed to cloud for", email);
  } catch (err) {
    console.warn("[CloudSync] Push failed:", err.message);
  }
}

/**
 * Pull all data from Firestore into localStorage (called on login)
 */
export async function pullFromCloud(email) {
  if (!isFirebaseConfigured() || !email) return false;
  const db = getDb();
  if (!db) return false;

  try {
    const userId = emailToId(email);
    const snap = await getDoc(doc(db, "users", userId));

    if (snap.exists()) {
      const cloudData = snap.data();
      const dataMap = cloudData.data || {};

      for (const key of SYNC_KEYS) {
        if (dataMap[key]) {
          /* Merge strategy: cloud data wins if local is empty,
             otherwise merge arrays by combining unique items */
          const localRaw = localStorage.getItem(key);

          if (!localRaw) {
            /* Local is empty → use cloud data */
            localStorage.setItem(key, dataMap[key]);
          } else {
            /* Both exist → smart merge */
            try {
              const localData = JSON.parse(localRaw);
              const cloudItems = JSON.parse(dataMap[key]);

              if (Array.isArray(localData) && Array.isArray(cloudItems)) {
                /* Merge arrays by ID, cloud wins on conflicts */
                const merged = [...cloudItems];
                const cloudIds = new Set(cloudItems.map(item => item.id).filter(Boolean));

                for (const localItem of localData) {
                  if (localItem.id && !cloudIds.has(localItem.id)) {
                    merged.push(localItem);
                  }
                }
                localStorage.setItem(key, JSON.stringify(merged));
              } else {
                /* Non-array (unlikely) → cloud wins */
                localStorage.setItem(key, dataMap[key]);
              }
            } catch {
              /* Parse error → cloud wins */
              localStorage.setItem(key, dataMap[key]);
            }
          }
        }
      }

      console.log("[CloudSync] Pulled from cloud for", email);
      return true;
    } else {
      console.log("[CloudSync] No cloud data found for", email, "— will push local data");
      /* First time this account syncs: push current local data up */
      await pushToCloud(email);
      return false;
    }
  } catch (err) {
    console.warn("[CloudSync] Pull failed:", err.message);
    return false;
  }
}

/**
 * Schedule a debounced sync (call this after any data mutation)
 */
let syncTimer = null;
let syncEmail = null;

export function schedulePush(email) {
  syncEmail = email;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    if (syncEmail) pushToCloud(syncEmail);
  }, 2000); /* Debounce 2 seconds */
}
