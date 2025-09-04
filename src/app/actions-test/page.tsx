"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RionaClient } from "@/sdk/rionaClient";
import Link from "next/link";

type TaskStatus = {
  id: string;
  user: string;
  status: "pending" | "running" | "completed" | "failed";
  results: any[];
  error?: string;
};

export default function ActionsTestPage() {
  const [baseURL, setBaseURL] = useState(
    () => process.env.NEXT_PUBLIC_RIONA_API_URL || "http://localhost:3001/api"
  );
  const client = useMemo(() => new RionaClient({ baseURL, credentials: "include" }), [baseURL]);

  const [sessionId, setSessionId] = useState("");
  const [username, setUsername] = useState("");
  const [loginMsg, setLoginMsg] = useState<string>("");
  const [status, setStatus] = useState<any>(null);

  const [enqueueId, setEnqueueId] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearPoll;
  }, [clearPoll]);

  const checkStatus = useCallback(async () => {
    try {
      const s = await client.status();
      setStatus(s);
    } catch (e: any) {
      setStatus({ error: e?.message || String(e) });
    }
  }, [client]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const onLogin = useCallback(async () => {
    setLoginMsg("Logging in with session cookie...");
    try {
      await client.loginWithSession(sessionId, username || undefined);
      setLoginMsg("Login successful");
    } catch (e: any) {
      setLoginMsg(`Login failed: ${e?.message || String(e)}`);
    }
  }, [client, sessionId, username]);

  const onEnqueue = useCallback(async () => {
    try {
      setTaskStatus(null);
      const { id } = await client.enqueueActions({ actions: [{ type: "interact" }] });
      setEnqueueId(id);
      // Start polling
      clearPoll();
      pollRef.current = setInterval(async () => {
        try {
          const t = (await client.getActionStatus(id)) as TaskStatus;
          setTaskStatus(t);
          if (t.status === "completed" || t.status === "failed") {
            clearPoll();
          }
        } catch (e) {
          setTaskStatus({
            id,
            user: "",
            status: "failed",
            results: [],
            error: (e as any)?.message || String(e),
          });
          clearPoll();
        }
      }, 2000);
    } catch (e: any) {
      setTaskStatus({
        id: "",
        user: "",
        status: "failed",
        results: [],
        error: e?.message || String(e),
      });
    }
  }, [client, clearPoll]);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Riona Actions Test</h1>
      <div style={{ marginTop: 8 }}>
        <Link href="/settings" className="text-sm text-blue-600 hover:underline">
          ← Back to Settings
        </Link>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2>Configuration</h2>
        <label style={{ display: "block", margin: "8px 0" }}>
          Riona Base URL:
          <input
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <button onClick={checkStatus} style={{ padding: "8px 12px" }}>
          Check /status
        </button>
        <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 12 }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Login (Session Cookie)</h2>
        <label style={{ display: "block", margin: "8px 0" }}>
          Instagram sessionId (sessionid cookie):
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", margin: "8px 0" }}>
          Username (optional, for display only):
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <button onClick={onLogin} style={{ padding: "8px 12px" }}>Login</button>
        <div style={{ marginTop: 8 }}>{loginMsg}</div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Enqueue Actions</h2>
        <button onClick={onEnqueue} style={{ padding: "8px 12px" }}>Enqueue interact</button>
        {enqueueId && <div style={{ marginTop: 8 }}>Task ID: {enqueueId}</div>}
        <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 12 }}>
          {taskStatus ? JSON.stringify(taskStatus, null, 2) : "(no status yet)"}
        </pre>
      </section>
    </div>
  );
}
