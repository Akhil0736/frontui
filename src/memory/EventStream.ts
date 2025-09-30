
'use server';

import { ActionRecord } from "@/agents/AgentTypes";
import { createClient } from '@/lib/supabase/server';

/**
 * Manages the agent's memory by logging all significant events to Supabase.
 * This stream is crucial for learning, debugging, and providing
 * progress updates to the user.
 */
export class EventStream {
  constructor(private userId: string) {}

  /**
   * Records a successfully executed action and its results.
   */
  async recordAction(record: ActionRecord): Promise<void> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from('luna_events').insert({
            user_id: this.userId,
            event_type: 'action_completed',
            event_data: record,
            timestamp: new Date().toISOString()
        });
        
        if (error) {
            console.error("Failed to record action to Supabase", error);
        }
    } catch (e) {
        console.error("Failed to record action to Supabase", e);
    }
  }

  /**
   * Logs a generic event to the stream.
   */
  async logEvent(eventType: string, details: any): Promise<void> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from('luna_events').insert({
            user_id: this.userId,
            event_type: eventType,
            event_data: details,
            timestamp: new Date().toISOString()
        });
        
        if (error) {
            console.error(`Failed to log event "${eventType}" to Supabase`, error);
        }
    } catch (e) {
        console.error(`Failed to log event "${eventType}" to Supabase`, e);
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
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('luna_events')
          .select('*')
          .eq('user_id', this.userId)
          .gt('timestamp', since.toISOString())
          .order('timestamp', { ascending: false });
        
        if (error) {
            console.error("Failed to get recent events from Supabase", error);
            return [];
        }
        
        return data || [];
    } catch(e) {
        console.error("Failed to get recent events from Supabase", e);
        return [];
    }
  }
}
