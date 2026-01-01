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
  isNeoBrutalism?: boolean;
}

interface Insight {
  type: 'strength' | 'improvement' | 'opportunity' | 'warning';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
}

export const ProfileInsights: React.FC<ProfileInsightsProps> = ({ 
  profile, 
  completeness,
  isNeoBrutalism = false 
}) => {
  
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
    if (isNeoBrutalism) {
      switch (type) {
        case 'strength': return 'text-foreground bg-green-200 border-2 border-foreground';
        case 'improvement': return 'text-foreground bg-blue-200 border-2 border-foreground';
        case 'opportunity': return 'text-foreground bg-yellow-200 border-2 border-foreground';
        case 'warning': return 'text-foreground bg-red-200 border-2 border-foreground';
        default: return 'text-foreground bg-muted border-2 border-foreground';
      }
    }
    switch (type) {
      case 'strength': return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/30 dark:border-green-800';
      case 'improvement': return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/30 dark:border-blue-800';
      case 'opportunity': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800';
      case 'warning': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-800';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatColor = (type: string) => {
    if (isNeoBrutalism) {
      switch (type) {
        case 'strength': return 'bg-green-300 border-2 border-foreground';
        case 'improvement': return 'bg-blue-300 border-2 border-foreground';
        case 'opportunity': return 'bg-yellow-300 border-2 border-foreground';
        case 'warning': return 'bg-red-300 border-2 border-foreground';
        default: return 'bg-muted border-2 border-foreground';
      }
    }
    switch (type) {
      case 'strength': return 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800';
      case 'improvement': return 'bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800';
      case 'opportunity': return 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800';
      case 'warning': return 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800';
      default: return 'bg-muted border border-border';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (isNeoBrutalism) {
      switch (priority) {
        case 'high': return <Badge className="text-xs border-2 border-foreground bg-red-400 text-foreground font-bold">High</Badge>;
        case 'medium': return <Badge className="text-xs border-2 border-foreground bg-yellow-400 text-foreground font-bold">Medium</Badge>;
        case 'low': return <Badge className="text-xs border-2 border-foreground bg-muted text-foreground font-bold">Low</Badge>;
        default: return null;
      }
    }
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low': return <Badge variant="outline" className="text-xs">Low</Badge>;
      default: return null;
    }
  };

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-base ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
          <TrendingUp className="w-5 h-5" />
          Profile Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`text-center p-2 rounded-lg ${getStatColor('strength')}`}>
            <div className={`text-lg font-bold ${isNeoBrutalism ? 'text-foreground' : 'text-green-700 dark:text-green-300'}`}>{strengthsCount}</div>
            <div className={`text-xs ${isNeoBrutalism ? 'text-foreground font-medium' : 'text-green-600 dark:text-green-400'}`}>Strengths</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getStatColor('improvement')}`}>
            <div className={`text-lg font-bold ${isNeoBrutalism ? 'text-foreground' : 'text-blue-700 dark:text-blue-300'}`}>{improvementsCount}</div>
            <div className={`text-xs ${isNeoBrutalism ? 'text-foreground font-medium' : 'text-blue-600 dark:text-blue-400'}`}>To Improve</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getStatColor('opportunity')}`}>
            <div className={`text-lg font-bold ${isNeoBrutalism ? 'text-foreground' : 'text-yellow-700 dark:text-yellow-300'}`}>{opportunitiesCount}</div>
            <div className={`text-xs ${isNeoBrutalism ? 'text-foreground font-medium' : 'text-yellow-600 dark:text-yellow-400'}`}>Opportunities</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getStatColor('warning')}`}>
            <div className={`text-lg font-bold ${isNeoBrutalism ? 'text-foreground' : 'text-red-700 dark:text-red-300'}`}>{warningsCount}</div>
            <div className={`text-xs ${isNeoBrutalism ? 'text-foreground font-medium' : 'text-red-600 dark:text-red-400'}`}>Warnings</div>
          </div>
        </div>

        {/* Profile Strength Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className={`text-sm font-bold ${isNeoBrutalism ? 'bg-primary text-primary-foreground px-2 py-0.5' : 'text-muted-foreground'}`}>
              {completeness}%
            </span>
          </div>
          <Progress value={completeness} className={`h-2 ${isNeoBrutalism ? 'border border-foreground' : ''}`} />
          <div className={`text-xs ${isNeoBrutalism ? 'font-medium' : 'text-muted-foreground'}`}>
            {completeness < 50 ? 'Needs significant improvement' :
             completeness < 80 ? 'Good progress, keep enhancing' :
             'Excellent profile strength'}
          </div>
        </div>

        {/* Individual Insights - Show top 3 */}
        <div className="space-y-2">
          {insights.length === 0 ? (
            <Alert className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your profile looks great! No specific recommendations at this time.
              </AlertDescription>
            </Alert>
          ) : (
            insights.slice(0, 3).map((insight, index) => (
              <Alert key={index} className={getInsightColor(insight.type)}>
                <div className="flex items-start gap-2">
                  {insight.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`font-medium text-sm ${isNeoBrutalism ? 'uppercase' : ''}`}>{insight.title}</span>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <AlertDescription className="text-xs">
                      {insight.description}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
