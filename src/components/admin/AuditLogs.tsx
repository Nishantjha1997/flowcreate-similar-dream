import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { 
  Search, RefreshCcw, Activity, Building2, Briefcase, Users, FileText
} from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  organization_id: string;
  metadata: any;
  created_at: string;
  org_name?: string;
}

interface AuditLogsProps {
  isAdmin: boolean;
}

export const AuditLogs = ({ isAdmin }: AuditLogsProps) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    loadLogs();
  }, [isAdmin]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ats_activities')
        .select('*, organization:organizations(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs((data || []).map((log: any) => ({
        ...log,
        org_name: log.organization?.name || 'Unknown',
      })));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'organization': return <Building2 className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'application': return <FileText className="h-4 w-4" />;
      case 'member': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-500/10 text-green-700 dark:text-green-400';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-500/10 text-red-700 dark:text-red-400';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    return 'bg-muted text-muted-foreground';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.org_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const uniqueEntityTypes = [...new Set(logs.map(l => l.entity_type))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-1">Audit Logs & Activity Feed</h3>
        <p className="text-sm text-muted-foreground">Track all actions across organizations</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueEntityTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadLogs}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No audit logs found</p>
            <p className="text-sm">Activity will appear here as users interact with the ATS</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded bg-muted">
                      {getEntityIcon(log.entity_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                        <Badge variant="outline">{log.entity_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Organization: <span className="font-medium text-foreground">{log.org_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User: {log.user_id.slice(0, 8)}... • Entity: {log.entity_id.slice(0, 8)}...
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.metadata).slice(0, 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
