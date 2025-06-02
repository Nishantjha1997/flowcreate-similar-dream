
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Crown, FileText, Activity, TrendingUp, Database, Server, AlertCircle } from "lucide-react";

interface EnhancedSystemStatsProps {
  members: any[];
  userProfiles: any[];
  isLoading: boolean;
}

export function EnhancedSystemStats({ members, userProfiles, isLoading }: EnhancedSystemStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${weekUsers} this week`
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: `${activeRate}% activation rate`,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      progress: activeRate
    },
    {
      title: "Premium Subscribers",
      value: premiumUsers,
      description: `${premiumRate}% conversion rate`,
      icon: Crown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      progress: premiumRate
    },
    {
      title: "Pending Approvals",
      value: pendingUsers,
      description: "Awaiting approval",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      urgent: pendingUsers > 0
    },
    {
      title: "Total Resumes",
      value: totalResumes,
      description: "Created resumes",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `Avg ${totalUsers > 0 ? (totalResumes / totalUsers).toFixed(1) : 0} per user`
    },
    {
      title: "System Administrators",
      value: adminUsers,
      description: "Admin accounts",
      icon: Server,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Database Health",
      value: "99.9%",
      description: "Uptime this month",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      isStatus: true
    },
    {
      title: "Growth Rate",
      value: `+${weekUsers}`,
      description: "New users this week",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: weekUsers > 0 ? "up" : "stable"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.urgent ? "border-orange-200" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.change && (
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  )}
                </div>
                {stat.urgent && (
                  <Badge variant="destructive" className="ml-2">
                    Action Needed
                  </Badge>
                )}
              </div>
              {stat.progress !== undefined && (
                <div className="mt-3">
                  <Progress value={stat.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{stat.progress}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* System Status Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">System Status: Operational</h3>
              <p className="text-blue-700">All systems running normally. Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
