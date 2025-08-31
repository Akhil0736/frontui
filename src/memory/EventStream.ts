
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
    this.db = firestore();
  }

  /**
   * Records a successfully executed action and its results.
   */
  async recordAction(record: ActionRecord): Promise<void> {
    await this.db.collection('luna_events').add({
      userId: this.userId,
      eventType: 'action_completed',
      eventData: record,
      timestamp: firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Logs a generic event to the stream.
   */
  async logEvent(eventType: string, details: any): Promise<void> {
    await this.db.collection('luna_events').add({
        userId: this.userId,
        eventType: eventType,
        eventData: details,
        timestamp: firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Retrieves recent events from the stream for analysis.
   * @param hours The number of hours to look back.
   * @returns A promise that resolves to an array of event data.
   */
  async getRecentEvents(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const query = await this.db.collection('luna_events')
      .where('userId', '==', this.userId)
      .where('timestamp', '>', since)
      .orderBy('timestamp', 'desc')
      .get();
    return query.docs.map(doc => doc.data());
  }
}
