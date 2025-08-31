
'use server';

import { ActionResult } from "@/automation/InstagramActions";
import { StrategyAction, StrategicPlan } from "@/agents/AgentTypes";
import { routeRequest } from "@/ai/router";

// Manages creating and updating strategic plans.
export class StrategyPlanner {
  constructor(private userId: string) {}

  /**
   * Creates a strategic plan to achieve a goal.
   * This is where a powerful LLM would be used to break down a high-level goal
   * (e.g., "grow my followers") into a concrete series of actions.
   */
  async createPlan(goal: string): Promise<StrategicPlan> {
    const planningPrompt = `
Create a safe Instagram growth strategy for: "${goal}"

Generate 8-12 specific actions with these types:
- like_posts: Like posts from specific hashtags
- follow_users: Follow users from competitor accounts  
- comment_posts: Leave authentic comments
- analyze_account: Review performance metrics

Focus on safety: max 60 likes/hour, 15 follows/hour, 20 comments/hour.

Return JSON format:
{
  "steps": [
    {
      "id": "step1",
      "description": "Like 15 posts from #fitness hashtag",
      "actionType": "like_posts",
      "parameters": {"hashtag": "fitness", "count": 15},
      "completed": false
    }
  ]
}`;
    
    // Call your LLM router here
    const planResponse = await this.callPlanningModel(planningPrompt);
    
    const plan: StrategicPlan = {
      planId: `plan_${Date.now()}`,
      userId: this.userId,
      goal: goal,
      steps: planResponse.steps,
      status: 'active',
      createdAt: new Date()
    };
    
    // Placeholder for saving to Firestore
    // await this.db.collection('strategy_plans').add(plan);
    
    return plan;
  }

  /**
   * Retrieves the current active plan.
   * In a real implementation, this would fetch from a database.
   */
  async getPlan(): Promise<StrategicPlan | null> {
    // Mock implementation returns a new plan for now
    return this.createPlan("Mock goal to get a plan");
  }

  /**
   * Updates the progress of a plan based on action results.
   */
  async updateProgress(actionId: string, results: ActionResult[]): Promise<void> {
    console.log(`Updating progress for action ${actionId} with ${results.length} results.`);
    // This would update the status of the action in a database like Firestore.
  }

  private async callPlanningModel(prompt: string): Promise<{steps: StrategyAction[]}> {
    // Use your existing router system
    const response = await routeRequest(prompt, [], []);
    
    try {
      // The router returns a string, which we expect to be JSON.
      const parsedResponse = JSON.parse(response.response);
      if (parsedResponse && Array.isArray(parsedResponse.steps)) {
        return parsedResponse;
      }
      throw new Error("Invalid plan structure in LLM response");
    } catch (error) {
      console.error("Failed to parse planning model response, using fallback.", error);
      // Fallback plan if LLM response isn't valid JSON
      return {
        steps: [
          {
            id: 'fallback_step_1',
            description: "Like 10 posts from #marketing hashtag", 
            actionType: "like_posts",
            parameters: { hashtag: "marketing", count: 10 },
            completed: false
          }
        ]
      };
    }
  }
}
