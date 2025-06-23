
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Edit, Trash2, Eye, TrendingUp, Users, Award, BarChart3, Upload, Download } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";

export function TemplateManagement() {
  const { templates, toggleTemplate, deleteTemplate, addTemplate } = useTemplates();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    description: "",
    templateKey: "",
    isActive: true,
    atsOptimized: false,
    featured: false
  });

  // Calculate analytics
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.isActive).length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usage, 0);
  const averageUsage = Math.round(totalUsage / templates.length) || 0;
  const topTemplate = templates.reduce((top, t) => t.usage > top.usage ? t : top, templates[0] || { usage: 0, name: 'None' });

  const handleToggleTemplate = async (templateId: string) => {
    setIsProcessing(true);
    try {
      toggleTemplate(templateId);
      const template = templates.find(t => t.id === templateId);
      toast({ 
        title: "Template updated", 
        description: `${template?.name} ${template?.isActive ? 'disabled' : 'enabled'} successfully.`
      });
    } catch (error: any) {
      toast({ 
        title: "Update failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setIsProcessing(true);
    try {
      deleteTemplate(templateId);
      toast({ title: "Template deleted", description: "Template removed successfully." });
    } catch (error: any) {
      toast({ 
        title: "Delete failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.templateKey) {
      toast({ 
        title: "Missing fields", 
        description: "Please fill in all required fields.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      addTemplate(newTemplate);
      setNewTemplate({ 
        name: "", 
        category: "", 
        description: "", 
        templateKey: "", 
        isActive: true,
        atsOptimized: false,
        featured: false
      });
      setShowAddDialog(false);
      
      toast({ title: "Template added", description: "New template created successfully." });
    } catch (error: any) {
      toast({ 
        title: "Add failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportTemplates = () => {
    const exportData = templates.map(t => ({
      name: t.name,
      category: t.category,
      templateKey: t.templateKey,
      usage: t.usage,
      isActive: t.isActive
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Management System
            </CardTitle>
            <CardDescription>
              Comprehensive template management with analytics and bulk operations
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTemplates}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Template</DialogTitle>
                  <DialogDescription>
                    Create a new resume template for users to choose from
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Modern Professional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateKey">Template Key *</Label>
                    <Input
                      id="templateKey"
                      value={newTemplate.templateKey}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, templateKey: e.target.value }))}
                      placeholder="e.g., modern-professional"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Category *</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Creative">Creative</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="ATS-Friendly">ATS-Friendly</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this template's style and target audience"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={newTemplate.featured}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <span>Featured</span>
                    </Label>
                    <Label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={newTemplate.atsOptimized}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, atsOptimized: e.target.checked }))}
                      />
                      <span>ATS Optimized</span>
                    </Label>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTemplate} disabled={isProcessing}>
                      {isProcessing ? "Adding..." : "Add Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Templates</p>
                      <p className="text-2xl font-bold">{totalTemplates}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-2xl font-bold">{activeTemplates}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Total Usage</p>
                      <p className="text-2xl font-bold">{totalUsage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Avg. Usage</p>
                      <p className="text-2xl font-bold">{averageUsage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Bulk Upload
                </Button>
                <Button variant="outline" size="sm">
                  Enable All ATS Templates
                </Button>
                <Button variant="outline" size="sm">
                  Generate Usage Report
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No templates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{template.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{template.templateKey}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {template.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                            {template.atsOptimized && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">ATS</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {template.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{template.usage}</span>
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={template.isActive ? "secondary" : "default"}
                              onClick={() => handleToggleTemplate(template.id)}
                              disabled={isProcessing}
                            >
                              {template.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Template Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Most Popular Template</span>
                    <Badge>{topTemplate.name} ({topTemplate.usage} uses)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Template Categories</span>
                    <Badge>{[...new Set(templates.map(t => t.category))].length} categories</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>ATS-Optimized Templates</span>
                    <Badge>{templates.filter(t => t.atsOptimized).length} templates</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
