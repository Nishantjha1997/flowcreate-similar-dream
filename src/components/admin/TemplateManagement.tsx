
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
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  usage: number;
  createdAt: string;
}

export function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Modern Professional",
      category: "Professional",
      description: "Clean, sleek design with contemporary elements",
      isActive: true,
      usage: 245,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Executive Classic",
      category: "Traditional",
      description: "Traditional layout that stands the test of time",
      isActive: true,
      usage: 189,
      createdAt: "2024-01-12"
    },
    {
      id: "3",
      name: "Creative Portfolio",
      category: "Design",
      description: "Eye-catching design for creative professionals",
      isActive: false,
      usage: 67,
      createdAt: "2024-01-10"
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleToggleTemplate = async (templateId: string) => {
    setIsProcessing(true);
    try {
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, isActive: !t.isActive } : t
      ));
      
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
      setTemplates(prev => prev.filter(t => t.id !== templateId));
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
    if (!newTemplate.name || !newTemplate.category) {
      toast({ 
        title: "Missing fields", 
        description: "Please fill in all required fields.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      const template: Template = {
        id: (templates.length + 1).toString(),
        name: newTemplate.name,
        category: newTemplate.category,
        description: newTemplate.description,
        isActive: true,
        usage: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: "", category: "", description: "" });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Management
            </CardTitle>
            <CardDescription>
              Manage resume templates, add new ones, and control availability
            </CardDescription>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Template</DialogTitle>
                <DialogDescription>
                  Create a new resume template for users to choose from
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Modern Professional"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateCategory">Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
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
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{template.usage} uses</TableCell>
                    <TableCell>{template.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
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
      </CardContent>
    </Card>
  );
}
