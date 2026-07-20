import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  LifeBuoy,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  Webhook,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

type OverviewSchedule = Pick<
  Tables<"blog_automation_schedules">,
  "id" | "name" | "is_enabled" | "next_run_at" | "consecutive_failures" | "max_failures"
>;

type OverviewRun = Pick<
  Tables<"blog_automation_runs">,
  "id" | "status" | "provider" | "generated_title" | "error_message" | "blog_post_id" | "scheduled_for" | "completed_at"
>;

interface QueryResult {
  data: unknown;
  error: { message?: string } | null;
  count?: number | null;
}

interface OverviewData {
  totalUsers: number | null;
  premiumUsers: number | null;
  totalResumes: number | null;
  publishedPosts: number | null;
  blogViews: number | null;
  activeSchedules: number | null;
  openTickets: number | null;
  failedWebhooks: number | null;
  activeAiKeys: number | null;
  schedules: OverviewSchedule[];
  recentRuns: OverviewRun[];
  unavailable: string[];
}

type AlertTone = "critical" | "warning" | "info" | "success";

interface OperationalAlert {
  id: string;
  title: string;
  description: string;
  tone: AlertTone;
  actionLabel?: string;
  actionTab?: string;
}

function safeCount(result: QueryResult): number | null {
  return result.error ? null : result.count ?? 0;
}

function safeRows<T>(result: QueryResult): T[] {
  return result.error || !Array.isArray(result.data) ? [] : result.data as T[];
}

