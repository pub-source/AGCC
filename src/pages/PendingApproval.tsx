import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type RoleStatus = "pending" | "approved" | "rejected";

interface UserRoleData {
  role: string;
  status: RoleStatus;
}

export default function PendingApproval() {
  const [user, setUser] = useState<User | null>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Fetch user role status
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, status")
        .eq("user_id", session.user.id)
        .single();

      if (roles) {
        setRoleData(roles as UserRoleData);
        
        // If approved, redirect to dashboard
        if (roles.status === "approved") {
          navigate("/dashboard");
          return;
        }
      }

      setLoading(false);
    };

    checkStatus();

    // Subscribe to changes
    const channel = supabase
      .channel('role-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_roles',
        },
        (payload) => {
          const newData = payload.new as UserRoleData;
          setRoleData(newData);
          if (newData.status === "approved") {
            navigate("/dashboard");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isRejected = roleData?.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-dark/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8 md:p-10 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isRejected 
              ? "bg-gradient-to-br from-destructive to-red-700" 
              : "bg-gradient-to-br from-amber-500 to-amber-600"
          }`}>
            {isRejected ? (
              <XCircle className="h-10 w-10 text-white" />
            ) : (
              <Clock className="h-10 w-10 text-white" />
            )}
          </div>

          {/* Header */}
          <h1 className="font-serif text-3xl font-bold mb-4">
            {isRejected ? "Role Request Declined" : "Pending Approval"}
          </h1>
          
          {isRejected ? (
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Unfortunately, your request for the <span className="text-foreground font-medium capitalize">{roleData?.role?.replace("_", " ")}</span> role was not approved. Please contact the church administrator for more information.
            </p>
          ) : (
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your account has been verified! Your request for the <span className="text-foreground font-medium capitalize">{roleData?.role?.replace("_", " ")}</span> role is currently under review by our administrators.
            </p>
          )}

          {/* Status */}
          {!isRejected && (
            <div className="bg-secondary/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Awaiting Admin Review</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We thoroughly review each role request to ensure proper access control. You'll be notified once your request is processed.
              </p>
            </div>
          )}

          {/* User info */}
          <div className="bg-secondary/30 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-muted-foreground mb-1">Logged in as</p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div className="space-y-4">
            {isRejected ? (
              <Button variant="hero" className="w-full" asChild>
                <Link to="/register">Request Different Role</Link>
              </Button>
            ) : (
              <Button variant="glass" className="w-full" onClick={() => window.location.reload()}>
                <Clock className="h-4 w-4" />
                Check Status
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
