
'use server';

import { BrowserController } from '../automation/BrowserController';
import { InstagramActions, ActionResult } from '../automation/InstagramActions';
import { SafetyMonitor, SafetyResult } from '../safety/SafetyMonitor';
import { StrategyPlanner, StrategyAction } from '../planning/StrategyPlanner';
import { EventStream } from '../memory/EventStream';
import { AgentState, InstagramCredentials } from './AgentTypes';

export class LunaAgent {
  private state: AgentState;
  private browserController: BrowserController;
  private instagramActions: InstagramActions;
  private safetyMonitor: SafetyMonitor;
  private strategyPlanner: StrategyPlanner;
  private eventStream: EventStream;
  
  constructor(userId: string) {
    this.state = {
      status: 'standby',
      userId: userId,
      sessionId: this.generateSessionId(),
      currentStep: 0,
      totalSteps: 0
    };
    
    this.browserController = new BrowserController(userId);
    this.instagramActions = new InstagramActions(this.browserController, userId);
    this.safetyMonitor = new SafetyMonitor(userId);
    this.strategyPlanner = new StrategyPlanner(userId);
    this.eventStream = new EventStream(userId);
  }
  
  async executeAgentLoop(goal: string, credentials: InstagramCredentials): Promise<void> {
    try {
      this.state.status = 'active';
      
      await this.initializeSession(credentials);
      
      const plan = await this.strategyPlanner.createPlan(goal);
      this.state.totalSteps = plan.steps.length;
      
      while (this.state.status === 'active' && this.state.currentStep < this.state.totalSteps) {
        const nextAction = await this.getNextAction();
        
        if (!nextAction) {
          await this.completeSession('No more actions');
          break;
        }
        
        const safetyCheck = await this.safetyMonitor.validateAction(nextAction);
        if (!safetyCheck.safe) {
          await this.handleSafetyViolation(safetyCheck);
          continue;
        }
        
        const actionResults = await this.executeAction(nextAction);
        
        await this.eventStream.recordAction({
          sessionId: this.state.sessionId,
          step: this.state.currentStep,
          action: nextAction,
          results: actionResults,
          safetyScore: safetyCheck.score,
          timestamp: new Date()
        });
        
        await this.strategyPlanner.updateProgress(nextAction.id, actionResults);
        
        this.state.currentStep++;
        
        await this.waitBetweenActions(nextAction.actionType);
      }
      
      await this.completeSession('All actions completed');
      
    } catch (error: any) {
      await this.handleError(error);
    } finally {
      await this.cleanup();
    }
  }
  
  private async initializeSession(credentials: InstagramCredentials): Promise<void> {
    await this.eventStream.logEvent('session_start', { 
      sessionId: this.state.sessionId 
    });
    
    await this.browserController.initialize();
    
    const loginSuccess = await this.browserController.loginToInstagram(
      credentials.username, 
      credentials.password
    );
    
    if (!loginSuccess) {
      throw new Error('Instagram login failed');
    }
    
    await this.eventStream.logEvent('login_success', {
      username: credentials.username
    });
  }
  
  private async getNextAction(): Promise<StrategyAction | null> {
    // This would typically fetch from a database like Firestore
    const plan = await this.strategyPlanner.getPlan();
    if (!plan || plan.status !== 'active') return null;
    
    return plan.steps.find((step: StrategyAction) => !step.completed) || null;
  }
  
  private async executeAction(action: StrategyAction): Promise<ActionResult[]> {
    await this.eventStream.logEvent('action_start', {
      actionType: action.actionType,
      description: action.description
    });
    
    let results: ActionResult[] = [];
    
    switch (action.actionType) {
      case 'like_posts':
        results = await this.instagramActions.likePostsByHashtag(
          action.parameters.hashtag,
          action.parameters.count
        );
        break;
        
      case 'follow_users':
        results = await this.instagramActions.followUsersByHashtag(
          action.parameters.hashtag,
          action.parameters.count
        );
        break;
        
      case 'comment_posts':
        results = await this.instagramActions.commentOnPosts(
          action.parameters.hashtag,
          action.parameters.comments,
          action.parameters.count
        );
        break;
        
      case 'analyze_account':
        results = await this.analyzeAccountPerformance();
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
    
    await this.eventStream.logEvent('action_complete', {
      actionType: action.actionType,
      resultsCount: results.length,
      successCount: results.filter(r => r.success).length
    });
    
    return results;
  }
  
  private async analyzeAccountPerformance(): Promise<ActionResult[]> {
    // Placeholder for LLM analysis
    const analysisPrompt = `Analyze Instagram account performance based on recent activity data`;
    
    return [{
      action: 'analysis',
      target: 'account',
      success: true,
      details: { message: 'Analysis completed' },
      timestamp: new Date()
    }];
  }
  
  private async waitBetweenActions(actionType: string): Promise<void> {
    const delays: { [key: string]: { min: number, max: number } } = {
      'like_posts': { min: 120000, max: 300000 },    // 2-5 minutes
      'follow_users': { min: 300000, max: 600000 },  // 5-10 minutes
      'comment_posts': { min: 600000, max: 900000 }, // 10-15 minutes
      'analyze_account': { min: 30000, max: 60000 }  // 30-60 seconds
    };
    
    const delay = delays[actionType] || { min: 60000, max: 120000 };
    const waitTime = Math.floor(Math.random() * (delay.max - delay.min + 1)) + delay.min;
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  private async handleSafetyViolation(safetyCheck: SafetyResult): Promise<void> {
    await this.eventStream.logEvent('safety_violation', {
      reason: safetyCheck.reason,
      suggestedWait: safetyCheck.suggestedWait
    });
    
    if (safetyCheck.suggestedWait) {
      await new Promise(resolve => setTimeout(resolve, safetyCheck.suggestedWait * 1000));
    }
  }
  
  private async completeSession(reason: string): Promise<void> {
    this.state.status = 'standby';
    
    await this.eventStream.logEvent('session_complete', {
      sessionId: this.state.sessionId,
      reason: reason,
      totalSteps: this.state.currentStep
    });
  }
  
  private async handleError(error: any): Promise<void> {
    this.state.status = 'error';
    
    await this.eventStream.logEvent('agent_error', {
      error: error.message,
      stack: error.stack
    });
  }
  
  private async cleanup(): Promise<void> {
    await this.browserController.cleanup();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
