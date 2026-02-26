import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { 
  Users, FileText, Briefcase, TrendingUp, CreditCard, Activity 
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalResumes: number;
  totalOrganizations: number;
  totalJobs: number;
  totalApplications: number;
  totalPayments: number;
  recentSignups: number;
  premiumUsers: number;
  publishedJobs: number;
  newApplications: number;
}

interface AdminAnalyticsProps {
  isAdmin: boolean;
}

export const AdminAnalytics = ({ isAdmin }: AdminAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAnalytics();
  }, [isAdmin]);

  const loadAnalytics = async () => {
    try {
      const [usersRes, resumesRes, orgsRes, jobsRes, appsRes, paymentsRes, subsRes, eventsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact', head: false }).limit(1),
        supabase.from('resumes').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id, status', { count: 'exact', head: false }),
        supabase.from('job_applications').select('id, status', { count: 'exact', head: false }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id, is_premium').eq('is_premium', true),
        supabase.from('analytics_events').select('id, event_name, created_at, page_url').order('created_at', { ascending: false }).limit(20),
      ]);

      // Count recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const publishedJobs = (jobsRes.data || []).filter((j: any) => j.status === 'published').length;
      const newApps = (appsRes.data || []).filter((a: any) => a.status === 'new').length;

      setData({
        totalUsers: usersRes.count || 0,
        totalResumes: resumesRes.count || 0,
        totalOrganizations: orgsRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalApplications: appsRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        recentSignups: 0,
        premiumUsers: subsRes.data?.length || 0,
        publishedJobs,
        newApplications: newApps,
      });

      setRecentEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Premium Users", value: data.premiumUsers, icon: CreditCard, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
    { label: "Total Resumes", value: data.totalResumes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { label: "Organizations", value: data.totalOrganizations, icon: Briefcase, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "Published Jobs", value: data.publishedJobs, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
    { label: "Total Applications", value: data.totalApplications, icon: Activity, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Platform Analytics</h3>
        <p className="text-sm text-muted-foreground">Overview of platform usage and growth metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <GlassCard key={metric.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resume Builder Usage</CardTitle>
            <CardDescription>Resume creation statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total resumes created</span>
                <span className="font-semibold">{data.totalResumes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg per user</span>
                <span className="font-semibold">{data.totalUsers > 0 ? (data.totalResumes / data.totalUsers).toFixed(1) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Premium conversion</span>
                <span className="font-semibold">{data.totalUsers > 0 ? ((data.premiumUsers / data.totalUsers) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ATS Platform Usage</CardTitle>
            <CardDescription>Hiring platform statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Organizations</span>
                <span className="font-semibold">{data.totalOrganizations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active jobs</span>
                <span className="font-semibold">{data.publishedJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total applications</span>
                <span className="font-semibold">{data.totalApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">New applications</span>
                <Badge variant="secondary">{data.newApplications}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Analytics Events</CardTitle>
            <CardDescription>Latest tracked events on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{event.event_name}</p>
                    {event.page_url && <p className="text-xs text-muted-foreground">{event.page_url}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.created_at ? new Date(event.created_at).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
