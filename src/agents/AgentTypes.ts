
'use server';

import { ActionResult } from "@/automation/InstagramActions";
import { StrategyAction } from "@/planning/StrategyPlanner";

export interface AgentState {
  status: 'standby' | 'active' | 'paused' | 'error';
  userId: string;
  sessionId: string;
  currentStep: number;
  totalSteps: number;
}

export interface InstagramCredentials {
    username: string;
    password?: string; // Password might be stored securely
    sessionCookies?: any; // For resuming sessions
}

export interface SafetyResult {
    safe: boolean;
    score: number;
    reason?: string;
    suggestedWait?: number; // in seconds
}

export interface ActionRecord {
    sessionId: string;
    step: number;
    action: StrategyAction;
    results: ActionResult[];
    safetyScore: number;
    timestamp: Date;
}
