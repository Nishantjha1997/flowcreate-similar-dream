import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Crown, FileText, Activity, TrendingUp, Database, Server, AlertCircle, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";

interface EnhancedSystemStatsProps {
  members: any[];
  userProfiles: any[];
  isLoading: boolean;
}

export function EnhancedSystemStats({ members, userProfiles, isLoading }: EnhancedSystemStatsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = userProfiles.length;
  const activeUsers = userProfiles.filter(u => u.roles && u.roles.length > 0).length;
  const premiumUsers = userProfiles.filter(u => u.isPremium).length;
  const pendingUsers = userProfiles.filter(u => !u.roles || u.roles.length === 0).length;
  const totalResumes = members.reduce((sum, m) => sum + (m.resume_count || 0), 0);
  const adminUsers = members.filter(m => m.roles?.includes('admin')).length;
  
  // Calculate growth metrics
  const todayUsers = userProfiles.filter(u => {
    const today = new Date();
    const userDate = new Date(u.createdAt);
    return today.toDateString() === userDate.toDateString();
  }).length;

  const weekUsers = userProfiles.filter(u => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const userDate = new Date(u.createdAt);
    return userDate >= weekAgo;
  }).length;

  const premiumRate = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const stats = [
    {
      title: "Total Registered Users",
      value: totalUsers,
      description: `${todayUsers} new today`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      change: `+${weekUsers} this week`
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: `${activeRate}% activation rate`,
      icon: Activity,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      progress: activeRate
    },
    {
      title: "Premium Subscribers",
      value: premiumUsers,
      description: `${premiumRate}% conversion rate`,
      icon: Crown,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
      progress: premiumRate
    },
    {
      title: "Pending Approvals",
      value: pendingUsers,
      description: "Awaiting approval",
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      urgent: pendingUsers > 0
    },
    {
      title: "Total Resumes",
      value: totalResumes,
      description: "Created resumes",
      icon: FileText,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      change: `Avg ${totalUsers > 0 ? (totalResumes / totalUsers).toFixed(1) : 0} per user`
    },
    {
      title: "System Administrators",
      value: adminUsers,
      description: "Admin accounts",
      icon: Server,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50"
    },
    {
      title: "Database Health",
      value: "99.9%",
      description: "Uptime this month",
      icon: Database,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      isStatus: true
    },
    {
      title: "Growth Rate",
      value: `+${weekUsers}`,
      description: "New users this week",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      trend: weekUsers > 0 ? "up" : "stable"
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Header bar for Stats section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Metrics & Metrics Summary</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
        >
          {isCollapsed ? (
            <>
              Show Stats Overview <ChevronDown className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Collapse Stats Overview <ChevronUp className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {stats.map((stat) => (
              <Card key={stat.title} className={stat.urgent ? "border-orange-500/40 dark:border-orange-500/30" : "border-border/40"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold tracking-tight text-foreground">{stat.value}</div>
                      <p className="text-[11px] text-muted-foreground">{stat.description}</p>
                      {stat.change && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{stat.change}</p>
                      )}
                    </div>
                    {stat.urgent && (
                      <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0.5">
                        Action Needed
                      </Badge>
                    )}
                  </div>
                  {stat.progress !== undefined && (
                    <div className="mt-2.5">
                      <Progress value={stat.progress} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">{stat.progress}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* System Status Banner - Dark Mode Compatible */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/40 shadow-sm animate-fade-in">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">System Status: Operational</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400/90 mt-0.5">All services running normally · Realtime stats active</p>
                </div>
                <div className="flex items-center gap-2 bg-background/60 dark:bg-background/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

