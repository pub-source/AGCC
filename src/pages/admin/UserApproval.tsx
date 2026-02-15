import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, User, Calendar, ArrowLeft, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type RoleStatus = "pending" | "approved" | "rejected";

interface ChurchInfo {
  id: string;
  name: string;
}

interface PendingUser {
  id: string;
  user_id: string;
  role: string;
  status: RoleStatus;
  created_at: string;
  church_id: string | null;
  profile?: {
    full_name: string | null;
    email?: string;
  };
  church?: ChurchInfo | null;
  email?: string;
}

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [churches, setChurches] = useState<ChurchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChurch, setFilterChurch] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    user: PendingUser | null;
    action: "approve" | "reject";
  }>({ open: false, user: null, action: "approve" });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Check admin status
      const { data: adminCheck } = await supabase
        .from("user_roles")
        .select("role, status")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .eq("status", "approved")
        .single();

      if (!adminCheck) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      // Fetch churches
      const { data: churchData } = await supabase
        .from("churches")
        .select("id, name")
        .order("name");
      
      setChurches(churchData || []);

      // Fetch all user roles with church info
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          churches:church_id (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all users
      const userIds = roles?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Merge profiles with roles
      const usersWithProfiles = roles?.map(role => ({
        ...role,
        profile: profiles?.find(p => p.user_id === role.user_id) || null,
        church: role.churches as ChurchInfo | null,
      })) || [];

      setPendingUsers(usersWithProfiles);
    } catch (error: any) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.user) return;
    
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("user_roles")
        .update({
          status: actionDialog.action === "approve" ? "approved" : "rejected",
          reviewed_by: session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", actionDialog.user.id);

      if (error) throw error;

      toast.success(
        actionDialog.action === "approve"
          ? `${actionDialog.user.profile?.full_name || "User"}'s role has been approved`
          : `${actionDialog.user.profile?.full_name || "User"}'s role request has been declined`
      );

      fetchData();
      setActionDialog({ open: false, user: null, action: "approve" });
    } catch (error: any) {
      toast.error("Failed to process request");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: RoleStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      member: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pastor: "bg-primary/20 text-primary border-primary/30",
      worship_team: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      admin: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    };
    return (
      <Badge variant="outline" className={colors[role] || colors.member}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  const filteredUsers = filterChurch === "all" 
    ? pendingUsers 
    : pendingUsers.filter(u => u.church_id === filterChurch);

  const pendingCount = filteredUsers.filter(u => u.status === "pending").length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  User Approval
                </h1>
                <p className="text-muted-foreground text-lg">
                  Review and manage user role requests across all churches
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={filterChurch} onValueChange={setFilterChurch}>
                  <SelectTrigger className="w-48">
                    <Church className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by church" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Churches</SelectItem>
                    {churches.map(church => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pendingCount > 0 && (
                  <div className="glass-card px-6 py-4 text-center">
                    <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>User</TableHead>
                  <TableHead>Church</TableHead>
                  <TableHead>Role Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.profile?.full_name || "Unknown User"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.church ? (
                          <div className="flex items-center gap-2">
                            <Church className="h-4 w-4 text-primary" />
                            <span>{user.church.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => setActionDialog({ open: true, user, action: "approve" })}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => setActionDialog({ open: true, user, action: "reject" })}
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {user.status === "approved" ? "✓ Approved" : "✗ Declined"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" ? "Approve Role Request" : "Decline Role Request"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "approve"
                ? `Are you sure you want to approve ${actionDialog.user?.profile?.full_name || "this user"}'s request for the ${actionDialog.user?.role?.replace("_", " ")} role at ${actionDialog.user?.church?.name || "their church"}?`
                : `Are you sure you want to decline ${actionDialog.user?.profile?.full_name || "this user"}'s request for the ${actionDialog.user?.role?.replace("_", " ")} role?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, user: null, action: "approve" })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === "approve" ? "hero" : "destructive"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? "Processing..." : actionDialog.action === "approve" ? "Approve" : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
