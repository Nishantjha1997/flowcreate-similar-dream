import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Star,
  Users,
  Award,
  BookOpen,
  Briefcase,
  Code
} from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfileInsightsProps {
  profile: UserProfile | null;
  completeness: number;
}

interface Insight {
  type: 'strength' | 'improvement' | 'opportunity' | 'warning';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
}

export const ProfileInsights: React.FC<ProfileInsightsProps> = ({ profile, completeness }) => {
  
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (!profile) return insights;

    // Profile completeness insights
    if (completeness < 30) {
      insights.push({
        type: 'warning',
        title: 'Profile Incomplete',
        description: 'Your profile is less than 30% complete. Add more sections to improve your resume quality.',
        icon: <AlertTriangle className="w-4 h-4" />,
        priority: 'high',
        actionable: true
      });
    } else if (completeness < 70) {
      insights.push({
        type: 'improvement',
        title: 'Profile Needs Enhancement',
        description: 'Adding more details to your profile will create more compelling resumes.',
        icon: <TrendingUp className="w-4 h-4" />,
        priority: 'medium',
        actionable: true
      });
    } else {
      insights.push({
        type: 'strength',
        title: 'Well-Rounded Profile',
        description: 'Your profile is comprehensive and will generate high-quality resumes.',
        icon: <CheckCircle2 className="w-4 h-4" />,
        priority: 'low'
      });
    }

    // Work experience insights
    const workExp = profile.work_experience || [];
    if (workExp.length === 0) {
      insights.push({
        type: 'improvement',
        title: 'Missing Work Experience',
        description: 'Add work experience to showcase your professional background.',
        icon: <Briefcase className="w-4 h-4" />,
        priority: 'high',
        actionable: true
      });
    } else if (workExp.length < 3) {
      insights.push({
        type: 'opportunity',
        title: 'Limited Work History',
        description: 'Consider adding internships, freelance work, or volunteer roles to strengthen your profile.',
        icon: <Users className="w-4 h-4" />,
        priority: 'medium',
        actionable: true
      });
    }

    // Education insights
    const education = profile.education || [];
    if (education.length === 0) {
      insights.push({
        type: 'improvement',
        title: 'Missing Education',
        description: 'Add your educational background to provide context for your qualifications.',
        icon: <BookOpen className="w-4 h-4" />,
        priority: 'medium',
        actionable: true
      });
    }

    // Skills insights
    const techSkills = profile.technical_skills || [];
    if (techSkills.length < 5) {
      insights.push({
        type: 'opportunity',
        title: 'Expand Technical Skills',
        description: 'Adding more technical skills will make your profile more competitive.',
        icon: <Code className="w-4 h-4" />,
        priority: 'medium',
        actionable: true
      });
    } else if (techSkills.length > 15) {
      insights.push({
        type: 'improvement',
        title: 'Too Many Skills Listed',
        description: 'Consider focusing on your top 10-15 most relevant technical skills.',
        icon: <Target className="w-4 h-4" />,
        priority: 'low',
        actionable: true
      });
    }

    // Professional summary insights
    if (!profile.professional_summary || profile.professional_summary.length < 50) {
      insights.push({
        type: 'improvement',
        title: 'Weak Professional Summary',
        description: 'A compelling professional summary is crucial for making a strong first impression.',
        icon: <Star className="w-4 h-4" />,
        priority: 'high',
        actionable: true
      });
    }

    // Certifications insights
    const certifications = profile.certifications || [];
    if (certifications.length === 0) {
      insights.push({
        type: 'opportunity',
        title: 'Consider Adding Certifications',
        description: 'Professional certifications can significantly boost your credibility.',
        icon: <Award className="w-4 h-4" />,
        priority: 'low',
        actionable: true
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const insights = generateInsights();
  const strengthsCount = insights.filter(i => i.type === 'strength').length;
  const improvementsCount = insights.filter(i => i.type === 'improvement').length;
  const opportunitiesCount = insights.filter(i => i.type === 'opportunity').length;
  const warningsCount = insights.filter(i => i.type === 'warning').length;

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-700 bg-green-50 border-green-200';
      case 'improvement': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'opportunity': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low': return <Badge variant="outline" className="text-xs">Low</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Profile Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-lg font-bold text-green-700">{strengthsCount}</div>
            <div className="text-xs text-green-600">Strengths</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-lg font-bold text-blue-700">{improvementsCount}</div>
            <div className="text-xs text-blue-600">Improvements</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-lg font-bold text-yellow-700">{opportunitiesCount}</div>
            <div className="text-xs text-yellow-600">Opportunities</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-lg font-bold text-red-700">{warningsCount}</div>
            <div className="text-xs text-red-600">Warnings</div>
          </div>
        </div>

        {/* Profile Strength Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className="text-sm text-muted-foreground">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {completeness < 50 ? 'Needs significant improvement' :
             completeness < 80 ? 'Good progress, keep enhancing' :
             'Excellent profile strength'}
          </div>
        </div>

        {/* Individual Insights */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {insights.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your profile looks great! No specific recommendations at this time.
              </AlertDescription>
            </Alert>
          ) : (
            insights.map((insight, index) => (
              <Alert key={index} className={getInsightColor(insight.type)}>
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start gap-2 flex-1">
                    {insight.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{insight.title}</span>
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <AlertDescription className="text-xs">
                        {insight.description}
                      </AlertDescription>
                    </div>
                  </div>
                  {insight.actionable && (
                    <Button variant="ghost" size="sm" className="text-xs ml-2">
                      Fix Now
                    </Button>
                  )}
                </div>
              </Alert>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {insights.some(i => i.actionable) && (
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Complete Profile
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Add Experience
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Update Skills
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};