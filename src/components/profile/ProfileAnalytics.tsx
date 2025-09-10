import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  Download, 
  Share2, 
  Target,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfileAnalyticsProps {
  profile: UserProfile | null;
  completeness: number;
  resumeCount?: number;
}

interface AnalyticsData {
  profileViews: number;
  resumeDownloads: number;
  profileShares: number;
  searchAppearances: number;
  engagementRate: number;
  strengthAreas: string[];
  improvementAreas: string[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  profile,
  completeness,
  resumeCount = 0
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    profileViews: 0,
    resumeDownloads: 0,
    profileShares: 0,
    searchAppearances: 0,
    engagementRate: 0,
    strengthAreas: [],
    improvementAreas: []
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Simulate analytics data generation based on profile
    generateAnalytics();
  }, [profile, completeness, timeRange]);

  const generateAnalytics = () => {
    if (!profile) return;

    // Simulate realistic analytics based on profile completeness
    const baseMultiplier = completeness / 100;
    const experienceMultiplier = (profile.work_experience?.length || 0) * 0.2 + 1;
    const skillsMultiplier = ((profile.technical_skills?.length || 0) + (profile.soft_skills?.length || 0)) * 0.1 + 1;

    const views = Math.floor((50 + Math.random() * 100) * baseMultiplier * experienceMultiplier);
    const downloads = Math.floor(views * (0.1 + Math.random() * 0.15));
    const shares = Math.floor(views * (0.05 + Math.random() * 0.1));
    const searches = Math.floor(views * (0.3 + Math.random() * 0.4));

    setAnalytics({
      profileViews: views,
      resumeDownloads: downloads,
      profileShares: shares,
      searchAppearances: searches,
      engagementRate: Math.round((downloads + shares) / views * 100 * 100) / 100,
      strengthAreas: getStrengthAreas(),
      improvementAreas: getImprovementAreas()
    });
  };

  const getStrengthAreas = (): string[] => {
    const areas: string[] = [];
    if (!profile) return areas;

    if (completeness >= 80) areas.push('Profile Completeness');
    if ((profile.work_experience?.length || 0) >= 3) areas.push('Work Experience');
    if ((profile.technical_skills?.length || 0) >= 5) areas.push('Technical Skills');
    if (profile.professional_summary && profile.professional_summary.length >= 100) areas.push('Professional Summary');
    if ((profile.certifications?.length || 0) > 0) areas.push('Certifications');
    if ((profile.projects?.length || 0) >= 2) areas.push('Projects');

    return areas.slice(0, 4);
  };

  const getImprovementAreas = (): string[] => {
    const areas: string[] = [];
    if (!profile) return areas;

    if (completeness < 60) areas.push('Profile Completeness');
    if ((profile.work_experience?.length || 0) < 2) areas.push('Work Experience');
    if ((profile.technical_skills?.length || 0) < 3) areas.push('Technical Skills');
    if (!profile.professional_summary || profile.professional_summary.length < 50) areas.push('Professional Summary');
    if ((profile.education?.length || 0) === 0) areas.push('Education');
    if (!profile.linkedin_url) areas.push('Professional Links');

    return areas.slice(0, 3);
  };

  const getEngagementData = () => [
    { name: 'Profile Views', value: analytics.profileViews, color: '#8884d8' },
    { name: 'Resume Downloads', value: analytics.resumeDownloads, color: '#82ca9d' },
    { name: 'Profile Shares', value: analytics.profileShares, color: '#ffc658' },
    { name: 'Search Appearances', value: analytics.searchAppearances, color: '#ff7300' }
  ];

  const getTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(analytics.profileViews / days + Math.random() * 10),
        downloads: Math.floor(analytics.resumeDownloads / days + Math.random() * 3),
        shares: Math.floor(analytics.profileShares / days + Math.random() * 2)
      });
    }
    
    return data;
  };

  const getMarketInsights = () => {
    const industry = profile?.industry || 'Technology';
    const experienceLevel = profile?.experience_level || 'mid';
    
    return {
      industryRanking: Math.floor(Math.random() * 30) + 70, // 70-100%
      experienceRanking: Math.floor(Math.random() * 25) + 75, // 75-100%
      skillsRelevance: Math.floor(completeness * 0.8 + Math.random() * 20),
      marketDemand: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    };
  };

  const marketInsights = getMarketInsights();
  const engagementData = getEngagementData();
  const timeSeriesData = getTimeSeriesData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Profile Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Views</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{analytics.profileViews}</div>
                <div className="text-xs text-blue-600">Last {timeRange}</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Downloads</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{analytics.resumeDownloads}</div>
                <div className="text-xs text-green-600">Resume PDFs</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Shares</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">{analytics.profileShares}</div>
                <div className="text-xs text-purple-600">Profile links</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Searches</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">{analytics.searchAppearances}</div>
                <div className="text-xs text-orange-600">Appearances</div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Engagement Rate</span>
                <span className="text-sm text-muted-foreground">{analytics.engagementRate}%</span>
              </div>
              <Progress value={analytics.engagementRate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {analytics.engagementRate >= 15 ? 'Excellent engagement' :
                 analytics.engagementRate >= 10 ? 'Good engagement' :
                 analytics.engagementRate >= 5 ? 'Fair engagement' : 'Needs improvement'}
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Strength Areas
                </h4>
                <div className="space-y-1">
                  {analytics.strengthAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-orange-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Improvement Areas
                </h4>
                <div className="space-y-1">
                  {analytics.improvementAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="border-orange-300 text-orange-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((range) => (
                <Badge
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setTimeRange(range as any)}
                >
                  {range}
                </Badge>
              ))}
            </div>

            {/* Engagement Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="downloads" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement Breakdown */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Profile Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completeness Score</span>
                    <Badge variant={completeness >= 80 ? 'default' : 'secondary'}>
                      {completeness}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resume Count</span>
                    <Badge variant="outline">{resumeCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Trends */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Activity Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">View Trend</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ↗ +{Math.floor(Math.random() * 20) + 5}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Download Rate</span>
                    <Badge variant="outline">
                      {Math.round(analytics.resumeDownloads / analytics.profileViews * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Peak Activity</span>
                    <span className="text-xs text-muted-foreground">2-4 PM</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Position */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Market Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Ranking</span>
                      <Badge variant="secondary">{marketInsights.industryRanking}%</Badge>
                    </div>
                    <Progress value={marketInsights.industryRanking} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Experience Level</span>
                      <Badge variant="outline">{marketInsights.experienceRanking}%</Badge>
                    </div>
                    <Progress value={marketInsights.experienceRanking} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Skills Relevance</span>
                      <Badge variant="secondary">{marketInsights.skillsRelevance}%</Badge>
                    </div>
                    <Progress value={marketInsights.skillsRelevance} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Market Insights */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Demand</span>
                    <Badge 
                      variant={marketInsights.marketDemand === 'High' ? 'default' : 
                              marketInsights.marketDemand === 'Medium' ? 'secondary' : 'outline'}
                    >
                      {marketInsights.marketDemand}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Industry</span>
                    <span className="text-xs text-muted-foreground">{profile?.industry || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competition Level</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Potential</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">High</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};