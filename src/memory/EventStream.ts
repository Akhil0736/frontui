
'use server';

import { ActionRecord } from "@/agents/AgentTypes";
import { firestore } from 'firebase-admin';

/**
 * Manages the agent's memory by logging all significant events to Firestore.
 * This stream is crucial for learning, debugging, and providing
 * progress updates to the user.
 */
export class EventStream {
  private db: firestore.Firestore;

  constructor(private userId: string) {
    // This assumes Firebase has been initialized elsewhere in the app
    // For local development, you might need to initialize it here if not done globally
    if (!firestore.getApps().length) {
        // This is a simplification. In a real app, you'd have a centralized initialization.
        // firestore.initializeApp(); 
        console.warn("Firebase Admin SDK not initialized. EventStream will not work.");
        // @ts-ignore
        this.db = { collection: () => ({ add: async () => {}, where: () => ({ get: async () => ({ docs: [] })}) }) };

    } else {
        this.db = firestore();
    }
  }

  /**
   * Records a successfully executed action and its results.
   */
  async recordAction(record: ActionRecord): Promise<void> {
    try {
        await this.db.collection('luna_events').add({
            userId: this.userId,
            eventType: 'action_completed',
            eventData: record,
            timestamp: firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to record action to Firestore", e);
    }
  }

  /**
   * Logs a generic event to the stream.
   */
  async logEvent(eventType: string, details: any): Promise<void> {
    try {
        await this.db.collection('luna_events').add({
            userId: this.userId,
            eventType: eventType,
            eventData: details,
            timestamp: firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error(`Failed to log event "${eventType}" to Firestore`, e);
    }
  }

  /**
   * Retrieves recent events from the stream for analysis.
   * @param hours The number of hours to look back.
   * @returns A promise that resolves to an array of event data.
   */
  async getRecentEvents(hours: number = 24): Promise<any[]> {
    try {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const query = await this.db.collection('luna_events')
          .where('userId', '==', this.userId)
          .where('timestamp', '>', since)
          .orderBy('timestamp', 'desc')
          .get();
        return query.docs.map(doc => doc.data());
    } catch(e) {
        console.error("Failed to get recent events from Firestore", e);
        return [];
    }
  }
}
