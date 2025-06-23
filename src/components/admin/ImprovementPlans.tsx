
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Palette, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

const improvementPlans = [
  {
    id: 1,
    title: "AI-Powered Resume Analysis",
    description: "Implement AI to analyze resumes and provide personalized improvement suggestions",
    category: "AI/ML",
    priority: "High",
    status: "Planning",
    progress: 15,
    impact: "High",
    effort: "Large",
    timeline: "Q2 2024",
    features: [
      "ATS optimization scoring",
      "Content improvement suggestions",
      "Industry-specific recommendations",
      "Keyword optimization"
    ]
  },
  {
    id: 2,
    title: "Advanced Template Customization",
    description: "Enhanced template editor with drag-and-drop sections and real-time preview",
    category: "UI/UX",
    priority: "High",
    status: "In Progress",
    progress: 40,
    impact: "High",
    effort: "Medium",
    timeline: "Q1 2024",
    features: [
      "Drag-and-drop section reordering",
      "Color scheme customization",
      "Font selection",
      "Layout variations"
    ]
  },
  {
    id: 3,
    title: "Resume Analytics Dashboard",
    description: "Comprehensive analytics for users to track resume performance",
    category: "Analytics",
    priority: "Medium",
    status: "Planning",
    progress: 5,
    impact: "Medium",
    effort: "Medium",
    timeline: "Q2 2024",
    features: [
      "View tracking",
      "Download analytics",
      "Application tracking",
      "Success metrics"
    ]
  },
  {
    id: 4,
    title: "Multi-language Support",
    description: "Internationalization for global user base",
    category: "Localization",
    priority: "Medium",
    status: "Planning",
    progress: 0,
    impact: "High",
    effort: "Large",
    timeline: "Q3 2024",
    features: [
      "Spanish localization",
      "French localization",
      "German localization",
      "RTL language support"
    ]
  },
  {
    id: 5,
    title: "Team Collaboration Features",
    description: "Allow teams to collaborate on resumes and share templates",
    category: "Collaboration",
    priority: "Low",
    status: "Backlog",
    progress: 0,
    impact: "Medium",
    effort: "Large",
    timeline: "Q4 2024",
    features: [
      "Team workspaces",
      "Comment system",
      "Version control",
      "Template sharing"
    ]
  },
  {
    id: 6,
    title: "Enhanced Security & Privacy",
    description: "Advanced security features and privacy controls",
    category: "Security",
    priority: "High",
    status: "In Progress",
    progress: 60,
    impact: "High",
    effort: "Medium",
    timeline: "Q1 2024",
    features: [
      "Two-factor authentication",
      "Data encryption",
      "Privacy controls",
      "GDPR compliance"
    ]
  },
  {
    id: 7,
    title: "Mobile App Development",
    description: "Native mobile applications for iOS and Android",
    category: "Mobile",
    priority: "Medium",
    status: "Planning",
    progress: 10,
    impact: "High",
    effort: "Large",
    timeline: "Q3 2024",
    features: [
      "iOS native app",
      "Android native app",
      "Offline editing",
      "Push notifications"
    ]
  },
  {
    id: 8,
    title: "Integration Ecosystem",
    description: "Integrate with popular job boards and professional networks",
    category: "Integrations",
    priority: "Medium",
    status: "Planning",
    progress: 0,
    impact: "High",
    effort: "Medium",
    timeline: "Q2 2024",
    features: [
      "LinkedIn integration",
      "Indeed integration",
      "GitHub portfolio sync",
      "Job board auto-apply"
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "In Progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "Planning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "Backlog":
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function ImprovementPlans() {
  const totalPlans = improvementPlans.length;
  const inProgress = improvementPlans.filter(p => p.status === "In Progress").length;
  const completed = improvementPlans.filter(p => p.status === "Completed").length;
  const avgProgress = Math.round(improvementPlans.reduce((sum, p) => sum + p.progress, 0) / totalPlans);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Product Improvement Plans
        </CardTitle>
        <CardDescription>
          Strategic roadmap for SaaS product enhancements and feature development
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Plans</p>
                      <p className="text-2xl font-bold">{totalPlans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold">{inProgress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold">{completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Avg Progress</p>
                      <p className="text-2xl font-bold">{avgProgress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Priority Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">High Priority Features</h3>
              <div className="grid gap-4">
                {improvementPlans
                  .filter(plan => plan.priority === "High")
                  .map((plan) => (
                    <Card key={plan.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{plan.title}</h4>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusIcon(plan.status)}
                            <Badge className={getPriorityColor(plan.priority)}>
                              {plan.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex-1 mr-4">
                            <Progress value={plan.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{plan.progress}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid gap-4">
              {improvementPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{plan.title}</h3>
                          {getStatusIcon(plan.status)}
                          <Badge variant="outline">{plan.status}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{plan.description}</p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Timeline:</span>
                            <span>{plan.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Impact:</span>
                            <Badge variant="outline">{plan.impact}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Effort:</span>
                            <Badge variant="outline">{plan.effort}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getPriorityColor(plan.priority)}>
                          {plan.priority} Priority
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="text-lg font-semibold">{plan.progress}%</div>
                        </div>
                      </div>
                    </div>
                    <Progress value={plan.progress} className="mb-4" />
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Key Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              {["AI/ML", "UI/UX", "Security", "Mobile"].map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {category === "AI/ML" && <Zap className="h-5 w-5" />}
                    {category === "UI/UX" && <Palette className="h-5 w-5" />}
                    {category === "Security" && <Shield className="h-5 w-5" />}
                    {category === "Mobile" && <Users className="h-5 w-5" />}
                    {category} Features
                  </h3>
                  <div className="grid gap-3">
                    {improvementPlans
                      .filter(plan => plan.category === category)
                      .map((plan) => (
                        <Card key={plan.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{plan.title}</h4>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(plan.priority)}>
                                  {plan.priority}
                                </Badge>
                                <span className="text-sm font-medium">{plan.progress}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progress by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {["AI/ML", "UI/UX", "Security", "Mobile", "Analytics"].map((category) => {
                    const categoryPlans = improvementPlans.filter(p => p.category === category);
                    const avgProgress = categoryPlans.length > 0 
                      ? Math.round(categoryPlans.reduce((sum, p) => sum + p.progress, 0) / categoryPlans.length)
                      : 0;
                    
                    return (
                      <div key={category} className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm">{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timeline Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"].map((quarter) => {
                    const quarterPlans = improvementPlans.filter(p => p.timeline === quarter);
                    
                    return (
                      <div key={quarter} className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{quarter}</span>
                          <span className="text-sm">{quarterPlans.length} plans</span>
                        </div>
                        <div className="flex gap-1">
                          {quarterPlans.map((plan) => (
                            <div 
                              key={plan.id}
                              className={`h-2 flex-1 rounded ${
                                plan.priority === "High" ? "bg-red-300" :
                                plan.priority === "Medium" ? "bg-yellow-300" : "bg-green-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
