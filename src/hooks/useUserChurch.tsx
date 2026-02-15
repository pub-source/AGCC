import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserChurch {
  churchId: string | null;
  churchName: string | null;
  role: string | null;
  status: string | null;
  isLoading: boolean;
  isApproved: boolean;
  isPastor: boolean;
  isAdmin: boolean;
  isWorshipTeam: boolean;
}

export function useUserChurch() {
  const [userChurch, setUserChurch] = useState<UserChurch>({
    churchId: null,
    churchName: null,
    role: null,
    status: null,
    isLoading: true,
    isApproved: false,
    isPastor: false,
    isAdmin: false,
    isWorshipTeam: false,
  });

  useEffect(() => {
    fetchUserChurch();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserChurch();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserChurch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setUserChurch({
        churchId: null,
        churchName: null,
        role: null,
        status: null,
        isLoading: false,
        isApproved: false,
        isPastor: false,
        isAdmin: false,
        isWorshipTeam: false,
      });
      return;
    }

    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select(`
        role,
        status,
        church_id,
        churches:church_id (
          id,
          name
        )
      `)
      .eq("user_id", session.user.id)
      .single();

    if (error || !roleData) {
      setUserChurch({
        churchId: null,
        churchName: null,
        role: null,
        status: null,
        isLoading: false,
        isApproved: false,
        isPastor: false,
        isAdmin: false,
        isWorshipTeam: false,
      });
      return;
    }

    const isApproved = roleData.status === "approved";
    const church = roleData.churches as { id: string; name: string } | null;

    setUserChurch({
      churchId: roleData.church_id,
      churchName: church?.name || null,
      role: roleData.role,
      status: roleData.status,
      isLoading: false,
      isApproved,
      isPastor: roleData.role === "pastor" && isApproved,
      isAdmin: roleData.role === "admin" && isApproved,
      isWorshipTeam: roleData.role === "worship_team" && isApproved,
    });
  };

  return userChurch;
}
