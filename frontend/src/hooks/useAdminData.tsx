"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getAIHealth, getOperationsReport, type Issue, type Trace } from "@/services/operations";

interface AdminDataContextValue {
  issues: Issue[];
  traces: Trace[];
  aiService: string | undefined;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

/**
 * `/api/operations/report` is the only platform-wide read the ADMIN role has.
 * It returns the delayed-order issues and a trace per read-only tool that ran,
 * so those two facts are what the dashboard can actually show.
 */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [aiService, setAiService] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [reportResult, healthResult] = await Promise.allSettled([
      getOperationsReport(),
      getAIHealth(),
    ]);

    if (reportResult.status === "fulfilled") {
      setIssues(reportResult.value.issues ?? []);
      setTraces(reportResult.value.tools ?? []);
    } else {
      setError(
        reportResult.reason instanceof Error
          ? reportResult.reason.message
          : "Could not load the operations report.",
      );
    }

    if (healthResult.status === "fulfilled") {
      setAiService(healthResult.value.ai_service);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <AdminDataContext.Provider
      value={{ issues, traces, aiService, loading, error, reload: load }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error("useAdminData must be used inside AdminDataProvider");
  }

  return context;
}