function relativeTime(value: string | null): string {
  if (!value) return "Not completed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatDateTime(value: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function runStatusClass(status: string): string {
  switch (status) {
    case "succeeded":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "failed":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    case "running":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    case "queued":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function alertClass(tone: AlertTone): string {
  switch (tone) {
    case "critical":
      return "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/20";
    case "warning":
      return "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20";
    case "info":
      return "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20";
    default:
      return "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20";
  }
}

function AlertIcon({ tone }: { tone: AlertTone }) {
  if (tone === "critical") return <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />;
  if (tone === "warning") return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  if (tone === "info") return <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async (): Promise<OverviewData> => {
      const [
        usersResult,
        premiumResult,
        resumesResult,
        blogResult,
        schedulesResult,
        runsResult,
        ticketsResult,
        webhooksResult,
        aiKeysResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("status,view_count"),
        supabase
          .from("blog_automation_schedules")
          .select("id,name,is_enabled,next_run_at,consecutive_failures,max_failures")
          .order("next_run_at", { ascending: true }),
        supabase
          .from("blog_automation_runs")
          .select("id,status,provider,generated_title,error_message,blog_post_id,scheduled_for,completed_at")
          .order("scheduled_for", { ascending: false })
          .limit(8),
        supabase.from("help_tickets").select("status"),
        supabase.from("webhook_events").select("id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("ai_api_keys").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const unavailable: string[] = [];
      const namedErrors: Array<[string, { message?: string } | null]> = [
        ["users", usersResult.error],
        ["premium subscriptions", premiumResult.error],
        ["resumes", resumesResult.error],
        ["blog", blogResult.error],
        ["blog schedules", schedulesResult.error],
        ["automation runs", runsResult.error],
        ["help tickets", ticketsResult.error],
        ["webhooks", webhooksResult.error],
        ["AI keys", aiKeysResult.error],
      ];
      namedErrors.forEach(([name, error]) => { if (error) unavailable.push(name); });

      const blogRows = safeRows<{ status: string | null; view_count: number | null }>(blogResult);
      const ticketRows = safeRows<{ status: string }>(ticketsResult);
      const schedules = safeRows<OverviewSchedule>(schedulesResult);

      return {
        totalUsers: safeCount(usersResult),
        premiumUsers: safeCount(premiumResult),
        totalResumes: safeCount(resumesResult),
        publishedPosts: blogResult.error ? null : blogRows.filter((post) => post.status === "published").length,
        blogViews: blogResult.error ? null : blogRows.reduce((total, post) => total + Number(post.view_count ?? 0), 0),
        activeSchedules: schedulesResult.error ? null : schedules.filter((schedule) => schedule.is_enabled).length,
        openTickets: ticketsResult.error
          ? null
          : ticketRows.filter((ticket) => !["closed", "resolved"].includes(ticket.status.toLowerCase())).length,
        failedWebhooks: safeCount(webhooksResult),
        activeAiKeys: safeCount(aiKeysResult),
        schedules,
        recentRuns: safeRows<OverviewRun>(runsResult),
        unavailable,
      };
    },
    retry: 1,
    refetchInterval: 60_000,
  });

  const data = overviewQuery.data;

  const alerts = useMemo<OperationalAlert[]>(() => {
    if (!data) return [];
    const items: OperationalAlert[] = [];
    const failingSchedules = data.schedules.filter((schedule) => schedule.consecutive_failures > 0);

    if (data.activeAiKeys === 0) {
      items.push({
        id: "no-ai-key",
        title: "No active AI key",
        description: "AI writing and resume suggestions will fail until a provider key is active.",
        tone: "critical",
        actionLabel: "Configure AI",
        actionTab: "ai",
      });
    }

    if ((data.failedWebhooks ?? 0) > 0) {
      items.push({
        id: "webhook-failures",
        title: `${data.failedWebhooks} failed payment webhook${data.failedWebhooks === 1 ? "" : "s"}`,
        description: "Review these before granting or removing subscription access manually.",
        tone: "critical",
        actionLabel: "Open payments",
        actionTab: "payments",
      });
    }

    if (failingSchedules.length > 0) {
      const paused = failingSchedules.filter((schedule) => schedule.consecutive_failures >= schedule.max_failures).length;
      items.push({
        id: "schedule-failures",
        title: `${failingSchedules.length} blog schedule${failingSchedules.length === 1 ? " needs" : "s need"} attention`,
        description: paused ? `${paused} reached the failure limit and may be paused.` : "Recent AI generation attempts failed.",
        tone: "warning",
        actionLabel: "Review automation",
        actionTab: "blog-automation",
      });
    }

    if ((data.openTickets ?? 0) > 0) {
      items.push({
        id: "open-tickets",
        title: `${data.openTickets} open support ticket${data.openTickets === 1 ? "" : "s"}`,
        description: "Users are waiting for a response from the team.",
        tone: "info",
        actionLabel: "Open help center",
        actionTab: "helpcenter",
      });
    }

    if (data.activeSchedules === 0 && data.activeAiKeys !== null) {
      items.push({
        id: "no-schedules",
        title: "Blog automation is idle",
        description: "Create a reviewed draft schedule to keep organic content moving.",
        tone: "info",
        actionLabel: "Create schedule",
        actionTab: "blog-automation",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "healthy",
        title: "Systems look healthy",
        description: "No payment, AI, content, or support issue needs immediate attention.",
        tone: "success",
      });
    }

    return items.slice(0, 5);
  }, [data]);

  if (overviewQuery.isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><Skeleton className="h-7 w-44" /><Skeleton className="h-4 w-72" /></div>
          <Skeleton className="h-9 w-9" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (overviewQuery.isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Could not load the command center</AlertTitle>
        <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span>{overviewQuery.error instanceof Error ? overviewQuery.error.message : "Please check the connection and try again."}</span>
          <Button variant="outline" size="sm" onClick={() => void overviewQuery.refetch()}>Try again</Button>
        </AlertDescription>
      </Alert>
    );
  }

  const metrics = [
    { label: "Users", value: data.totalUsers, icon: Users, tone: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", tab: "users" },
    { label: "Premium", value: data.premiumUsers, icon: CreditCard, tone: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", tab: "users" },
    { label: "Resumes", value: data.totalResumes, icon: FileText, tone: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", tab: "analytics" },
    { label: "Published posts", value: data.publishedPosts, icon: BookOpen, tone: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", tab: "blog" },
    { label: "Blog views", value: data.blogViews, icon: Eye, tone: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", tab: "analytics" },
    { label: "Active schedules", value: data.activeSchedules, icon: CalendarClock, tone: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10", tab: "blog-automation" },
  ];

  const quickActions = [
    { label: "Manage users", description: "Roles and plans", icon: Users, tab: "users" },
    { label: "Write a post", description: "Create or edit", icon: BookOpen, tab: "blog" },
    { label: "Blog automation", description: "Schedules and runs", icon: Sparkles, tab: "blog-automation" },
    { label: "AI providers", description: "Keys and usage", icon: Bot, tab: "ai" },
    { label: "Payments", description: "Gateways and events", icon: CircleDollarSign, tab: "payments" },
    { label: "Support inbox", description: "Open tickets", icon: LifeBuoy, tab: "helpcenter" },
  ];

  const nextRun = data.schedules
    .filter((schedule) => schedule.is_enabled && new Date(schedule.next_run_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.next_run_at).getTime() - new Date(b.next_run_at).getTime())[0];

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Command center</h2>
          <p className="mt-1 text-sm text-muted-foreground">The few numbers and actions that need attention now.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {nextRun && (
            <Badge variant="outline" className="hidden max-w-[260px] gap-1.5 truncate sm:flex">
              <Clock3 className="h-3.5 w-3.5" /> Next post {relativeTime(nextRun.next_run_at)}
            </Badge>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => void overviewQuery.refetch()}
            disabled={overviewQuery.isFetching}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn("h-4 w-4", overviewQuery.isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {data.unavailable.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some metrics are unavailable</AlertTitle>
          <AlertDescription>
            Could not read {data.unavailable.join(", ")}. Other dashboard data is still live.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <button key={metric.label} type="button" className="min-w-0 text-left" onClick={() => onNavigate(metric.tab)}>
            <Card className="h-full min-w-0 shadow-sm transition-colors hover:border-primary/35 hover:bg-muted/20">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("rounded-lg p-2.5", metric.bg, metric.tone)}><metric.icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-2xl font-semibold tabular-nums">{metric.value === null ? "—" : metric.value.toLocaleString()}</p>
                  <p className="truncate text-xs text-muted-foreground">{metric.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Operational attention</CardTitle>
            <CardDescription>Ordered by business impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((item) => (
              <div key={item.id} className={cn("flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center", alertClass(item.tone))}>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 shrink-0"><AlertIcon tone={item.tone} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {item.actionTab && item.actionLabel && (
                  <Button variant="ghost" size="sm" className="h-8 shrink-0 justify-start text-xs sm:justify-center" onClick={() => onNavigate(item.actionTab!)}>
                    {item.actionLabel}<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Jump straight to common work.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.tab}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="flex min-w-0 items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary"><action.icon className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{action.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{action.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Recent AI publishing</CardTitle>
            <CardDescription>Latest scheduled article runs.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => onNavigate("blog-automation")}>
            View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentRuns.length === 0 ? (
            <div className="rounded-xl border border-dashed p-7 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">No automation runs yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create a draft schedule to test the workflow safely.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => onNavigate("blog-automation")}>Set up automation</Button>
            </div>
          ) : (
            <div className="divide-y overflow-hidden rounded-xl border">
              {data.recentRuns.map((run) => (
                <div key={run.id} className="grid min-w-0 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{run.generated_title || "Article generation"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {run.error_message || `Scheduled ${formatDateTime(run.scheduled_for)}`}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("w-fit gap-1 text-[10px] capitalize", runStatusClass(run.status))}>
                    {run.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {run.status === "failed" && <AlertCircle className="h-3 w-3" />}
                    {["succeeded", "completed"].includes(run.status) && <CheckCircle2 className="h-3 w-3" />}
                    {run.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:justify-end">
                    {run.provider && <span className="capitalize">{run.provider}</span>}
                    <span>{relativeTime(run.completed_at || run.scheduled_for)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => onNavigate("ai")} className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/30">
          <Bot className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">Active AI keys</p><p className="text-sm font-semibold">{data.activeAiKeys === null ? "Unavailable" : data.activeAiKeys}</p></div>
        </button>
        <button type="button" onClick={() => onNavigate("helpcenter")} className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/30">
          <LifeBuoy className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">Open tickets</p><p className="text-sm font-semibold">{data.openTickets === null ? "Unavailable" : data.openTickets}</p></div>
        </button>
        <button type="button" onClick={() => onNavigate("payments")} className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/30">
          <Webhook className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">Failed webhooks</p><p className="text-sm font-semibold">{data.failedWebhooks === null ? "Unavailable" : data.failedWebhooks}</p></div>
        </button>
      </div>
    </div>
  );
}
