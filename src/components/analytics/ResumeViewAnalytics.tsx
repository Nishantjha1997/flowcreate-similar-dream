import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsEvent {
  created_at: string;
  event_properties: Record<string, any> | null;
  page_url: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * Aggregates resume_view analytics for the current user.
 * Shows views over time, referrers, device types, and browsers.
 */
export function ResumeViewAnalytics({ isNeoBrutalism = false }: { isNeoBrutalism?: boolean }) {
  const { user } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['resumeViewAnalytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at, event_properties, page_url')
        .eq('user_id', user.id)
        .eq('event_name', 'resume_view')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as AnalyticsEvent[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const metrics = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        totalViews: 0,
        viewsByDay: [],
        referrers: [],
        devices: [],
        browsers: [],
      };
    }

    const totalViews = events.length;

    // Group by day for line chart
    const dayMap = new Map<string, number>();
    events.forEach((e) => {
      const day = new Date(e.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    const viewsByDay = Array.from(dayMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days with data

    // Group by referrer
    const referrerMap = new Map<string, number>();
    events.forEach((e) => {
      const props = e.event_properties || {};
      const ref = (props.referrer as string) || 'Direct / Unknown';
      const host = extractHost(ref);
      referrerMap.set(host, (referrerMap.get(host) || 0) + 1);
    });
    const referrers = Array.from(referrerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Group by device type
    const deviceMap = new Map<string, number>();
    events.forEach((e) => {
      const props = e.event_properties || {};
      const device = (props.device_type as string) || 'unknown';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });
    const devices = Array.from(deviceMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Group by browser
    const browserMap = new Map<string, number>();
    events.forEach((e) => {
      const props = e.event_properties || {};
      const browser = (props.browser as string) || 'other';
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });
    const browsers = Array.from(browserMap.entries())
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return { totalViews, viewsByDay, referrers, devices, browsers };
  }, [events]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
            <Eye className="w-5 h-5" />
            Resume Views
          </CardTitle>
          <CardDescription>Track how many times your shared resumes have been viewed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No views yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Share your resume to start tracking views. View analytics will appear here once someone visits your shared link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={isNeoBrutalism ? 'border-3 border-foreground' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isNeoBrutalism ? 'bg-primary border-2 border-foreground' : 'bg-primary/10'}`}>
                <Eye className={`h-5 w-5 ${isNeoBrutalism ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalViews}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isNeoBrutalism ? 'border-3 border-foreground' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isNeoBrutalism ? 'bg-green-500 border-2 border-foreground' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <Users className={`h-5 w-5 ${isNeoBrutalism ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.referrers.length}</p>
                <p className="text-xs text-muted-foreground">Referrers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isNeoBrutalism ? 'border-3 border-foreground' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isNeoBrutalism ? 'bg-blue-500 border-2 border-foreground' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <Globe className={`h-5 w-5 ${isNeoBrutalism ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.devices.length}</p>
                <p className="text-xs text-muted-foreground">Device Types</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isNeoBrutalism ? 'border-3 border-foreground' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isNeoBrutalism ? 'bg-purple-500 border-2 border-foreground' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                <TrendingUp className={`h-5 w-5 ${isNeoBrutalism ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics.viewsByDay.length > 1
                    ? Math.round(metrics.totalViews / Math.max(1, metrics.viewsByDay.length))
                    : metrics.totalViews}
                </p>
                <p className="text-xs text-muted-foreground">Avg/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
              <TrendingUp className="h-4 w-4" />
              Views Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
              <Globe className="h-4 w-4" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.referrers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No referrer data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics.referrers}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {metrics.referrers.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {metrics.referrers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {metrics.referrers.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
              <Monitor className="h-4 w-4" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.devices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No device data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.devices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {metrics.devices.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
          <CardHeader>
            <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
              <Globe className="h-4 w-4" />
              Browser Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.browsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No browser data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics.browsers}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {metrics.browsers.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Extracts hostname from a URL string for grouping referrers.
 */
function extractHost(ref: string): string {
  if (!ref || ref === 'Direct / Unknown') return 'Direct / Unknown';
  try {
    const url = new URL(ref.startsWith('http') ? ref : `https://${ref}`);
    const host = url.hostname.replace(/^www\./, '');
    // Group known platforms
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('google.com')) return 'Google';
    if (host.includes('facebook.com')) return 'Facebook';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('github.com')) return 'GitHub';
    return host;
  } catch {
    return ref.substring(0, 30);
  }
}
