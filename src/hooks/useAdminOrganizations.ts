import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  companySize: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  memberCount: number;
  jobCount: number;
  applicationCount: number;
}

export const useAdminOrganizations = (isAdmin: boolean) => {
  return useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async (): Promise<AdminOrganization[]> => {
      // Fetch all organizations
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgsError) throw orgsError;

      if (!orgs || orgs.length === 0) return [];

      // Fetch member counts per organization
      const { data: members } = await supabase
        .from("organization_members")
        .select("organization_id");

      // Fetch job counts per organization
      const { data: jobs } = await supabase
        .from("jobs")
        .select("organization_id");

      // Fetch application counts per organization (via jobs)
      const { data: applications } = await supabase
        .from("job_applications")
        .select("job_id, jobs!inner(organization_id)");

      // Count members per org
      const memberCounts = members?.reduce((acc, m) => {
        acc[m.organization_id] = (acc[m.organization_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Count jobs per org
      const jobCounts = jobs?.reduce((acc, j) => {
        acc[j.organization_id] = (acc[j.organization_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Count applications per org
      const appCounts = applications?.reduce((acc, a) => {
        const orgId = (a.jobs as { organization_id: string })?.organization_id;
        if (orgId) {
          acc[orgId] = (acc[orgId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return orgs.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        industry: org.industry,
        companySize: org.company_size,
        logoUrl: org.logo_url,
        websiteUrl: org.website_url,
        createdAt: org.created_at,
        memberCount: memberCounts[org.id] || 0,
        jobCount: jobCounts[org.id] || 0,
        applicationCount: appCounts[org.id] || 0,
      }));
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });
};
