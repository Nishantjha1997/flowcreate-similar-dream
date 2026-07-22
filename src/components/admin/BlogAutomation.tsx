import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionErrorMessage } from "@/utils/edgeFunctionError";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type Frequency = "daily" | "weekdays" | "weekly" | "biweekly" | "monthly";
type PublishMode = "draft" | "published";

type BlogSchedule = Omit<Tables<"blog_automation_schedules">, "frequency" | "publish_mode"> & {
  frequency: Frequency;
  publish_mode: PublishMode;
};

type AutomationRun = Tables<"blog_automation_runs">;

interface ScheduleForm {
  name: string;
  is_enabled: boolean;
  frequency: Frequency;
  publish_mode: PublishMode;
  category: string;
  topic_prompt: string;
  keywords: string;
  time_zone: string;
  next_run_at: string;
  max_failures: number;
}

const FREQUENCIES: Array<{ value: Frequency; label: string; description: string }> = [
  { value: "daily", label: "Daily", description: "Every day" },
  { value: "weekdays", label: "Weekdays", description: "Monday to Friday" },
  { value: "weekly", label: "Weekly", description: "Every 7 days" },
  { value: "biweekly", label: "Every 2 weeks", description: "Every 14 days" },
  { value: "monthly", label: "Monthly", description: "Same date each month" },
];

const CATEGORIES = ["Resume Tips", "Career Advice", "Job Search", "Interview Tips", "Industry Insights"];

const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const TIME_ZONES = Array.from(new Set([
  detectedTimeZone,
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Australia/Sydney",
]));

function nextMorning(): string {
  const date = new Date();
  const todayAtNine = new Date(date);
  todayAtNine.setHours(9, 0, 0, 0);
  if (todayAtNine <= date) todayAtNine.setDate(todayAtNine.getDate() + 1);
  return toLocalDateTimeInput(todayAtNine.toISOString());
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function zonedDateTimeInput(value: string, timeZone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  } catch {
    return toLocalDateTimeInput(value);
  }
}

function zonedDateTimeToIso(value: string, timeZone: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  let guess = target;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    for (let pass = 0; pass < 3; pass += 1) {
      const parts = formatter.formatToParts(new Date(guess));
      const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
      const displayed = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
      guess += target - displayed;
    }
    return new Date(guess).toISOString();
  } catch {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
  }
}

function createEmptyForm(): ScheduleForm {
  return {
    name: "",
    is_enabled: true,
    frequency: "weekly",
    publish_mode: "draft",
    category: "Resume Tips",
    topic_prompt: "",
    keywords: "",
    time_zone: detectedTimeZone,
    next_run_at: nextMorning(),
    max_failures: 3,
  };
}

function formatDateTime(value: string | null, timeZone?: string): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
}

