import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ATSStats {
  totalOrganizations: number;
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  newApplications: number;
  scheduledInterviews: number;
  pendingOffers: number;
  totalMembers: number;
}

export const useAdminATSStats = (isAdmin: boolean) => {
  return useQuery({
    queryKey: ["admin-ats-stats"],
    queryFn: async (): Promise<ATSStats> => {
      // Fetch organizations count
      const { count: orgCount } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true });

      // Fetch jobs with status breakdown
      const { data: jobs } = await supabase
        .from("jobs")
        .select("status");

      const activeJobs = jobs?.filter(j => j.status === "published").length || 0;
      const draftJobs = jobs?.filter(j => j.status === "draft").length || 0;
      const closedJobs = jobs?.filter(j => j.status === "closed").length || 0;

      // Fetch applications count
      const { data: applications } = await supabase
        .from("job_applications")
        .select("status");

      const newApplications = applications?.filter(a => a.status === "new").length || 0;

      // Fetch scheduled interviews
      const { count: interviewCount } = await supabase
        .from("interviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled");

      // Fetch pending offers
      const { count: offerCount } = await supabase
        .from("job_offers")
        .select("*", { count: "exact", head: true })
        .in("status", ["draft", "sent"]);

      // Fetch total members
      const { count: memberCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true });

      return {
        totalOrganizations: orgCount || 0,
        totalJobs: jobs?.length || 0,
        activeJobs,
        draftJobs,
        closedJobs,
        totalApplications: applications?.length || 0,
        newApplications,
        scheduledInterviews: interviewCount || 0,
        pendingOffers: offerCount || 0,
        totalMembers: memberCount || 0,
      };
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });
};
