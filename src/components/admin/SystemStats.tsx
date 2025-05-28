
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, FileText, Activity } from "lucide-react";

interface SystemStatsProps {
  members: any[];
  isLoading: boolean;
}

export function SystemStats({ members, isLoading }: SystemStatsProps) {
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

  const totalUsers = members.length;
  const premiumUsers = members.filter(m => m.is_premium).length;
  const totalResumes = members.reduce((sum, m) => sum + (m.resume_count || 0), 0);
  const adminUsers = members.filter(m => m.roles?.includes('admin')).length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Premium Users",
      value: premiumUsers,
      description: `${totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0}% of users`,
      icon: Crown,
      color: "text-yellow-600"
    },
    {
      title: "Total Resumes",
      value: totalResumes,
      description: "Created resumes",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Administrators",
      value: adminUsers,
      description: "Admin users",
      icon: Activity,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