function relativeTime(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function frequencyLabel(value: Frequency): string {
  return FREQUENCIES.find((item) => item.value === value)?.label ?? value;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function statusStyle(status: string): string {
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

function RunStatusIcon({ status }: { status: string }) {
  if (status === "failed") return <XCircle className="h-3.5 w-3.5" />;
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  if (status === "queued") return <Clock3 className="h-3.5 w-3.5" />;
  return <CheckCircle2 className="h-3.5 w-3.5" />;
}

export function BlogAutomation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BlogSchedule | null>(null);
  const [form, setForm] = useState<ScheduleForm>(createEmptyForm);

  const schedulesQuery = useQuery({
    queryKey: ["admin-blog-automation-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_automation_schedules")
        .select("id,name,is_enabled,frequency,publish_mode,category,topic_prompt,keywords,author,time_zone,next_run_at,last_run_at,last_success_at,consecutive_failures,max_failures,last_error,created_by,created_at,updated_at")
        .order("next_run_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as BlogSchedule[];
    },
    retry: 1,
    refetchInterval: 60_000,
  });

  const runsQuery = useQuery({
    queryKey: ["admin-blog-automation-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_automation_runs")
        .select("id,schedule_id,status,trigger_source,provider,generated_title,error_message,blog_post_id,scheduled_for,completed_at,created_at")
        .order("scheduled_for", { ascending: false })
        .limit(25);
      if (error) throw new Error(error.message);
      return (data ?? []) as AutomationRun[];
    },
    retry: 1,
    refetchInterval: 30_000,
  });

  const invalidateAutomation = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-blog-automation-schedules"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-blog-automation-runs"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: Omit<ScheduleForm, "keywords" | "next_run_at"> & { keywords: string[]; next_run_at: string } }) => {
      const query = id
        ? supabase.from("blog_automation_schedules").update(payload).eq("id", id)
        : supabase.from("blog_automation_schedules").insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await invalidateAutomation();
      setDialogOpen(false);
      setEditingSchedule(null);
      toast({ title: editingSchedule ? "Schedule updated" : "Schedule created" });
    },
    onError: (error) => toast({
      title: "Could not save schedule",
      description: errorMessage(error, "Please try again."),
      variant: "destructive",
    }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (schedule: BlogSchedule) => {
      const enabling = !schedule.is_enabled;
      const { error } = await supabase
        .from("blog_automation_schedules")
        .update(enabling
          ? { is_enabled: true, consecutive_failures: 0, last_error: null }
          : { is_enabled: false })
        .eq("id", schedule.id);
      if (error) throw new Error(error.message);
      return enabling;
    },
    onSuccess: async (enabled) => {
      await invalidateAutomation();
      toast({ title: enabled ? "Schedule resumed" : "Schedule paused" });
    },
    onError: (error) => toast({
      title: "Could not change schedule",
      description: errorMessage(error, "Please try again."),
      variant: "destructive",
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_automation_schedules").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await invalidateAutomation();
      toast({ title: "Schedule deleted" });
    },
    onError: (error) => toast({
      title: "Could not delete schedule",
      description: errorMessage(error, "Please try again."),
      variant: "destructive",
    }),
  });

  const runMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data, error } = await supabase.functions.invoke("blog-scheduler", {
        body: { action: "run_now", scheduleId },
      });
      if (error) throw new Error(await getEdgeFunctionErrorMessage(error, "The scheduler could not start."));
      if (data?.error) throw new Error(String(data.error));
      return data;
    },
    onSuccess: async () => {
      await invalidateAutomation();
      toast({
        title: "Article generated",
        description: "The post and its run log are now available.",
      });
    },
    onError: (error) => toast({
      title: "Run failed to start",
      description: errorMessage(error, "Check the scheduler function and AI key."),
      variant: "destructive",
    }),
  });

  const schedules = schedulesQuery.data ?? [];
  const runs = runsQuery.data ?? [];
  const activeSchedules = schedules.filter((schedule) => schedule.is_enabled);
  const nextSchedule = [...activeSchedules]
    .sort((a, b) => new Date(a.next_run_at).getTime() - new Date(b.next_run_at).getTime())[0] ?? null;
  const recentFailures = runs.filter((run) => run.status === "failed").length;

  const openCreate = () => {
    setEditingSchedule(null);
    setForm(createEmptyForm());
    setDialogOpen(true);
  };

  const openEdit = (schedule: BlogSchedule) => {
    setEditingSchedule(schedule);
    setForm({
      name: schedule.name,
      is_enabled: schedule.is_enabled,
      frequency: schedule.frequency,
      publish_mode: schedule.publish_mode,
      category: schedule.category,
      topic_prompt: schedule.topic_prompt,
      keywords: (schedule.keywords ?? []).join(", "),
      time_zone: schedule.time_zone || detectedTimeZone,
      next_run_at: zonedDateTimeInput(schedule.next_run_at, schedule.time_zone || detectedTimeZone),
      max_failures: schedule.max_failures,
    });
    setDialogOpen(true);
  };

  const submitSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const topicPrompt = form.topic_prompt.trim();
    const nextRunIso = zonedDateTimeToIso(form.next_run_at, form.time_zone);

    if (!name || !topicPrompt) {
      toast({ title: "Name and topic focus are required", variant: "destructive" });
      return;
    }
    if (!nextRunIso) {
      toast({ title: "Choose a valid first run time", variant: "destructive" });
      return;
    }
    if (form.is_enabled && new Date(nextRunIso).getTime() < Date.now() - 60_000) {
      toast({ title: "First run must be in the future", description: "Use Run now for an immediate article.", variant: "destructive" });
      return;
    }

    const keywords = Array.from(new Set(
      form.keywords.split(",").map((keyword) => keyword.trim().slice(0, 60)).filter(Boolean),
    )).slice(0, 20);

    saveMutation.mutate({
      id: editingSchedule?.id,
      payload: {
        ...form,
        name,
        topic_prompt: topicPrompt,
        keywords,
        next_run_at: nextRunIso,
        max_failures: Math.min(10, Math.max(1, Number(form.max_failures) || 3)),
      },
    });
  };

  const refreshAll = () => {
    void Promise.all([schedulesQuery.refetch(), runsQuery.refetch()]);
  };

  if (schedulesQuery.isLoading && runsQuery.isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2"><Skeleton className="h-7 w-52" /><Skeleton className="h-4 w-72" /></div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const backendError = schedulesQuery.error || runsQuery.error;
  if (schedulesQuery.isError && runsQuery.isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Blog automation is not ready</AlertTitle>
          <AlertDescription className="mt-1">
            {errorMessage(backendError, "Install the blog automation migration, then refresh this page.")}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refreshAll} disabled={schedulesQuery.isFetching || runsQuery.isFetching}>
          <RefreshCw className={cn("mr-2 h-4 w-4", (schedulesQuery.isFetching || runsQuery.isFetching) && "animate-spin")} />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">AI blog automation</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Generate SEO articles on a safe schedule. Keep them as drafts for review or publish automatically.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={schedulesQuery.isFetching || runsQuery.isFetching}
            aria-label="Refresh automation data"
          >
            <RefreshCw className={cn("h-4 w-4", (schedulesQuery.isFetching || runsQuery.isFetching) && "animate-spin")} />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New schedule
          </Button>
        </div>
      </div>

      {backendError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some automation data is unavailable</AlertTitle>
          <AlertDescription>{errorMessage(backendError, "Refresh to try again.")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><CalendarClock className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="text-xl font-semibold tabular-nums">{schedules.length}</p><p className="truncate text-xs text-muted-foreground">Total schedules</p></div>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400"><Play className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="text-xl font-semibold tabular-nums">{activeSchedules.length}</p><p className="truncate text-xs text-muted-foreground">Active</p></div>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400"><Clock3 className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{nextSchedule ? relativeTime(nextSchedule.next_run_at) : "Not scheduled"}</p><p className="truncate text-xs text-muted-foreground">Next run</p></div>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("rounded-lg p-2", recentFailures ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground")}><AlertCircle className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="text-xl font-semibold tabular-nums">{recentFailures}</p><p className="truncate text-xs text-muted-foreground">Recent failures</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Publishing schedules</CardTitle>
          <CardDescription>Times are shown in each schedule&apos;s selected time zone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedulesQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-lg" />)
          ) : schedules.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">No schedules yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create one to generate your first automated article.</p>
              <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create schedule</Button>
            </div>
          ) : (
            schedules.map((schedule) => {
              const isRunning = runMutation.isPending && runMutation.variables === schedule.id;
              const isToggling = toggleMutation.isPending && toggleMutation.variables?.id === schedule.id;
              return (
                <div key={schedule.id} className="min-w-0 rounded-xl border bg-background/60 p-4">
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="min-w-0 truncate text-sm font-semibold">{schedule.name}</h3>
                        <Badge variant={schedule.is_enabled ? "default" : "secondary"} className="text-[10px]">
                          {schedule.is_enabled ? "Active" : "Paused"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{frequencyLabel(schedule.frequency)}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {schedule.publish_mode === "published" ? "Auto-publish" : "Draft review"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{schedule.topic_prompt}</p>
                      <div className="mt-3 grid gap-x-5 gap-y-1.5 text-xs sm:grid-cols-2 xl:grid-cols-4">
                        <span className="min-w-0 truncate text-muted-foreground"><strong className="font-medium text-foreground">Category:</strong> {schedule.category}</span>
                        <span className="min-w-0 truncate text-muted-foreground"><strong className="font-medium text-foreground">Next:</strong> {formatDateTime(schedule.next_run_at, schedule.time_zone)}</span>
                        <span className="min-w-0 truncate text-muted-foreground"><strong className="font-medium text-foreground">Last success:</strong> {relativeTime(schedule.last_success_at)}</span>
                        <span className={cn("min-w-0 truncate", schedule.consecutive_failures ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                          <strong className="font-medium text-foreground">Failures:</strong> {schedule.consecutive_failures}/{schedule.max_failures}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                      <div className="mr-1 flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
                        <Switch
                          checked={schedule.is_enabled}
                          onCheckedChange={() => toggleMutation.mutate(schedule)}
                          disabled={isToggling}
                          aria-label={schedule.is_enabled ? `Pause ${schedule.name}` : `Resume ${schedule.name}`}
                        />
                        <span className="text-xs text-muted-foreground">{schedule.is_enabled ? "On" : "Off"}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => runMutation.mutate(schedule.id)} disabled={runMutation.isPending}>
                        {isRunning ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5" />}
                        Run now
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(schedule)} aria-label={`Edit ${schedule.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" aria-label={`Delete ${schedule.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this schedule?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{schedule.name}” will stop permanently. Existing posts and run history stay for audit. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(schedule.id)}
                            >
                              Delete schedule
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent runs</CardTitle>
          <CardDescription>The latest generated, queued, and failed articles.</CardDescription>
        </CardHeader>
        <CardContent>
          {runsQuery.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 rounded-lg" />)}</div>
          ) : runs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">No automation runs yet.</div>
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {runs.map((run) => (
                  <div key={run.id} className="min-w-0 rounded-lg border p-3">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{run.generated_title || "Article generation"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(run.scheduled_for)}</p>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 gap-1 text-[10px] capitalize", statusStyle(run.status))}>
                        <RunStatusIcon status={run.status} /> {run.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {run.provider && <Badge variant="secondary" className="text-[10px] capitalize">{run.provider}</Badge>}
                      <Badge variant="outline" className="text-[10px] capitalize">{run.trigger_source}</Badge>
                      {run.blog_post_id && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><FileCheck2 className="h-3.5 w-3.5" /> Post saved</span>}
                    </div>
                    {run.error_message && <p className="mt-2 line-clamp-2 text-xs text-red-600 dark:text-red-400" title={run.error_message}>{run.error_message}</p>}
                  </div>
                ))}
              </div>

              <div className="hidden max-w-full overflow-x-auto md:block">
                <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="w-[35%] px-3 py-2 font-medium">Article</th>
                      <th className="w-[15%] px-3 py-2 font-medium">Status</th>
                      <th className="w-[14%] px-3 py-2 font-medium">Provider</th>
                      <th className="w-[22%] px-3 py-2 font-medium">Scheduled</th>
                      <th className="w-[14%] px-3 py-2 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr key={run.id} className="border-b last:border-0">
                        <td className="px-3 py-3 align-top">
                          <p className="truncate font-medium">{run.generated_title || "Article generation"}</p>
                          {run.error_message && <p className="mt-1 truncate text-xs text-red-600 dark:text-red-400" title={run.error_message}>{run.error_message}</p>}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <Badge variant="outline" className={cn("gap-1 text-[10px] capitalize", statusStyle(run.status))}>
                            <RunStatusIcon status={run.status} /> {run.status}
                          </Badge>
                        </td>
                        <td className="truncate px-3 py-3 align-top text-xs capitalize text-muted-foreground">{run.provider || "Auto"} · {run.trigger_source}</td>
                        <td className="px-3 py-3 align-top text-xs text-muted-foreground">{formatDateTime(run.scheduled_for)}</td>
                        <td className="px-3 py-3 align-top text-xs">
                          {run.blog_post_id ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><FileCheck2 className="h-3.5 w-3.5" /> Saved</span> : run.completed_at ? relativeTime(run.completed_at) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingSchedule(null); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit schedule" : "Create a publishing schedule"}</DialogTitle>
            <DialogDescription>
              Choose a topic lane and cadence. Draft review is the safest mode for a new schedule.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={submitSchedule}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="automation-name">Schedule name</Label>
                <Input
                  id="automation-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Weekly resume advice"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(value: Frequency) => setForm((current) => ({ ...current, frequency: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((frequency) => (
                      <SelectItem key={frequency.value} value={frequency.value}>
                        {frequency.label} · {frequency.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Publishing mode</Label>
                <Select value={form.publish_mode} onValueChange={(value: PublishMode) => setForm((current) => ({ ...current, publish_mode: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as draft for review</SelectItem>
                    <SelectItem value="published">Publish automatically</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time zone</Label>
                <Select value={form.time_zone} onValueChange={(value) => setForm((current) => ({ ...current, time_zone: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_ZONES.map((timeZone) => <SelectItem key={timeZone} value={timeZone}>{timeZone}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="automation-next-run">First run</Label>
                <Input
                  id="automation-next-run"
                  type="datetime-local"
                  value={form.next_run_at}
                  onChange={(event) => setForm((current) => ({ ...current, next_run_at: event.target.value }))}
                />
                <p className="text-[11px] text-muted-foreground">This date and time uses the selected time zone.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="automation-max-failures">Pause after failures</Label>
                <Input
                  id="automation-max-failures"
                  type="number"
                  min={1}
                  max={10}
                  value={form.max_failures}
                  onChange={(event) => setForm((current) => ({ ...current, max_failures: Number(event.target.value) }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="automation-topic">Topic focus</Label>
                <Textarea
                  id="automation-topic"
                  value={form.topic_prompt}
                  onChange={(event) => setForm((current) => ({ ...current, topic_prompt: event.target.value }))}
                  placeholder="Practical, evidence-based resume advice for early-career software engineers. Avoid topics already covered."
                  rows={4}
                  maxLength={1500}
                />
                <p className="text-[11px] text-muted-foreground">Give the AI a narrow audience, intent, and tone. It will choose a fresh title each run.</p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="automation-keywords">Priority keywords</Label>
                <Input
                  id="automation-keywords"
                  value={form.keywords}
                  onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))}
                  placeholder="software engineer resume, ATS resume, entry-level CV"
                />
                <p className="text-[11px] text-muted-foreground">Separate keywords with commas.</p>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3 sm:col-span-2">
                <div className="pr-4">
                  <p className="text-sm font-medium">Enable after saving</p>
                  <p className="text-xs text-muted-foreground">Turn this off to finish setup without allowing a run.</p>
                </div>
                <Switch checked={form.is_enabled} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_enabled: checked }))} />
              </div>
            </div>

            {form.publish_mode === "published" && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Automatic publishing is enabled</AlertTitle>
                <AlertDescription>New articles can go live without review. Start with draft mode until the output is consistent.</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSchedule ? "Save changes" : "Create schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
